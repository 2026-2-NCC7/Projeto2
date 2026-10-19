const { sendJson } = require("../utils/http");

async function health(request, response, context) {
  try {
    await context.pool.query("SELECT 1");
    sendJson(response, 200, { status: "ok", database: "connected" }, context.frontendOrigin);
  } catch (error) {
    console.error("Health check do banco falhou:", error);
    sendJson(response, 503, { status: "unavailable", database: "disconnected" }, context.frontendOrigin);
  }
}

module.exports = { health };
