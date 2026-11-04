const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createList,
  getListSummary,
  listUserLists,
  normalizeListEmoji,
  normalizeListName,
  normalizeQuantity,
  updateListMetadata,
  upsertListItem,
} = require("../src/model/shopping-list-model");
const { listStores } = require("../src/model/catalog-model");
const { calculateStoreRoute, shortestPath } = require("../src/model/route-model");

test("valida nome, emoji e quantidade da lista", () => {
  assert.equal(normalizeListName("  Compra da semana  "), "Compra da semana");
  assert.equal(normalizeListName(""), null);
  assert.equal(normalizeListEmoji(" 🛍️ "), "🛍️");
  assert.equal(normalizeListEmoji(""), null);
  assert.equal(normalizeQuantity(2), 2);
  assert.equal(normalizeQuantity(0), null);
  assert.equal(normalizeQuantity("2.5"), null);
});

test("persiste e retorna o emoji selecionado ao criar e listar listas", async () => {
  const capturedParams = [];
  const pool = {
    async query(sql, params) {
      if (sql.includes("ALTER TABLE shopping_list")) {
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO shopping_list")) {
        capturedParams.push(params);
        return {
          rows: [
            {
              id: "list-emoji-1",
              name: params[2],
              emoji: params[3],
              storeId: params[1],
              status: "confirmed",
            },
          ],
        };
      }
      if (sql.includes("FROM shopping_list l")) {
        return {
          rows: [
            {
              id: "list-emoji-1",
              name: "Feira de sábado",
              emoji: "🍎",
              storeId: "store-1",
              storeName: "Mercado Aurora",
              itemCount: 4,
              productCount: 2,
              total: "25.00",
              hasLocationWarning: false,
              items: [],
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const created = await createList(pool, "owner-1", "store-1", "Feira de sábado", "🍎");
  assert.equal(created.name, "Feira de sábado");
  assert.equal(created.emoji, "🍎");
  assert.deepEqual(capturedParams[0], ["owner-1", "store-1", "Feira de sábado", "🍎"]);

  const lists = await listUserLists(pool, "owner-1");
  assert.equal(lists.length, 1);
  assert.equal(lists[0].emoji, "🍎");
});

test("lista filiais cadastradas e permite atualizar o supermercado (storeId) de uma lista existente", async () => {
  const capturedUpdates = [];
  const pool = {
    async query(sql, params) {
      if (sql.includes("ALTER TABLE shopping_list") || sql.includes("INSERT INTO filial") || sql.includes("INSERT INTO produto")) {
        return { rows: [] };
      }
      if (sql.includes("SELECT id, nome AS name, endereco")) {
        return {
          rows: [
            {
              id: "00000000-0000-0000-0000-000000000001",
              name: "Mercado Aurora",
              endereco: { logradouro: "Rua da Consolação, 1240", cidade: "São Paulo", uf: "SP" },
            },
            {
              id: "00000000-0000-0000-0000-000000000002",
              name: "Supermercado Sakura",
              endereco: { logradouro: "Rua São Joaquim, 120", cidade: "São Paulo", uf: "SP" },
            },
          ],
        };
      }
      if (sql.includes("SELECT id FROM filial WHERE id = $1")) {
        return params[0] === "00000000-0000-0000-0000-000000000002"
          ? { rows: [{ id: params[0] }] }
          : { rows: [] };
      }
      if (sql.includes("UPDATE shopping_list")) {
        capturedUpdates.push(params);
        return {
          rows: [
            {
              id: params[0],
              name: "Compra da semana",
              emoji: "🛍️",
              storeId: params[5],
              status: "confirmed",
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const stores = await listStores(pool);
  assert.equal(stores.length, 2);
  assert.equal(stores[0].name, "Mercado Aurora");
  assert.equal(stores[1].name, "Supermercado Sakura");

  const updated = await updateListMetadata(pool, "list-1", "owner-1", {
    storeId: "00000000-0000-0000-0000-000000000002",
  });
  assert.equal(updated.list.storeId, "00000000-0000-0000-0000-000000000002");
  assert.equal(capturedUpdates[0][5], "00000000-0000-0000-0000-000000000002");

  const notFoundStore = await updateListMetadata(pool, "list-1", "owner-1", {
    storeId: "99999999-9999-9999-9999-999999999999",
  });
  assert.equal(notFoundStore.status, 404);
});

test("impede adicionar produto fora de estoque", async () => {
  const pool = {
    async query(sql) {
      if (sql.includes("FROM produto")) {
        return { rows: [{ id: 8, price: 4.5, inStock: false }] };
      }
      throw new Error("A consulta de inclusão não deveria ser executada.");
    },
  };

  const result = await upsertListItem(pool, "list-1", "owner-1", 8, 1);

  assert.equal(result.status, 409);
  assert.match(result.error, /fora de estoque/i);
});

test("resume total e alerta de localização ausente", async () => {
  const pool = {
    async query(sql) {
      if (sql.includes("ALTER TABLE shopping_list")) {
        return { rows: [] };
      }
      assert.match(sql, /shopping_list/);
      return {
        rows: [{
          id: "list-1",
          name: "Compra da semana",
          emoji: "🛍️",
          storeId: "store-1",
          storeName: "Mercado Aurora",
          itemCount: 3,
          productCount: 2,
          total: "42.50",
          hasLocationWarning: true,
        }],
      };
    },
  };

  const summary = await getListSummary(pool, "list-1", "owner-1");

  assert.equal(summary.total, 42.5);
  assert.equal(summary.itemCount, 3);
  assert.equal(summary.emoji, "🛍️");
  assert.equal(summary.hasLocationWarning, true);
  assert.match(summary.locationWarning, /fora da rota/i);
});

test("calcula o menor caminho entre nós do grafo", () => {
  const nodes = new Map([
    ["1", { id: 1 }],
    ["2", { id: 2 }],
    ["3", { id: 3 }],
  ]);
  const adjacency = new Map([
    ["1", [{ to: "2", distance: 4 }, { to: "3", distance: 20 }]],
    ["2", [{ to: "3", distance: 3 }]],
  ]);

  assert.deepEqual(shortestPath(adjacency, nodes, "1", "3"), {
    path: ["1", "2", "3"],
    distance: 7,
  });
});

test("reordena paradas pelo caminho mais curto a partir da entrada ou do corredor atual", async () => {
  const pool = {
    async query(sql) {
      if (sql.includes("FROM filial")) {
        return { rows: [{ id: "store-1", name: "Mercado Aurora" }] };
      }
      if (sql.includes("FROM produto p")) {
        return {
          rows: [
            { productId: 10, name: "Banana prata", category: "Hortifruti", size: "1 kg", nodeId: 4, aisle: "Hortifruti", shelf: "Setor A" },
            { productId: 20, name: "Pão de forma", category: "Padaria", size: "1 un.", nodeId: 2, aisle: "Corredor 1", shelf: "Prateleira central" },
            { productId: 30, name: "Leite integral 1 L", category: "Laticínios", size: "1 un.", nodeId: 3, aisle: "Corredor 3", shelf: "Prateleira central" },
          ],
        };
      }
      if (sql.includes("FROM no_grafo")) {
        return {
          rows: [
            { id: 1, x: 0, y: 0, tipo: "entrada", nome: "Entrada" },
            { id: 2, x: 10, y: 20, tipo: "corredor", nome: "Corredor 1" },
            { id: 3, x: 30, y: 15, tipo: "corredor", nome: "Corredor 3" },
            { id: 4, x: 40, y: 30, tipo: "corredor", nome: "Hortifruti" },
          ],
        };
      }
      if (sql.includes("FROM aresta")) {
        return {
          rows: [
            { from: 1, to: 2, distance: 5, bidirectional: true },
            { from: 2, to: 3, distance: 8, bidirectional: true },
            { from: 3, to: 4, distance: 6, bidirectional: true },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const fromEntrance = await calculateStoreRoute(pool, "store-1", [
    { productId: 10, quantity: 1 },
    { productId: 30, quantity: 1 },
    { productId: 20, quantity: 1 },
  ]);
  assert.deepEqual(
    fromEntrance.route.stops.map((s) => s.aisle),
    ["Corredor 1", "Corredor 3", "Hortifruti"],
  );

  const fromHorti = await calculateStoreRoute(
    pool,
    "store-1",
    [
      { productId: 10, quantity: 1 },
      { productId: 30, quantity: 1 },
      { productId: 20, quantity: 1 },
    ],
    { startAisle: "Hortifruti" },
  );
  assert.deepEqual(
    fromHorti.route.stops.map((s) => s.aisle),
    ["Hortifruti", "Corredor 3", "Corredor 1"],
  );

  const afterPassedStops = await calculateStoreRoute(
    pool,
    "store-1",
    [
      { productId: 10, quantity: 1 },
      { productId: 30, quantity: 1 },
      { productId: 20, quantity: 1 },
    ],
    {
      startAisle: "Hortifruti",
      excludedProductIds: [10],
    },
  );
  assert.deepEqual(
    afterPassedStops.route.stops.map((stop) => stop.productId),
    [30, 20],
  );
  assert.deepEqual(afterPassedStops.route.excludedProductIds, [10]);
});
