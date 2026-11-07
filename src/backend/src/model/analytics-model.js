const PERIOD_DAYS = new Map([["day", 1], ["week", 7], ["month", 30]]);

async function recordAnalyticsEvent(pool, { sessionId, storeId, type, payload = {} }) {
  const allowedTypes = new Set(["session_started", "product_search", "route_calculated", "route_completed", "product_not_found"]);
  if (!allowedTypes.has(type) || typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return { error: "Evento inválido." };
  }
  const safePayload = {};
  if (typeof payload.query === "string") safePayload.query = payload.query.trim().slice(0, 120);
  if (typeof payload.productName === "string") safePayload.productName = payload.productName.trim().slice(0, 160);
  if (typeof payload.aisle === "string") safePayload.aisle = payload.aisle.trim().slice(0, 80);
  if (Number.isInteger(payload.itemCount) && payload.itemCount >= 0 && payload.itemCount <= 500) safePayload.itemCount = payload.itemCount;
  if (Number.isInteger(payload.resultCount) && payload.resultCount >= 0 && payload.resultCount <= 500) safePayload.resultCount = payload.resultCount;
  if (Array.isArray(payload.aisles)) safePayload.aisles = payload.aisles.filter((aisle) => typeof aisle === "string").slice(0, 40).map((aisle) => aisle.slice(0, 80));
  await pool.query(
    `INSERT INTO analytics_event (session_id, filial_id, event_type, payload)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [sessionId, storeId || null, type, JSON.stringify(safePayload)],
  );
  return { recorded: true };
}

async function getAnalytics(pool, { period = "week", storeId = "" } = {}) {
  const days = PERIOD_DAYS.get(period) || 7;
  const params = [days];
  let storeFilter = "";
  if (storeId) {
    params.push(storeId);
    storeFilter = ` AND filial_id = $${params.length}`;
  }
  const { rows } = await pool.query(
    `SELECT session_id AS "sessionId", event_type AS type, payload, created_at AS "createdAt"
       FROM analytics_event
      WHERE created_at >= NOW() - ($1::integer * INTERVAL '1 day')${storeFilter}
      ORDER BY created_at DESC`,
    params,
  );
  const events = rows.map((row) => ({ ...row, payload: typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload }));
  const uniqueSessions = new Set(events.filter((event) => event.type === "session_started").map((event) => event.sessionId));
  const sessions = uniqueSessions.size;
  const completed = events.filter((event) => event.type === "route_completed").length;
  const calculated = events.filter((event) => event.type === "route_calculated").length;
  const searches = events.filter((event) => event.type === "product_search");
  const counts = new Map();
  for (const event of searches) {
    const name = event.payload?.productName || event.payload?.query || "Busca sem termo";
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const aisleCounts = new Map();
  for (const event of events.filter((item) => item.type === "route_calculated")) {
    const aisles = Array.isArray(event.payload?.aisles) ? event.payload.aisles : [];
    for (const aisle of new Set(aisles)) aisleCounts.set(aisle, (aisleCounts.get(aisle) || 0) + 1);
  }
  const notFound = events.filter((event) => event.type === "product_not_found");
  const notFoundCounts = new Map();
  const unavailableEvents = [
    ...notFound,
    ...searches.filter((event) => event.payload?.resultCount === 0),
  ];
  for (const event of unavailableEvents) {
    const name = event.payload?.productName || event.payload?.query || "Produto não identificado";
    notFoundCounts.set(name, (notFoundCounts.get(name) || 0) + 1);
  }
  const uniqueSearches = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
  const heatmap = [...aisleCounts.entries()].sort((a, b) => b[1] - a[1]).map(([aisle, visits]) => ({ aisle, visits }));
  const daysMap = new Map();
  const seenSessions = new Set();
  const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });
  for (const event of [...events].reverse()) {
    const day = localDate.format(new Date(event.createdAt));
    const bucket = daysMap.get(day) || { date: day, sessions: 0, calculated: 0, completed: 0 };
    if (event.type === "session_started" && !seenSessions.has(event.sessionId)) {
      bucket.sessions += 1;
      seenSessions.add(event.sessionId);
    }
    if (event.type === "route_calculated") bucket.calculated += 1;
    if (event.type === "route_completed") bucket.completed += 1;
    daysMap.set(day, bucket);
  }
  return {
    period, days, source: "live", sessions, routesCalculated: calculated, completedRoutes: completed,
    completionRate: calculated ? Math.round((completed / calculated) * 100) : 0,
    searches: searches.length, searchesWithoutResult: notFound.length + searches.filter((event) => event.payload?.resultCount === 0).length,
    topSearches: uniqueSearches,
    unavailableProducts: [...notFoundCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    heatmap, timeline: [...daysMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    uniqueSessions: uniqueSessions.size,
  };
}

module.exports = { getAnalytics, recordAnalyticsEvent };
