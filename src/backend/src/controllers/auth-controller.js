const {
  authenticateAdmin,
  createAccessToken,
  isValidEmail,
  isValidPassword,
  TOKEN_TTL_SECONDS,
  registerAdmin,
  registerUser,
  requestPasswordReset,
  resetPassword,
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
      user: {
        id: admin.id,
        name: admin.display_name || "Marina Ferreira",
        email: admin.email,
        role: admin.role,
        verified: true,
      },
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
    const registerFn = context.registrationRole === "manager"
      ? registerUser
      : registerAdmin;
    const admin = await registerFn(
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

async function forgotPassword(request, response, context) {
  let payload;
  try {
    payload = await readJsonBody(request, MAX_REQUEST_BODY_BYTES);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.message }, context.frontendOrigin);
    return;
  }
  if (!isValidEmail(payload?.email)) {
    sendJson(response, 400, { error: "Informe um e-mail válido." }, context.frontendOrigin);
    return;
  }

  try {
    await requestPasswordReset(context.pool, payload.email, context.passwordResetBaseUrl, console.log);
    sendJson(response, 200, {
      message: "Se o e-mail estiver cadastrado, enviaremos um link de redefinição.",
    }, context.frontendOrigin);
  } catch (error) {
    console.error("Falha na solicitação de redefinição:", error);
    sendJson(response, 503, { error: "Não foi possível solicitar a redefinição agora." }, context.frontendOrigin);
  }
}

async function reset(request, response, context) {
  try {
    const payload = await readJsonBody(request, MAX_REQUEST_BODY_BYTES);
    if (payload.password !== payload.password_confirmation) {
      sendJson(response, 400, { error: "As senhas não conferem." }, context.frontendOrigin);
      return;
    }
    await resetPassword(context.pool, payload.token, payload.password);
    sendJson(response, 200, { message: "Senha redefinida com sucesso." }, context.frontendOrigin);
  } catch (error) {
    if (error instanceof TypeError || error.statusCode) {
      sendJson(response, error.statusCode || 400, { error: error.message }, context.frontendOrigin);
      return;
    }
    console.error("Falha na redefinição de senha:", error);
    sendJson(response, 503, { error: "Não foi possível redefinir a senha agora." }, context.frontendOrigin);
  }
}

module.exports = { forgotPassword, login, register, reset };
