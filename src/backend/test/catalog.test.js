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
