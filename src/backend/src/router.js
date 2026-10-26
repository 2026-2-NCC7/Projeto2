const { authRoutes } = require("./routes/auth-routes");
const { adminRoutes } = require("./routes/admin-routes");
const { health } = require("./controllers/health-controller");
const { sendJson } = require("./utils/http");
const { requireRole } = require("./middlewares/authorization");
const { findProducts, findStore } = require("./model/catalog-model");

async function route(request, response, context) {
  const authorizedContext = {
    ...context,
    sendJson: (res, status, body) => sendJson(res, status, body, context.frontendOrigin),
  };
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
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
      return;
    }
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const suggestionParams = new URL(request.url, "http://localhost").searchParams;
    const filialId = suggestionParams.get("storeId") || suggestionParams.get("filialId")
      || "00000000-0000-0000-0000-000000000001";
    const store = await findStore(context.pool, filialId);
    if (!store) {
      sendJson(response, 404, { error: "Loja não encontrada." }, context.frontendOrigin);
      return;
    }
    const products = await findProducts(context.pool, filialId, "", 4);
    sendJson(response, 200, { suggestions: products }, context.frontendOrigin);
    return;
  }
  const storeProductsMatch = pathname.match(/^\/stores\/([^/]+)\/products$/);
  if (storeProductsMatch) {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
      return;
    }
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const storeId = decodeURIComponent(storeProductsMatch[1]);
    const searchParams = new URL(request.url, "http://localhost").searchParams;
    const search = searchParams.get("q") || "";
    if (search.trim() && search.trim().length < 2) {
      sendJson(response, 400, { error: "A busca deve ter pelo menos 2 caracteres." }, context.frontendOrigin);
      return;
    }
    const store = await findStore(context.pool, storeId);
    if (!store) {
      sendJson(response, 404, { error: "Loja não encontrada." }, context.frontendOrigin);
      return;
    }
    sendJson(response, 200, {
      store,
      products: await findProducts(context.pool, storeId, search, searchParams.get("limit")),
    }, context.frontendOrigin);
    return;
  }
  if (pathname === "/catalog") {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
      return;
    }
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const searchParams = new URL(request.url, "http://localhost").searchParams;
    const filialId = searchParams.get("storeId") ||
      searchParams.get("filialId") ||
      "00000000-0000-0000-0000-000000000001";
    const search = searchParams.get("search") || "";
    if (search.trim() && search.trim().length < 2) {
      sendJson(response, 400, { error: "A busca deve ter pelo menos 2 caracteres." }, context.frontendOrigin);
      return;
    }
    const store = await findStore(context.pool, filialId);
    if (!store) {
      sendJson(response, 404, { error: "Loja não encontrada." }, context.frontendOrigin);
      return;
    }
    sendJson(response, 200, {
      store,
      products: await findProducts(context.pool, filialId, search, searchParams.get("limit")),
    }, context.frontendOrigin);
    return;
  }
  sendJson(response, 404, { error: "Not found" }, context.frontendOrigin);
}

module.exports = { route };