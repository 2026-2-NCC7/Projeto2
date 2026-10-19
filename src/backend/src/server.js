const { Pool } = require("pg");
const { createApp } = require("./app");

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  const pool = new Pool();
  const server = createApp({ pool });
  server.listen(port, "0.0.0.0", () => {
    console.log(`API pronta na porta ${port}.`);
  });

  async function shutdown() {
    server.close(async () => {
      await pool.end();
      process.exitCode = 0;
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = { createServer: createApp };
