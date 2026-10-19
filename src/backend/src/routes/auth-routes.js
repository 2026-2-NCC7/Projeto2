const { login, register } = require("../controllers/auth-controller");

function authRoutes(request, response, context) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    context.sendJson(response, 405, { error: "Method not allowed" });
    return true;
  }
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/auth/register") {
    register(request, response, context);
  } else {
    login(request, response, context);
  }
  return true;
}

module.exports = { authRoutes };
