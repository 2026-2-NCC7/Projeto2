function sendJson(response, statusCode, payload, origin) {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request, maxBytes) {
  const chunks = [];
  let bytesRead = 0;
  for await (const chunk of request) {
    bytesRead += chunk.length;
    if (bytesRead > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

module.exports = { readJsonBody, sendJson };
