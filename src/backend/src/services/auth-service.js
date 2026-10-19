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
const { findActiveAdmin, insertAdmin } = require("../model/admin-model");

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
  isValidEmail,
  isValidPassword,
  TOKEN_TTL_SECONDS,
  SUPPORTED_ROLES,
};
