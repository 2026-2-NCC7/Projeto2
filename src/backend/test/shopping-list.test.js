const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getListSummary,
  normalizeListName,
  normalizeQuantity,
  upsertListItem,
} = require("../src/model/shopping-list-model");
const { calculateStoreRoute, shortestPath } = require("../src/model/route-model");

test("valida nome e quantidade da lista", () => {
  assert.equal(normalizeListName("  Compra da semana  "), "Compra da semana");
  assert.equal(normalizeListName(""), null);
  assert.equal(normalizeQuantity(2), 2);
  assert.equal(normalizeQuantity(0), null);
  assert.equal(normalizeQuantity("2.5"), null);
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
      assert.match(sql, /shopping_list/);
      return {
        rows: [{
          id: "list-1",
          name: "Compra da semana",
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
});
