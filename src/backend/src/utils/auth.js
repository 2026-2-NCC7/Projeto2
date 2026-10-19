const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const TOKEN_TTL_SECONDS = 60 * 60;
const PASSWORD_HASH_ROUNDS = 12;
const SUPPORTED_ROLES = new Set(["admin", "manager"]);
const dummyPasswordHash = bcrypt.hashSync("not-a-real-admin-password", PASSWORD_HASH_ROUNDS);

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  return typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPassword(password) {
  return typeof password === "string" &&
    Buffer.byteLength(password, "utf8") > 0 &&
    Buffer.byteLength(password, "utf8") <= 72;
}

async function hashPassword(password) {
  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
}

async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

async function compareWithDummyHash(password) {
  return bcrypt.compare(password, dummyPasswordHash);
}

function createAccessToken(admin, secret) {
  if (!SUPPORTED_ROLES.has(admin.role)) {
    throw new TypeError("User role is invalid.");
  }
  return jwt.sign(
    { role: admin.role },
    secret,
    { expiresIn: TOKEN_TTL_SECONDS, issuer: "achai-api", subject: admin.id },
  );
}

module.exports = {
  comparePassword,
  compareWithDummyHash,
  createAccessToken,
  hashPassword,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  TOKEN_TTL_SECONDS,
  SUPPORTED_ROLES,
};
