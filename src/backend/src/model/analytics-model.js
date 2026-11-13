const PERIOD_DAYS = new Map([["day", 1], ["week", 7], ["month", 30]]);

async function recordAnalyticsEvent(pool, { sessionId, storeId, type, payload = {} }) {
  const allowedTypes = new Set(["session_started", "product_search", "route_calculated", "route_completed", "product_not_found", "recommendation_impression", "recommendation_added", "recommendation_collected", "promotion_impression", "promotion_added", "promotion_collected", "promotion_dismissed"]);
  if (!allowedTypes.has(type) || typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return { error: "Evento inválido." };
  }
  const safePayload = {};
  if (typeof payload.query === "string") safePayload.query = payload.query.trim().slice(0, 120);
  if (typeof payload.productName === "string") safePayload.productName = payload.productName.trim().slice(0, 160);
  if (typeof payload.aisle === "string") safePayload.aisle = payload.aisle.trim().slice(0, 80);
  if (typeof payload.productId === "string" || Number.isInteger(payload.productId)) safePayload.productId = String(payload.productId).slice(0, 80);
  if (typeof payload.source === "string") safePayload.source = payload.source.slice(0, 40);
  if (typeof payload.promoId === "string") safePayload.promoId = payload.promoId.slice(0, 80);
  if (typeof payload.offer === "string") safePayload.offer = payload.offer.trim().slice(0, 120);
  if (Number.isFinite(payload.value) && payload.value >= 0 && payload.value <= 1000000) safePayload.value = Math.round(payload.value * 100) / 100;
  if (Number.isInteger(payload.quantity) && payload.quantity > 0 && payload.quantity <= 999) safePayload.quantity = payload.quantity;
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
  const recommendationImpressions = events.filter((event) => event.type === "recommendation_impression");
  const recommendationAdds = events.filter((event) => event.type === "recommendation_added");
  const recommendationCollected = events.filter((event) => event.type === "recommendation_collected");
  const promotionImpressions = events.filter((event) => event.type === "promotion_impression");
  const promotionAdds = events.filter((event) => event.type === "promotion_added");
  const promotionCollected = events.filter((event) => event.type === "promotion_collected");
  const promotionDismissals = events.filter((event) => event.type === "promotion_dismissed");
  const counts = new Map();
  for (const event of searches) {
    const name = event.payload?.productName || event.payload?.query || "Busca sem termo";
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const recommendationProducts = new Map();
  for (const event of events.filter((item) => ["recommendation_impression", "recommendation_added", "recommendation_collected"].includes(item.type))) {
    const name = event.payload?.productName || "Produto não identificado";
    const current = recommendationProducts.get(name) || { productName: name, aisle: event.payload?.aisle || "Não informado", impressions: 0, additions: 0, collected: 0, estimatedRevenue: 0 };
    if (event.type === "recommendation_impression") current.impressions += 1;
    if (event.type === "recommendation_added") current.additions += 1;
    if (event.type === "recommendation_collected") {
      current.collected += Number(event.payload?.quantity || 1);
      current.estimatedRevenue += Number(event.payload?.value || 0);
    }
    recommendationProducts.set(name, current);
  }
  const aisleCounts = new Map();
  for (const event of events) {
    if (event.type === "route_calculated") {
      const aisles = Array.isArray(event.payload?.aisles) ? event.payload.aisles : [];
      for (const aisle of new Set(aisles)) aisleCounts.set(aisle, (aisleCounts.get(aisle) || 0) + 1);
    } else if (["recommendation_impression", "recommendation_added", "promotion_impression", "promotion_added"].includes(event.type) && event.payload?.aisle) {
      aisleCounts.set(event.payload.aisle, (aisleCounts.get(event.payload.aisle) || 0) + 1);
    }
  }
  const notFound = events.filter((event) => event.type === "product_not_found");
  const notFoundItemsMap = new Map();
  for (const event of notFound) {
    const name = event.payload?.productName || "Produto não identificado";
    const key = `${name.toLocaleLowerCase()}|${event.payload?.aisle || ""}`;
    const item = notFoundItemsMap.get(key) || { productName: name, aisle: event.payload?.aisle || "Não informado", reports: 0, lastReportedAt: event.createdAt };
    item.reports += 1;
    if (new Date(event.createdAt) > new Date(item.lastReportedAt)) item.lastReportedAt = event.createdAt;
    notFoundItemsMap.set(key, item);
  }
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
    recommendations: {
      impressions: recommendationImpressions.length,
      additions: recommendationAdds.length,
      collected: recommendationCollected.reduce((sum, event) => sum + Number(event.payload?.quantity || 1), 0),
      estimatedRevenue: recommendationCollected.reduce((sum, event) => sum + Number(event.payload?.value || 0), 0),
      conversionRate: recommendationImpressions.length ? Math.round(recommendationCollected.length / recommendationImpressions.length * 100) : 0,
      products: [...recommendationProducts.values()].sort((a, b) => b.estimatedRevenue - a.estimatedRevenue || b.impressions - a.impressions),
    },
    promotions: { impressions: promotionImpressions.length, additions: promotionAdds.length, collected: promotionCollected.reduce((sum, event) => sum + Number(event.payload?.quantity || 1), 0), estimatedRevenue: promotionCollected.reduce((sum, event) => sum + Number(event.payload?.value || 0), 0), dismissals: promotionDismissals.length, conversionRate: promotionImpressions.length ? Math.round(promotionCollected.length / promotionImpressions.length * 100) : 0 },
    notFoundItems: [...notFoundItemsMap.values()].sort((a, b) => b.reports - a.reports || new Date(b.lastReportedAt) - new Date(a.lastReportedAt)),
    topSearches: uniqueSearches,
    unavailableProducts: [...notFoundCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    heatmap, timeline: [...daysMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    uniqueSessions: uniqueSessions.size,
  };
}

module.exports = { getAnalytics, recordAnalyticsEvent };
