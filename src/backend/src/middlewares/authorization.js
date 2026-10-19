const jwt = require("jsonwebtoken");

const SUPPORTED_ROLES = new Set(["admin", "manager"]);
const JWT_ISSUER = "achai-api";

function getBearerToken(request) {
  const authorization = request.headers.authorization;
  if (typeof authorization !== "string") {
    return null;
  }
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}

function authenticateRequest(request, response, context) {
  if (typeof context.jwtSecret !== "string" || Buffer.byteLength(context.jwtSecret) < 32) {
    context.sendJson(response, 503, { error: "Authentication is not configured." });
    return null;
  }

  const token = getBearerToken(request);
  if (!token) {
    context.sendJson(response, 401, { error: "Authentication required." });
    return null;
  }

  try {
    const payload = jwt.verify(token, context.jwtSecret, { issuer: JWT_ISSUER });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      !SUPPORTED_ROLES.has(payload.role)
    ) {
      context.sendJson(response, 401, { error: "Invalid authentication token." });
      return null;
    }
    return payload;
  } catch {
    context.sendJson(response, 401, { error: "Invalid authentication token." });
    return null;
  }
}

function requireRole(request, response, context, roles) {
  const payload = authenticateRequest(request, response, context);
  if (!payload) {
    return null;
  }
  if (!roles.includes(payload.role)) {
    context.sendJson(response, 403, { error: "Insufficient permissions." });
    return null;
  }
  return payload;
}

module.exports = { authenticateRequest, requireRole, SUPPORTED_ROLES };
