const http = require("node:http");
const { applyCors, getAllowedOrigin } = require("./middlewares/cors");
const { route } = require("./router");

function createApp({
  pool,
  jwtSecret = process.env.JWT_SECRET,
  frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:8081",
  passwordResetBaseUrl = process.env.PASSWORD_RESET_BASE_URL || "http://localhost:8081",
}) {
  const allowedOrigins = frontendOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return http.createServer((request, response) => {
    const requestOrigin = getAllowedOrigin(request.headers.origin, allowedOrigins);
    const context = { pool, jwtSecret, frontendOrigin: requestOrigin, passwordResetBaseUrl };
    applyCors(response, requestOrigin);
    if (request.method === "OPTIONS") {
      response.writeHead(requestOrigin || request.headers.origin ? 204 : 403);
      response.end();
      return;
    }
    Promise.resolve(route(request, response, context)).catch((error) => {
      console.error("Falha ao processar requisição:", error);
      if (!response.headersSent) {
        context.sendJson(response, 500, { error: "Internal server error." });
      }
    });
  });
}

module.exports = { createApp };