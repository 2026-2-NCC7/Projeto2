const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getListSummary,
  normalizeListName,
  normalizeQuantity,
  upsertListItem,
} = require("../src/model/shopping-list-model");
const { shortestPath } = require("../src/model/route-model");

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
