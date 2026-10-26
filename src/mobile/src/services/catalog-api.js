import { API_BASE_URL } from "../config/api";

export async function fetchCatalog(token, search = "", signal) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`${API_BASE_URL}/catalog${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível carregar o catálogo.");
  }
  return payload.products || [];
}
