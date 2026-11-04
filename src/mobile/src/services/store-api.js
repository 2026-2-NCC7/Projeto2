import { API_BASE_URL } from "../config/api";

export async function validateStore(token, storeId) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}`, {
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Esta loja não está disponível.");
  }
  return payload.store;
}

export async function fetchStores(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/stores`, {
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível carregar as lojas.");
  }
  return Array.isArray(payload.stores) ? payload.stores : [];
}
