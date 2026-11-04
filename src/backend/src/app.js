const http = require("node:http");
const { applyCors, getAllowedOrigin } = require("./middlewares/cors");
const { route } = require("./router");
const { createPasswordResetSender } = require("./services/email-service");

function createApp({
  pool,
  jwtSecret = process.env.JWT_SECRET,
  frontendOrigin = process.env.FRONTEND_ORIGIN || "*",
  passwordResetBaseUrl = process.env.PASSWORD_RESET_BASE_URL || "https://achai-mobile.vercel.app",
  passwordResetSender = createPasswordResetSender({
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  }),
}) {
  const allowedOrigins = frontendOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return http.createServer((request, response) => {
    const requestOrigin = getAllowedOrigin(request.headers.origin, allowedOrigins);
    const context = { pool, jwtSecret, frontendOrigin: requestOrigin, passwordResetBaseUrl, passwordResetSender };
    applyCors(response, requestOrigin);
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }
    Promise.resolve(route(request, response, context)).catch((error) => {
      console.error("Falha ao processar requisição:", error);
      if (!response.headersSent) {
        const { sendJson } = require("./utils/http");
        sendJson(response, 500, { error: "Internal server error." }, requestOrigin);
      }
    });
  });
}

module.exports = { createApp };
