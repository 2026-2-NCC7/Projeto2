function getAllowedOrigin(requestOrigin, allowedOrigins) {
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return requestOrigin ? null : allowedOrigins[0];
}

function applyCors(response, origin) {
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
}

module.exports = { applyCors, getAllowedOrigin };
