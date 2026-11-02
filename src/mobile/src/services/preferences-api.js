import { API_BASE_URL } from "../config/api";

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(token),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível atualizar as preferências.");
  }
  return payload;
}

export async function fetchPreferences(token) {
  const payload = await request("/preferences", token, { method: "GET" });
  return payload.preferences || null;
}

export async function updatePreferences(token, preferences) {
  const payload = await request("/preferences", token, {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
  return payload.preferences;
}
