import { API_BASE_URL } from "../config/api";

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchProfile(token) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: authHeaders(token),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível carregar os dados do perfil.");
  }
  return payload.user;
}

export async function updateProfile(token, { name, email }) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ name, email }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível salvar os dados pessoais.");
  }
  return payload.user;
}

export async function updatePassword(token, { currentPassword, newPassword }) {
  const response = await fetch(`${API_BASE_URL}/profile/password`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível atualizar a senha.");
  }
  return payload;
}

export async function requestAccountDeletion(token, { currentPassword }) {
  const response = await fetch(`${API_BASE_URL}/profile/delete`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Não foi possível solicitar a exclusão da conta.");
  }
  return payload;
}
