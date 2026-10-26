import { API_BASE_URL } from "../config/api";

export async function fetchCatalog(token, storeId, search = "", signal) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (storeId) params.set("storeId", storeId);
  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}${storeId ? `/stores/${encodeURIComponent(storeId)}/products` : "/catalog"}${query ? `?${query}` : ""}`,
    {
    headers: { Authorization: `Bearer ${token}` },
    signal,
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível carregar o catálogo.");
  }
  return payload.products || [];
}
