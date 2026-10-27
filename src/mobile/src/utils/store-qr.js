const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isStoreId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value.trim());
}

function getStoreIdFromUrl(value) {
  try {
    const url = new URL(value);
    const queryId = url.searchParams.get("storeId") || url.searchParams.get("filialId");
    if (isStoreId(queryId)) return queryId.trim();
    const pathMatch = url.pathname.match(/\/stores\/([^/]+)/i);
    return pathMatch && isStoreId(pathMatch[1]) ? pathMatch[1] : null;
  } catch {
    return null;
  }
}

export function parseStoreQrPayload(rawValue) {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return { storeId: null, error: "QR Code vazio." };
  }

  const value = rawValue.trim();
  if (isStoreId(value)) return { storeId: value };

  try {
    const payload = JSON.parse(value);
    const storeId = payload?.storeId || payload?.filialId;
    if (isStoreId(storeId)) return { storeId: storeId.trim() };
  } catch {
    // O QR Code também pode conter uma URL ou um UUID puro.
  }

  const storeId = getStoreIdFromUrl(value);
  return storeId
    ? { storeId }
    : { storeId: null, error: "QR Code inválido. Use o código fornecido pela loja." };
}
