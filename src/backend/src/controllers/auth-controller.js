const {
  authenticateAdmin,
  createAccessToken,
  isValidEmail,
  isValidPassword,
  TOKEN_TTL_SECONDS,
  registerAdmin,
  registerUser,
} = require("../services/auth-service");
const { readJsonBody, sendJson } = require("../utils/http");

const MAX_REQUEST_BODY_BYTES = 16 * 1024;

async function login(request, response, context) {
  let credentials;
  try {
    credentials = await readJsonBody(request, MAX_REQUEST_BODY_BYTES);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.message }, context.frontendOrigin);
    return;
  }

  const { email, password } = credentials || {};
  if (!isValidEmail(email) || !isValidPassword(password)) {
    sendJson(response, 400, { error: "A valid email and password are required." }, context.frontendOrigin);
    return;
  }
  if (typeof context.jwtSecret !== "string" || Buffer.byteLength(context.jwtSecret) < 32) {
    sendJson(response, 503, { error: "Authentication is not configured." }, context.frontendOrigin);
    return;
  }

  try {
    const admin = await authenticateAdmin(context.pool, email, password);
    if (!admin) {
      sendJson(response, 401, { error: "Invalid email or password." }, context.frontendOrigin);
      return;
    }
    sendJson(response, 200, {
      token: createAccessToken(admin, context.jwtSecret),
      token_type: "Bearer",
      expires_in: TOKEN_TTL_SECONDS,
    }, context.frontendOrigin);
  } catch (error) {
    console.error("Falha no login do administrador:", error);
    sendJson(response, 503, { error: "Authentication service unavailable." }, context.frontendOrigin);
  }
}

async function register(request, response, context) {
  let payload;
  try {
    payload = await readJsonBody(request, MAX_REQUEST_BODY_BYTES);
    if (payload.password !== payload.password_confirmation) {
      sendJson(response, 400, { error: "Passwords do not match." }, context.frontendOrigin);
      return;
    }
    const register = context.registrationRole === "manager"
      ? registerUser
      : registerAdmin;
    const admin = await register(
      context.pool,
      payload.name,
      payload.email,
      payload.password,
      context.registrationRole,
    );
    if (!admin) {
      sendJson(response, 409, { error: "An administrator with this email already exists." }, context.frontendOrigin);
      return;
    }
    sendJson(response, 201, { id: admin.id, email: admin.email }, context.frontendOrigin);
  } catch (error) {
    if (error.statusCode || error instanceof TypeError) {
      sendJson(response, error.statusCode || 400, { error: error.message }, context.frontendOrigin);
      return;
    }
    console.error("Falha no cadastro do administrador:", error);
    sendJson(response, 503, { error: "Registration service unavailable." }, context.frontendOrigin);
  }
}

module.exports = { login, register };
