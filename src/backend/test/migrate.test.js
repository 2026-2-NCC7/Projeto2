const assert = require("node:assert/strict");
const { mkdtemp, rm, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { connectWithRetry, runMigrations } = require("../migrate");

async function createMigrations(files) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "achai-migrations-"));
  await Promise.all(
    Object.entries(files).map(async ([name, contents]) => {
      await writeFile(path.join(directory, name), contents);
    }),
  );
  return directory;
}

test("applies pending migrations in order and skips migrations already recorded", async () => {
  const directory = await createMigrations({
    "1000_third.sql": "SELECT 3;",
    "999_second.sql": "SELECT 2;",
    "001_first.sql": "SELECT 1;",
    "not-a-migration.txt": "invalid",
  });
  const calls = [];
  const client = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql === "SELECT name FROM schema_migrations") {
        return { rows: [{ name: "001_first.sql" }] };
      }
      return { rows: [] };
    },
    release() {},
  };
  const pool = {
    async connect() {
      return client;
    },
  };

  try {
    await runMigrations(pool, directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }

  assert.deepEqual(
    calls.filter(({ sql }) => sql.startsWith("SELECT ") && sql.endsWith(";")),
    [
      { sql: "SELECT 2;", values: undefined },
      { sql: "SELECT 3;", values: undefined },
    ],
  );
  assert.equal(calls.filter(({ sql }) => sql === "COMMIT").length, 2);
  assert.equal(
    calls.some(({ sql, values }) => sql.startsWith("INSERT INTO schema_migrations") && values[0] === "999_second.sql"),
    true,
  );
});

test("rolls back and reports the name when a migration fails", async () => {
  const directory = await createMigrations({
    "001_broken.sql": "INVALID SQL;",
  });
  const calls = [];
  const client = {
    async query(sql) {
      calls.push(sql);
      if (sql === "INVALID SQL;") {
        throw new Error("syntax error");
      }
      if (sql === "SELECT name FROM schema_migrations") {
        return { rows: [] };
      }
      return { rows: [] };
    },
    release() {},
  };
  const pool = {
    async connect() {
      return client;
    },
  };

  try {
    await assert.rejects(
      runMigrations(pool, directory),
      /001_broken\.sql.*syntax error/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }

  assert.equal(calls.includes("ROLLBACK"), true);
  assert.equal(calls.includes("COMMIT"), false);
  assert.equal(calls.some((sql) => sql.startsWith("INSERT INTO schema_migrations")), false);
});

test("retries transient connection failures before applying migrations", async () => {
  let attempts = 0;
  const client = {
    async query(sql) {
      if (sql === "SELECT name FROM schema_migrations") {
        return { rows: [] };
      }
      return { rows: [] };
    },
    release() {},
  };
  const pool = {
    async connect() {
      attempts += 1;
      if (attempts < 3) {
        const error = new Error("connection refused");
        error.code = "ECONNREFUSED";
        throw error;
      }
      return client;
    },
  };
  const directory = await createMigrations({});

  try {
    await runMigrations(pool, directory, {
      attempts: 3,
      delayMs: 0,
      wait: (resolve) => resolve(),
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }

  assert.equal(attempts, 3);
});

test("does not retry non-transient connection failures", async () => {
  let attempts = 0;
  const pool = {
    async connect() {
      attempts += 1;
      const error = new Error("authentication failed");
      error.code = "28P01";
      throw error;
    },
  };

  await assert.rejects(connectWithRetry(pool, {
    attempts: 5,
    delayMs: 0,
    wait: (resolve) => resolve(),
  }), /authentication failed/);
  assert.equal(attempts, 1);
});
