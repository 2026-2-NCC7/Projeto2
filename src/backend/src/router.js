const { authRoutes } = require("./routes/auth-routes");
const { adminRoutes } = require("./routes/admin-routes");
const { health } = require("./controllers/health-controller");
const { sendJson } = require("./utils/http");
const { requireRole } = require("./middlewares/authorization");

function route(request, response, context) {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/health") {
    health(request, response, context);
    return;
  }
  if (
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password"
  ) {
    authRoutes(request, response, {
      ...context,
      sendJson: (res, status, body) => sendJson(res, status, body, context.frontendOrigin),
    });
    return;
  }
  if (pathname === "/admin/register") {
    adminRoutes(request, response, {
      ...context,
      sendJson: (res, status, body) => sendJson(res, status, body, context.frontendOrigin),
    });
    return;
  }
  if (pathname === "/suggestions") {
    const payload = requireRole(request, response, context, ["admin", "manager"]);
    if (!payload) return;
    sendJson(response, 200, { suggestions: [] }, context.frontendOrigin);
    return;
  }
  sendJson(response, 404, { error: "Not found" }, context.frontendOrigin);
}

module.exports = { route };