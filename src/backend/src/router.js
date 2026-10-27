const { authRoutes } = require("./routes/auth-routes");
const { adminRoutes } = require("./routes/admin-routes");
const { health } = require("./controllers/health-controller");
const { readJsonBody, sendJson } = require("./utils/http");
const { requireRole } = require("./middlewares/authorization");
const { findProducts, findStore } = require("./model/catalog-model");
const {
  createList,
  getListSummary,
  removeListItem,
  updateListItem,
  upsertListItem,
} = require("./model/shopping-list-model");
const { calculateListRoute } = require("./model/route-model");

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
  const storeMatch = pathname.match(/^\/stores\/([^/]+)$/);
  if (storeMatch) {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
      return;
    }
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const store = await findStore(context.pool, decodeURIComponent(storeMatch[1]));
    if (!store) {
      sendJson(response, 404, { error: "Loja não encontrada." }, context.frontendOrigin);
      return;
    }
    sendJson(response, 200, { store }, context.frontendOrigin);
    return;
  }
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
  const createListMatch = pathname.match(/^\/stores\/([^/]+)\/lists$/);
  if (createListMatch) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
      return;
    }
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const storeId = decodeURIComponent(createListMatch[1]);
    if (!await findStore(context.pool, storeId)) {
      sendJson(response, 404, { error: "Loja não encontrada." }, context.frontendOrigin);
      return;
    }
    let body;
    try {
      body = await readJsonBody(request, 32 * 1024);
    } catch (error) {
      sendJson(response, error.statusCode || 400, { error: error.message }, context.frontendOrigin);
      return;
    }
    const list = await createList(context.pool, payload.sub, storeId, body?.name);
    if (!list) {
      sendJson(response, 400, { error: "Informe um nome de lista válido." }, context.frontendOrigin);
      return;
    }
    sendJson(response, 201, { list }, context.frontendOrigin);
    return;
  }
  const listMatch = pathname.match(/^\/lists\/([^/]+)$/);
  const listRouteMatch = pathname.match(/^\/lists\/([^/]+)\/route$/);
  if (listRouteMatch) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
      return;
    }
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const result = await calculateListRoute(context.pool, decodeURIComponent(listRouteMatch[1]), payload.sub);
    if (result.error) {
      sendJson(response, result.status, { error: result.error }, context.frontendOrigin);
      return;
    }
    sendJson(response, 200, result, context.frontendOrigin);
    return;
  }
  if (listMatch) {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
      return;
    }
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const list = await getListSummary(context.pool, decodeURIComponent(listMatch[1]), payload.sub);
    if (!list) {
      sendJson(response, 404, { error: "Lista não encontrada." }, context.frontendOrigin);
      return;
    }
    sendJson(response, 200, { list }, context.frontendOrigin);
    return;
  }
  const listItemMatch = pathname.match(/^\/lists\/([^/]+)\/items\/([^/]+)$/);
  const listItemsMatch = pathname.match(/^\/lists\/([^/]+)\/items$/);
  if (listItemsMatch || listItemMatch) {
    const payload = requireRole(request, response, authorizedContext, ["admin", "manager"]);
    if (!payload) return;
    const listId = decodeURIComponent((listItemsMatch || listItemMatch)[1]);
    const productId = listItemMatch ? decodeURIComponent(listItemMatch[2]) : null;
    if (request.method === "POST" && listItemsMatch) {
      let body;
      try {
        body = await readJsonBody(request, 32 * 1024);
      } catch (error) {
        sendJson(response, error.statusCode || 400, { error: error.message }, context.frontendOrigin);
        return;
      }
      const result = await upsertListItem(context.pool, listId, payload.sub, body?.productId, body?.quantity);
      if (result.error) {
        sendJson(response, result.status, { error: result.error }, context.frontendOrigin);
        return;
      }
      sendJson(response, 201, { list: await getListSummary(context.pool, listId, payload.sub) }, context.frontendOrigin);
      return;
    }
    if (request.method === "PATCH" && listItemMatch) {
      let body;
      try {
        body = await readJsonBody(request, 32 * 1024);
      } catch (error) {
        sendJson(response, error.statusCode || 400, { error: error.message }, context.frontendOrigin);
        return;
      }
      const result = await updateListItem(context.pool, listId, payload.sub, productId, body?.quantity);
      if (result.error) {
        sendJson(response, result.status, { error: result.error }, context.frontendOrigin);
        return;
      }
      sendJson(response, 200, { list: await getListSummary(context.pool, listId, payload.sub) }, context.frontendOrigin);
      return;
    }
    if (request.method === "DELETE" && listItemMatch) {
      if (!await removeListItem(context.pool, listId, payload.sub, productId)) {
        sendJson(response, 404, { error: "Item não encontrado nesta lista." }, context.frontendOrigin);
        return;
      }
      sendJson(response, 200, { list: await getListSummary(context.pool, listId, payload.sub) }, context.frontendOrigin);
      return;
    }
    response.setHeader("Allow", listItemsMatch ? "POST" : "PATCH, DELETE");
    sendJson(response, 405, { error: "Method not allowed" }, context.frontendOrigin);
    return;
  }
  sendJson(response, 404, { error: "Not found" }, context.frontendOrigin);
}

module.exports = { route };