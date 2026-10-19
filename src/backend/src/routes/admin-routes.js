const { register } = require("../controllers/auth-controller");
const { requireRole } = require("../middlewares/authorization");

function adminRoutes(request, response, context) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    context.sendJson(response, 405, { error: "Method not allowed" });
    return true;
  }

  const payload = requireRole(request, response, context, ["admin"]);
  if (!payload) {
    return true;
  }

  register(request, response, { ...context, registrationRole: "manager" });
  return true;
}

module.exports = { adminRoutes };
