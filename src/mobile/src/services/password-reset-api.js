import { API_BASE_URL } from "../config/api";

async function requestJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível concluir a operação.");
  }
  return payload;
}

export function requestPasswordReset(email) {
  return requestJson("/auth/forgot-password", { email });
}

export function resetPassword(token, password) {
  return requestJson("/auth/reset-password", {
    token,
    password,
    password_confirmation: password,
  });
}
