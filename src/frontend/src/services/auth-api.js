// In development, use Vite's proxy so the browser never depends on a stale
// VITE_API_URL value from the shell that started the dev server.
const apiUrl = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "https://achai-api-production.up.railway.app");

async function request(path, payload, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method || "POST",
    headers: { ...(payload ? { "Content-Type": "application/json" } : {}), ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

export async function getAnalytics(period, storeId) {
  const params = new URLSearchParams({ period });
  if (storeId) params.set("storeId", storeId);
  const { response, body } = await request(`/admin/analytics?${params}`, null, { method: "GET", token: sessionStorage.getItem("achai_admin_token") });
  if (!response.ok) throw new Error(body.error || "Falha ao consultar indicadores.");
  return body;
}

export async function getStores() {
  const { response, body } = await request("/stores", null, { method: "GET" });
  if (!response.ok) throw new Error("Falha ao consultar filiais.");
  return body.stores || [];
}

export function loginAdmin(email, password) {
  return request("/auth/login", { email, password });
}

export function registerAdmin(name, email, password, passwordConfirmation) {
  return request("/auth/register", {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
}
