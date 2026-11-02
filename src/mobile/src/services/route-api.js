import { API_BASE_URL } from "../config/api";

export async function calculateRoute(token, listId) {
  const response = await fetch(`${API_BASE_URL}/lists/${encodeURIComponent(listId)}/route`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível calcular a rota.");
  }
  return payload.route;
}
