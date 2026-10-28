const assert = require("node:assert/strict");
const test = require("node:test");
const { createAccessToken } = require("../src/utils/auth");
const { findProducts } = require("../src/model/catalog-model");
const { createServer } = require("../src/server");

const jwtSecret = "test-secret-with-at-least-32-bytes-long";
const storeA = "00000000-0000-0000-0000-000000000001";
const storeB = "11111111-1111-1111-1111-111111111111";
const token = createAccessToken({ id: "admin-id", role: "admin" }, jwtSecret);

async function withServer(pool, run) {
  const server = createServer({ pool, jwtSecret });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("busca produtos com tolerância a erro e limite parametrizado", async () => {
  let query;
  const pool = {
    async query(sql, values) {
      query = { sql, values };
      return { rows: [{ id: 3, name: "Arroz Tio João 5 kg", inStock: true }] };
    },
  };

  const products = await findProducts(pool, storeA, "aroz tio", 20);

  assert.equal(products[0].name, "Arroz Tio João 5 kg");
  assert.match(query.sql, /similarity\(unaccent\(lower\(p\.nome\)\)/);
  assert.equal(query.values[0], storeA);
  assert.equal(query.values[1], "aroz tio");
  assert.equal(query.values[2], 20);
});

test("retorna o estado de estoque para impedir adição no mobile", async () => {
  const pool = {
    async query() {
      return { rows: [{ id: 4, name: "Feijão carioca 1 kg", inStock: false }] };
    },
  };

  const products = await findProducts(pool, storeA, "feijao", 20);

  assert.equal(products[0].inStock, false);
});

test("isola os produtos pelo storeId", async () => {
  const pool = {
    async query(sql, values) {
      if (sql.includes("FROM filial")) {
        return { rows: [{ id: values[0], name: values[0] === storeA ? "Mercado Aurora" : "Mercado Aurora - Centro" }] };
      }
      return {
        rows: [{
          id: values[0] === storeA ? 1 : 2,
          name: values[0] === storeA ? "Produto da loja A" : "Produto da loja B",
          inStock: true,
        }],
      };
    },
  };

  await withServer(pool, async (baseUrl) => {
    const headers = { Authorization: `Bearer ${token}` };
    const responseA = await fetch(`${baseUrl}/stores/${storeA}/products?q=produto`, { headers });
    const responseB = await fetch(`${baseUrl}/stores/${storeB}/products?q=produto`, { headers });

    assert.equal(responseA.status, 200);
    assert.equal(responseB.status, 200);
    assert.equal((await responseA.json()).products[0].name, "Produto da loja A");
    assert.equal((await responseB.json()).products[0].name, "Produto da loja B");
  });
});

test("valida a loja do QR Code antes de iniciar o catálogo", async () => {
  const pool = {
    async query(sql, values) {
      assert.match(sql, /FROM filial/);
      return values[0] === storeA
        ? { rows: [{ id: storeA, name: "Mercado Aurora" }] }
        : { rows: [] };
    },
  };

  await withServer(pool, async (baseUrl) => {
    const headers = { Authorization: "Bearer " + token };
    const valid = await fetch(`${baseUrl}/stores/${storeA}`, { headers });
    const invalid = await fetch(`${baseUrl}/stores/${storeB}`, { headers });

    assert.equal(valid.status, 200);
    assert.deepEqual((await valid.json()).store, { id: storeA, name: "Mercado Aurora" });
    assert.equal(invalid.status, 404);
  });
});

test("permite acesso sem cadastro pelo WebApp (QR Code) ao catálogo e cálculo de rota da loja", async () => {
  const pool = {
    async query(sql, values) {
      if (sql.includes("FROM filial")) {
        return values[0] === storeA
          ? { rows: [{ id: storeA, name: "Mercado Aurora" }] }
          : { rows: [] };
      }
      if (sql.includes("FROM produto p") && sql.includes("ANY")) {
        return {
          rows: [
            {
              productId: 1,
              name: "Leite integral 1 L",
              category: "Laticínios",
              size: "1 un.",
              nodeId: 2,
              aisle: "Corredor 3",
              shelf: "Prateleira central",
            },
          ],
        };
      }
      if (sql.includes("FROM no_grafo")) {
        return {
          rows: [
            { id: 1, x: 0, y: 0, tipo: "entrada", nome: "Entrada" },
            { id: 2, x: 10, y: 10, tipo: "corredor", nome: "Corredor 3" },
          ],
        };
      }
      if (sql.includes("FROM aresta")) {
        return {
          rows: [{ from: 1, to: 2, distance: 12, bidirectional: true }],
        };
      }
      return {
        rows: [{ id: 1, name: "Leite integral 1 L", price: 5.49, inStock: true }],
      };
    },
  };

  await withServer(pool, async (baseUrl) => {
    const storeRes = await fetch(`${baseUrl}/stores/${storeA}`);
    assert.equal(storeRes.status, 200);

    const productsRes = await fetch(`${baseUrl}/stores/${storeA}/products`);
    assert.equal(productsRes.status, 200);

    const routeRes = await fetch(`${baseUrl}/stores/${storeA}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: 1, quantity: 1 }] }),
    });
    assert.equal(routeRes.status, 200);
    const routeBody = await routeRes.json();
    assert.equal(routeBody.route.stops.length, 1);
    assert.equal(routeBody.route.stops[0].name, "Leite integral 1 L");
    assert.equal(routeBody.route.totalDistance, 12);
  });
});
