function getAllowedOrigin(requestOrigin, allowedOrigins = []) {
  if (!allowedOrigins.length || allowedOrigins.includes("*")) {
    return requestOrigin || "*";
  }

  if (requestOrigin && (allowedOrigins.includes(requestOrigin) || allowedOrigins.includes("*"))) {
    return requestOrigin;
  }

  if (requestOrigin && (requestOrigin.endsWith(".vercel.app") || requestOrigin.includes("localhost"))) {
    return requestOrigin;
  }

  return requestOrigin || allowedOrigins[0] || "*";
}

function applyCors(response, origin) {
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Origin", origin || "*");
  response.setHeader("Vary", "Origin");
}

module.exports = { applyCors, getAllowedOrigin };
