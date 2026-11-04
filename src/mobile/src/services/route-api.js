import { API_BASE_URL } from "../config/api";

export async function calculateRoute(token, listId, options = {}) {
  const response = await fetch(`${API_BASE_URL}/lists/${encodeURIComponent(listId)}/route`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      startNodeId: options?.startNodeId,
      startAisle: options?.startAisle,
      excludedProductIds: options?.excludedProductIds,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível calcular a rota.");
  }
  return payload.route;
}

export async function calculateStoreRouteByItems(storeId, items, options = {}) {
  const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: (items || []).map((item) => ({
        productId: item.productId ?? item.id,
        quantity: item.quantity || 1,
      })),
      startNodeId: options?.startNodeId,
      startAisle: options?.startAisle,
      excludedProductIds: options?.excludedProductIds,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível calcular a rota da loja.");
  }
  return payload.route;
}
