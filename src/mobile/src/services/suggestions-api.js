import { API_BASE_URL } from "../config/api";

export async function fetchSuggestions(token, storeId) {
  const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
  const response = await fetch(`${API_BASE_URL}/suggestions${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível carregar as sugestões.");
  }
  return payload.suggestions || [];
}
