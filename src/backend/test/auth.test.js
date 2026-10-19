const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const test = require("node:test");
const {
  authenticateAdmin,
  createAdmin,
  registerAdmin,
  TOKEN_TTL_SECONDS,
} = require("../src/auth");
const { createServer } = require("../src/server");

const jwtSecret = "test-secret-with-at-least-32-bytes-long";
const password = "CorrectHorseBattery12";

async function withServer(pool, secret, run) {
  const server = createServer({ pool, jwtSecret: secret });
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

test("creates administrators with normalized email and a password hash", async () => {
  let queryArguments;
  const pool = {
    async query(sql, values) {
      assert.match(sql, /INSERT INTO admin_user/);
      queryArguments = values;
      return { rows: [{ id: "admin-id", email: values[0] }] };
    },
  };

  const admin = await createAdmin(pool, " Admin@Example.com ", password);
  assert.deepEqual(admin, { id: "admin-id", email: "admin@example.com" });
  assert.equal(queryArguments[0], "admin@example.com");
  assert.notEqual(queryArguments[1], password);
  assert.equal(await bcrypt.compare(password, queryArguments[1]), true);
  await assert.rejects(createAdmin(pool, "admin@example.com", "short"), /12 caracteres.*72 bytes em UTF-8/);
});

test("returns null when the administrator email already exists", async () => {
  const pool = {
    async query() {
      return { rows: [] };
    },
  };

  assert.equal(await createAdmin(pool, "admin@example.com", password), null);
});

test("registers an administrator with a hashed password and display name", async () => {
  let values;
  const pool = {
    async query(sql, queryValues) {
      assert.match(sql, /INSERT INTO admin_user/);
      values = queryValues;
      return { rows: [{ id: "admin-id", email: queryValues[0] }] };
    },
  };

  const admin = await registerAdmin(pool, "Ana Gestora", " ANA@example.com ", password);
  assert.deepEqual(admin, { id: "admin-id", email: "ana@example.com" });
  assert.deepEqual(values.slice(0, 1), ["ana@example.com"]);
  assert.equal(values[2], "Ana Gestora");
  assert.equal(await bcrypt.compare(password, values[1]), true);
});

test("register endpoint creates administrators and rejects duplicates", async () => {
  const pool = {
    async query(sql, values) {
      if (sql.includes("INSERT INTO admin_user")) {
        return values[0] === "existing@example.com"
          ? { rows: [] }
          : { rows: [{ id: "admin-id", email: values[0] }] };
      }
      throw new Error("Unexpected query");
    },
  };

  await withServer(pool, jwtSecret, async (baseUrl) => {
    const created = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ana Gestora",
        email: "new@example.com",
        password,
        password_confirmation: password,
      }),
    });
    const duplicate = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ana Gestora",
        email: "existing@example.com",
        password,
        password_confirmation: password,
      }),
    });

    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), { id: "admin-id", email: "new@example.com" });
    assert.equal(duplicate.status, 409);
  });
});

test("authenticates administrators and rejects invalid credentials", async () => {
  const passwordHash = await bcrypt.hash(password, 4);
  const pool = {
    async query(sql, values) {
      assert.match(sql, /lower\(email\) = lower\(\$1\)/);
      assert.equal(values[0], "admin@example.com");
      return {
        rows: [{ id: "admin-id", email: "admin@example.com", password_hash: passwordHash }],
      };
    },
  };

  assert.equal((await authenticateAdmin(pool, "ADMIN@example.com", password)).id, "admin-id");
  assert.equal(await authenticateAdmin(pool, "admin@example.com", "wrong-password"), null);
});

test("returns a signed bearer token after successful login", async () => {
  const passwordHash = await bcrypt.hash(password, 4);
  const pool = {
    async query() {
      return {
        rows: [{ id: "admin-id", email: "admin@example.com", password_hash: passwordHash }],
      };
    },
  };

  await withServer(pool, jwtSecret, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.token_type, "Bearer");
    assert.equal(body.expires_in, TOKEN_TTL_SECONDS);
    assert.equal(typeof body.token, "string");
    assert.deepEqual(jwt.verify(body.token, jwtSecret), {
      role: "admin",
      sub: "admin-id",
      iss: "achai-api",
      iat: jwt.verify(body.token, jwtSecret).iat,
      exp: jwt.verify(body.token, jwtSecret).exp,
    });
  });
});

test("returns the same 401 response for unknown administrators and wrong passwords", async () => {
  const passwordHash = await bcrypt.hash(password, 4);
  const pool = {
    async query(sql, values) {
      return values[0] === "unknown@example.com"
        ? { rows: [] }
        : { rows: [{ id: "admin-id", email: "admin@example.com", password_hash: passwordHash }] };
    },
  };

  await withServer(pool, jwtSecret, async (baseUrl) => {
    const wrongPassword = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "wrong-password" }),
    });
    const shortPassword = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "bad" }),
    });
    const unknownEmail = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unknown@example.com", password }),
    });

    assert.equal(wrongPassword.status, 401);
    assert.equal(shortPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.deepEqual(await wrongPassword.json(), await unknownEmail.json());
  });
});

test("returns 400 for malformed login requests and 405 for unsupported methods", async () => {
  await withServer({ async query() { return { rows: [] }; } }, jwtSecret, async (baseUrl) => {
    const malformed = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    const invalidBody = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password }),
    });
    const wrongMethod = await fetch(`${baseUrl}/auth/login`);

    assert.equal(malformed.status, 400);
    assert.equal(invalidBody.status, 400);
    assert.equal(wrongMethod.status, 405);
    assert.equal(wrongMethod.headers.get("allow"), "POST");
  });
});

test("does not issue tokens when the JWT secret is missing or too short", async () => {
  await withServer({ async query() { throw new Error("Database should not be queried."); } }, "", async (baseUrl) => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password }),
    });
    assert.equal(response.status, 503);
  });
});

test("returns 503 when administrator lookup fails", async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await withServer({ async query() { throw new Error("Database unavailable."); } }, jwtSecret, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@example.com", password }),
      });
      assert.equal(response.status, 503);
    });
  } finally {
    console.error = originalConsoleError;
  }
});
