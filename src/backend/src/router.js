const { authRoutes } = require("./routes/auth-routes");
const { health } = require("./controllers/health-controller");
const { sendJson } = require("./utils/http");

function route(request, response, context) {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/health") {
    health(request, response, context);
    return;
  }
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    authRoutes(request, response, {
      ...context,
      sendJson: (res, status, body) => sendJson(res, status, body, context.frontendOrigin),
    });
    return;
  }
  sendJson(response, 404, { error: "Not found" }, context.frontendOrigin);
}

module.exports = { route };