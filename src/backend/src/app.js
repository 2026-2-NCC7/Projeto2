const http = require("node:http");
const { applyCors } = require("./middlewares/cors");
const { route } = require("./router");

function createApp({
  pool,
  jwtSecret = process.env.JWT_SECRET,
  frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173",
}) {
  const context = { pool, jwtSecret, frontendOrigin };
  return http.createServer((request, response) => {
    applyCors(response, frontendOrigin);
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }
    route(request, response, context);
  });
}

module.exports = { createApp };