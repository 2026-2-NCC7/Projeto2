const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

const migrationsDirectory = path.join(__dirname, "migrations");
const migrationFilePattern = /^\d{3,}_[a-z0-9_-]+\.sql$/i;
const transientConnectionErrors = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "57P03",
  "08000",
  "08001",
  "08003",
  "08006",
]);

async function connectWithRetry(pool, { attempts = 30, delayMs = 1000, wait = setTimeout } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await pool.connect();
    } catch (error) {
      if (!transientConnectionErrors.has(error.code) || attempt === attempts) {
        if (transientConnectionErrors.has(error.code)) {
          throw new Error(
            `Não foi possível conectar ao banco após ${attempts} tentativas: ${error.message}`,
            { cause: error },
          );
        }
        throw error;
      }

      console.log(`Banco ainda indisponível; nova tentativa em ${delayMs} ms (${attempt}/${attempts}).`);
      await new Promise((resolve) => wait(resolve, delayMs));
    }
  }
}

async function runMigrations(pool, directory = migrationsDirectory, connectionOptions) {
  const client = await connectWithRetry(pool, connectionOptions);

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const appliedMigrations = new Set(rows.map((row) => row.name));
    const migrationFiles = (await readdir(directory))
      .filter((file) => migrationFilePattern.test(file))
      .sort((left, right) => {
        const leftVersion = Number(left.split("_", 1)[0]);
        const rightVersion = Number(right.split("_", 1)[0]);
        return leftVersion - rightVersion || left.localeCompare(right);
      });

    for (const file of migrationFiles) {
      if (appliedMigrations.has(file)) {
        continue;
      }

      const sql = await readFile(path.join(directory, file), "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Migration aplicada: ${file}`);
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          throw new AggregateError(
            [error, rollbackError],
            `A migration ${file} falhou e a transação não pôde ser revertida.`,
          );
        }

        throw new Error(`A migration ${file} falhou: ${error.message}`, { cause: error });
      }

      appliedMigrations.add(file);
    }
  } finally {
    client.release();
  }
}

async function main() {
  const pool = new Pool();

  try {
    await runMigrations(pool);
    console.log("Migrations concluídas.");
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { connectWithRetry, runMigrations };
