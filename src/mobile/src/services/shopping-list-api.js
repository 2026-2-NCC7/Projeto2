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
