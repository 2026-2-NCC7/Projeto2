const http = require("node:http");
const { Pool } = require("pg");

const port = Number(process.env.PORT || 3000);
const pool = new Pool();

const server = http.createServer(async (request, response) => {
  if (request.url !== "/health") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  try {
    await pool.query("SELECT 1");
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", database: "connected" }));
  } catch (error) {
    console.error("Health check do banco falhou:", error);
    response.writeHead(503, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "unavailable", database: "disconnected" }));
  }
});

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
