const crypto = require("node:crypto");
const {
  comparePassword,
  compareWithDummyHash,
  createAccessToken,
  hashPassword,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  SUPPORTED_ROLES,
  TOKEN_TTL_SECONDS,
} = require("../utils/auth");
const { findActiveAdmin, findActiveAdminByEmail, insertAdmin } = require("../model/admin-model");
const {
  consumeResetToken,
  findValidResetToken,
  insertResetToken,
  invalidateActiveTokens,
} = require("../model/password-reset-model");

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function requestPasswordReset(pool, email, passwordResetBaseUrl, log = console.log) {
  const admin = await findActiveAdminByEmail(pool, normalizeEmail(email));
  if (!admin) {
    return;
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await invalidateActiveTokens(pool, admin.id);
  await insertResetToken(pool, tokenHash, admin.id, expiresAt);

  const resetUrl = `${passwordResetBaseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  log(`Link de redefinição de senha para ${admin.email}: ${resetUrl}`);
}

async function resetPassword(pool, token, password) {
  if (typeof token !== "string" || token.length < 20) {
    throw new TypeError("O link de redefinição é inválido ou expirou.");
  }
  if (!isValidPassword(password) || Array.from(password).length < 12) {
    throw new TypeError("A senha deve ter pelo menos 12 caracteres e no máximo 72 bytes em UTF-8.");
  }

  const tokenHash = hashResetToken(token);
  const resetToken = await findValidResetToken(pool, tokenHash);
  if (!resetToken || !(await consumeResetToken(pool, tokenHash, resetToken.admin_id, await hashPassword(password)))) {
    throw new TypeError("O link de redefinição é inválido ou expirou.");
  }
}

async function authenticateAdmin(pool, email, password) {
  const admin = await findActiveAdmin(pool, normalizeEmail(email));
  const passwordMatches = admin
    ? await comparePassword(password, admin.password_hash)
    : await compareWithDummyHash(password);
  return admin && passwordMatches ? admin : null;
}

async function createAdmin(pool, email, password) {
  if (!isValidEmail(email)) {
    throw new TypeError("A valid administrator email is required.");
  }
  if (!isValidPassword(password) || Array.from(password).length < 12) {
    throw new TypeError("A senha deve ter pelo menos 12 caracteres e no máximo 72 bytes em UTF-8.");
  }
  return insertAdmin(pool, normalizeEmail(email), await hashPassword(password));
}

async function registerUser(pool, displayName, email, password, role = "admin") {
  if (typeof displayName !== "string" || displayName.trim().length < 2 || displayName.trim().length > 120) {
    throw new TypeError("Name must be between 2 and 120 characters.");
  }
  if (!isValidEmail(email)) {
    throw new TypeError("A valid administrator email is required.");
  }
  if (!SUPPORTED_ROLES.has(role)) {
    throw new TypeError("A valid user role is required.");
  }
  if (!isValidPassword(password) || Array.from(password).length < 12) {
    throw new TypeError("A senha deve ter pelo menos 12 caracteres e no máximo 72 bytes em UTF-8.");
  }
  return insertAdmin(
    pool,
    normalizeEmail(email),
    await hashPassword(password),
    displayName.trim(),
    role,
  );
}

async function registerAdmin(pool, displayName, email, password) {
  return registerUser(pool, displayName, email, password, "admin");
}

module.exports = {
  authenticateAdmin,
  createAccessToken,
  createAdmin,
  registerAdmin,
  registerUser,
  requestPasswordReset,
  resetPassword,
  isValidEmail,
  isValidPassword,
  TOKEN_TTL_SECONDS,
  SUPPORTED_ROLES,
};
