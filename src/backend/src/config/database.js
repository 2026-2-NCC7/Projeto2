const { Pool } = require("pg");

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return undefined;
  }

  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("uselibpqcompat");
  return url.toString();
}

function createPool() {
  const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false";

  return new Pool({
    connectionString: getConnectionString(),
    ssl: process.env.DATABASE_URL
      ? { rejectUnauthorized }
      : undefined,
  });
}

module.exports = { createPool, getConnectionString };
