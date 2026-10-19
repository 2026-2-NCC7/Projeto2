// In development, use Vite's proxy so the browser never depends on a stale
// VITE_API_URL value from the shell that started the dev server.
const apiUrl = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

async function request(path, payload) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  return { response, body };
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
