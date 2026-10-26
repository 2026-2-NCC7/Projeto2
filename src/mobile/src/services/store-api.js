import { API_BASE_URL } from "../config/api";

export async function validateStore(token, storeId) {
  const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Esta loja não está disponível.");
  }
  return payload.store;
}
