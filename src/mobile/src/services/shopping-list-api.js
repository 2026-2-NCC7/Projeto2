import { API_BASE_URL } from "../config/api";

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível atualizar a lista.");
  }
  return payload;
}

export async function fetchShoppingLists(token) {
  const payload = await request("/lists", token, { method: "GET" });
  return Array.isArray(payload.lists) ? payload.lists : [];
}

export async function fetchShoppingListSummary(token, listId) {
  const payload = await request(`/lists/${encodeURIComponent(listId)}`, token, { method: "GET" });
  return payload.list || null;
}

export function deleteShoppingList(token, listId) {
  return request(`/lists/${encodeURIComponent(listId)}`, token, {
    method: "DELETE",
  });
}

export function createShoppingList(token, storeId, name) {
  return request(`/stores/${encodeURIComponent(storeId)}/lists`, token, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function addListItem(token, listId, productId, quantity) {
  return request(`/lists/${encodeURIComponent(listId)}/items`, token, {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateListItem(token, listId, productId, quantity) {
  return request(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(productId)}`, token, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeListItem(token, listId, productId) {
  return request(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(productId)}`, token, {
    method: "DELETE",
  });
}
