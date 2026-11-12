/**
 * Motor e geometria compartilhados do Mapa Esquemático Indoor do Ach.ai
 * Consumido tanto pelo /mobile (tema mais branco/neutro) quanto pelo /webapp (tema mais bege/quente).
 */

export const INDOOR_MAP_WIDTH = 350;
export const INDOOR_MAP_HEIGHT = 230;
export const TOP_WALKWAY_Y = 28;
export const BOTTOM_WALKWAY_Y = 190;
export const ENTRANCE_POINT = { x: 22, y: 212 };

// Seis gôndolas delimitam sete corredores caminháveis.
export const INDOOR_SHELVES = Array.from({ length: 6 }, (_, index) => ({
  id: `p${index + 1}`, label: `P${index + 1}`, left: 41 + index * (298 / 6), top: 52, width: 20, height: 126,
}));

// Os 5 corredores caminháveis ficam nos vãos livres ENTRE (e nas laterais) das prateleiras
const AISLE_LABELS = ["CAFÉ/PÃO", "GRÃOS", "LIMPEZA", "LATIC.", "FRIOS", "BEBIDAS", "HORTI"];

export const INDOOR_CORRIDORS = Array.from({ length: 7 }, (_, index) => {
  const centerX = 26 + index * (298 / 6);
  return {
    id: `c${index + 1}`, index, label: `C${index + 1}`, aisleLabel: AISLE_LABELS[index], name: `Corredor ${index + 1}`,
    centerX, minX: Math.max(0, centerX - 25), maxX: Math.min(350, centerX + 25),
    shelfLabel: `Gôndola P${Math.min(index + 1, 6)}`,
  };
});

// Paletas de cores para o mesmo mapa esquemático:
// - mobile: mais branco/neutro (#F7F7F3 / #FFFFFF / #EDEDE7)
// - webapp: mais bege/quente (#FFF7F1 / #F6E6D6 / #F2D0A8)
export const INDOOR_MAP_THEMES = {
  mobile: {
    canvasBg: "#F7F7F3",
    canvasBorder: "#E8E8E0",
    headerLabelColor: "#66645F",
    footerLabelColor: "#66645F",
    corridorCodeColor: "#85857B",
    shelfBg: "#EDEDE7",
    shelfBorder: "transparent",
    shelfLabelColor: "#66645F",
    collectedLineStroke: "#85857B",
    upcomingLineStroke: "#F26900",
    pinCollectedBg: "#85857B",
    pinCollectedBorder: "#85857B",
    pinCollectedText: "#FFFFFF",
    pinCurrentBg: "#F26900",
    pinCurrentBorder: "#F26900",
    pinCurrentText: "#1F1F1F",
    pinPendingBg: "#FFFFFF",
    pinPendingBorder: "#F26900",
    pinPendingText: "#F26900",
    userPulseFill: "rgba(242, 105, 0, 0.22)",
    userCoreFill: "#1F1F1F",
    userCoreStroke: "#F26900",
  },
  webapp: {
    canvasBg: "#FFF7F1",
    canvasBorder: "#F2D0A8",
    headerLabelColor: "#7A5A3B",
    footerLabelColor: "#7A5A3B",
    corridorCodeColor: "#8A5A2B",
    shelfBg: "#F6E7D7",
    shelfBorder: "#F2D0A8",
    shelfLabelColor: "#7A5A3B",
    collectedLineStroke: "#C7A684",
    upcomingLineStroke: "#F26900",
    pinCollectedBg: "#C7A684",
    pinCollectedBorder: "#C7A684",
    pinCollectedText: "#FFFFFF",
    pinCurrentBg: "#F26900",
    pinCurrentBorder: "#F26900",
    pinCurrentText: "#191919",
    pinPendingBg: "#FFFBF7",
    pinPendingBorder: "#F26900",
    pinPendingText: "#F26900",
    userPulseFill: "rgba(242, 105, 0, 0.24)",
    userCoreFill: "#191919",
    userCoreStroke: "#F26900",
  },
};

export function isPointInsideIndoorMap(x, y) {
  return x >= 0 && x <= INDOOR_MAP_WIDTH && y >= 0 && y <= INDOOR_MAP_HEIGHT;
}

export function isPointOnIndoorShelf(x, y) {
  return INDOOR_SHELVES.some(
    (shelf) =>
      x >= shelf.left &&
      x <= shelf.left + shelf.width &&
      y >= shelf.top &&
      y <= shelf.top + shelf.height,
  );
}

export function getNearestIndoorCorridor(x) {
  return INDOOR_CORRIDORS.reduce((best, corr) => {
    return Math.abs(corr.centerX - x) < Math.abs(best.centerX - x) ? corr : best;
  }, INDOOR_CORRIDORS[0]);
}

export function resolveStopCorridorIndex(stop) {
  const aisleText = String(stop?.aisle || stop?.location?.aisle || "").toLowerCase();
  const categoryText = String(stop?.category || "").toLowerCase();
  const nameText = String(stop?.name || "").toLowerCase();
  const nodeId = Number(stop?.nodeId ?? stop?.location?.nodeId);

  if (aisleText.includes("horti") || aisleText.includes("setor a") || categoryText.includes("horti")) return 6;
  if (aisleText.includes("corredor")) {
    const aisleNumber = Number(aisleText.match(/corredor\s*(\d+)/)?.[1]);
    if (Number.isFinite(aisleNumber)) return Math.max(0, Math.min(6, aisleNumber - 1));
  }
  if (categoryText.includes("latic") || nameText.includes("leite") || nameText.includes("ovo") || nameText.includes("queijo")) return 3;
  if (categoryText.includes("bebida")) return 5;

  if (nodeId === 4) return 6;
  if (nodeId === 3) return 3;
  if (nodeId === 2) return 1;
  if (nodeId === 1) return 0;

  const coordX = Number(stop?.coordinates?.x);
  if (Number.isFinite(coordX) && coordX > 0) {
    return Math.max(0, Math.min(6, Math.round((coordX / 35) * 6)));
  }

  return 0;
}

export function resolveBaseStopY(stop, rankInCorridor = 0, totalInCorridor = 1) {
  const shelfText = String(stop?.shelf || stop?.location?.shelf || "").toLowerCase();
  const nameText = String(stop?.name || "").toLowerCase();

  let targetY = 124;
  if (shelfText.includes("superior") || shelfText.includes("banca")) {
    targetY = 79;
  } else if (shelfText.includes("inferior")) {
    targetY = 169;
  } else if (shelfText.includes("balcão") || shelfText.includes("balcao")) {
    targetY = 149;
  } else if (shelfText.includes("p1") && nameText.includes("café")) {
    targetY = 79;
  } else if (shelfText.includes("p1") || shelfText.includes("p2")) {
    targetY = 159;
  } else if (shelfText.includes("central")) {
    targetY = 109;
  }

  const coordY = Number(stop?.coordinates?.y);
  if (Number.isFinite(coordY) && coordY > 0 && !shelfText) {
    const clampedRatio = Math.min(1, Math.max(0, (coordY - 4) / 14));
    targetY = Math.round(62 + clampedRatio * 90);
  }

  if (totalInCorridor <= 1) {
    return targetY;
  }

  const candidateSlots = [62, 92, 122, 152];
  if (totalInCorridor <= candidateSlots.length) {
    return candidateSlots[rankInCorridor % candidateSlots.length];
  }
  return Math.min(
    166,
    Math.max(60, 62 + rankInCorridor * Math.floor(104 / Math.max(1, totalInCorridor - 1))),
  );
}

/**
 * Converte paradas vindas do backend ou da lista em nós georreferenciados no mapa esquemático compartilhado.
 */
export function mapStopsToIndoorGraphStops(rawStops, fallbackStops = []) {
  const sourceStops =
    Array.isArray(rawStops) && rawStops.length > 0 ? rawStops : fallbackStops;

  const corridorCounts = new Map();
  const corridorAssigned = sourceStops.map((stop) => {
    const corridorIndex =
      typeof stop.corridorIndex === "number"
        ? stop.corridorIndex
        : resolveStopCorridorIndex(stop);
    const count = corridorCounts.get(corridorIndex) || 0;
    corridorCounts.set(corridorIndex, count + 1);
    return { corridorIndex, rank: count };
  });

  const usedYsByCorridor = new Map();

  return sourceStops.map((stop, idx) => {
    const { corridorIndex, rank } = corridorAssigned[idx];
    const totalInCorridor = corridorCounts.get(corridorIndex) || 1;
    const corridor = INDOOR_CORRIDORS[corridorIndex] || INDOOR_CORRIDORS[0];
    const centerX = corridor.centerX;

    let centerY =
      typeof stop.centerY === "number" && sourceStops === fallbackStops
        ? stop.centerY
        : resolveBaseStopY(stop, rank, totalInCorridor);

    const usedYs = usedYsByCorridor.get(corridorIndex) || [];
    while (usedYs.some((existingY) => Math.abs(existingY - centerY) < 24)) {
      centerY = centerY + 28 <= 166 ? centerY + 28 : Math.max(60, centerY - 28);
      if (usedYs.some((existingY) => Math.abs(existingY - centerY) < 16)) {
        centerY = 62 + ((rank * 30) % 104);
        break;
      }
    }
    usedYs.push(centerY);
    usedYsByCorridor.set(corridorIndex, usedYs);

    const productId = stop.productId ?? stop.id ?? idx + 1;

    return {
      ...stop,
      productId,
      stopNodeKey: `stop_${productId}_${idx}`,
      aisle: stop.aisle || stop.location?.aisle || corridor.name,
      shelf: stop.shelf || stop.location?.shelf || corridor.shelfLabel,
      nodeId: stop.nodeId ?? stop.location?.nodeId ?? corridorIndex + 1,
      corridorIndex,
      centerX,
      centerY,
      initialCollected: Boolean(stop.initialCollected),
    };
  });
}

/**
 * Constrói o grafo indoor ortogonal (passarelas superior/inferior, corredores verticais, entrada e âncora do usuário).
 */
export function buildIndoorStoreGraph(stops, userAnchor = null) {
  const nodes = new Map();
  const adjacency = new Map();

  const addNode = (id, x, y, meta = {}) => {
    nodes.set(id, { id, x: Math.round(x), y: Math.round(y), ...meta });
    if (!adjacency.has(id)) {
      adjacency.set(id, []);
    }
  };

  const addEdge = (idA, idB) => {
    const a = nodes.get(idA);
    const b = nodes.get(idB);
    if (!a || !b || idA === idB) return;
    const weight = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    adjacency.get(idA).push({ to: idB, weight });
    adjacency.get(idB).push({ to: idA, weight });
  };

  const topTrackNodes = [];
  const bottomTrackNodes = [];

  INDOOR_CORRIDORS.forEach((corridor) => {
    const topId = `top_c${corridor.index}`;
    const bottomId = `bot_c${corridor.index}`;
    addNode(topId, corridor.centerX, TOP_WALKWAY_Y, {
      type: "walkway_top",
      corridorIndex: corridor.index,
    });
    addNode(bottomId, corridor.centerX, BOTTOM_WALKWAY_Y, {
      type: "walkway_bottom",
      corridorIndex: corridor.index,
    });
    topTrackNodes.push({ id: topId, x: corridor.centerX });
    bottomTrackNodes.push({ id: bottomId, x: corridor.centerX });
  });

  addNode("entrance", ENTRANCE_POINT.x, ENTRANCE_POINT.y, { type: "entrance" });
  addEdge("entrance", "bot_c0");

  const corridorVerticalLists = INDOOR_CORRIDORS.map((corridor) => [
    { id: `top_c${corridor.index}`, y: TOP_WALKWAY_Y },
    { id: `bot_c${corridor.index}`, y: BOTTOM_WALKWAY_Y },
  ]);

  stops.forEach((stop, idx) => {
    const key = stop.stopNodeKey || `stop_${stop.productId ?? idx + 1}_${idx}`;
    const corrIdx =
      typeof stop.corridorIndex === "number"
        ? stop.corridorIndex
        : resolveStopCorridorIndex(stop);
    const corr = INDOOR_CORRIDORS[corrIdx] || INDOOR_CORRIDORS[0];
    addNode(key, corr.centerX, stop.centerY, { type: "stop", stop });
    corridorVerticalLists[corr.index].push({ id: key, y: stop.centerY });
  });

  if (userAnchor && typeof userAnchor.x === "number" && typeof userAnchor.y === "number") {
    const ux = Math.round(userAnchor.x);
    const uy = Math.round(userAnchor.y);
    addNode("user", ux, uy, { type: "user" });

    if (uy <= 60) {
      const projId = "user_top_proj";
      addNode(projId, ux, TOP_WALKWAY_Y, { type: "proj" });
      addEdge("user", projId);
      topTrackNodes.push({ id: projId, x: ux });
    } else if (uy >= 188) {
      const projId = "user_bot_proj";
      addNode(projId, ux, BOTTOM_WALKWAY_Y, { type: "proj" });
      addEdge("user", projId);
      bottomTrackNodes.push({ id: projId, x: ux });
    } else {
      const nearestCorridor = getNearestIndoorCorridor(ux);
      const corrProjId = "user_corr_proj";
      addNode(corrProjId, nearestCorridor.centerX, uy, {
        type: "proj",
        corridorIndex: nearestCorridor.index,
      });
      addEdge("user", corrProjId);
      corridorVerticalLists[nearestCorridor.index].push({ id: corrProjId, y: uy });
    }
  }

  topTrackNodes.sort((a, b) => a.x - b.x);
  for (let i = 1; i < topTrackNodes.length; i += 1) {
    addEdge(topTrackNodes[i - 1].id, topTrackNodes[i].id);
  }

  bottomTrackNodes.sort((a, b) => a.x - b.x);
  for (let i = 1; i < bottomTrackNodes.length; i += 1) {
    addEdge(bottomTrackNodes[i - 1].id, bottomTrackNodes[i].id);
  }

  corridorVerticalLists.forEach((list) => {
    list.sort((a, b) => a.y - b.y);
    for (let i = 1; i < list.length; i += 1) {
      addEdge(list[i - 1].id, list[i].id);
    }
  });

  return { nodes, adjacency };
}

export function dijkstraShortestPath(graph, startNodeId, endNodeId) {
  const { nodes, adjacency } = graph;
  if (!nodes.has(startNodeId) || !nodes.has(endNodeId)) {
    return { pathIds: [], points: [], distance: Infinity };
  }

  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(nodes.keys());

  for (const key of nodes.keys()) {
    distances.set(key, Infinity);
  }
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let current = null;
    let bestDist = Infinity;

    for (const candidate of unvisited) {
      const d = distances.get(candidate) ?? Infinity;
      if (d < bestDist) {
        bestDist = d;
        current = candidate;
      }
    }

    if (current === null || bestDist === Infinity) break;
    unvisited.delete(current);
    if (current === endNodeId) break;

    const neighbors = adjacency.get(current) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;
      const alt = bestDist + edge.weight;
      if (alt < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, alt);
        previous.set(edge.to, current);
      }
    }
  }

  const totalDistance = distances.get(endNodeId) ?? Infinity;
  if (!Number.isFinite(totalDistance)) {
    return { pathIds: [], points: [], distance: Infinity };
  }

  const pathIds = [];
  let cursor = endNodeId;
  while (cursor !== undefined) {
    pathIds.unshift(cursor);
    cursor = previous.get(cursor);
  }

  const points = pathIds
    .map((id) => nodes.get(id))
    .filter(Boolean)
    .map((n) => ({ x: n.x, y: n.y }));

  return { pathIds, points, distance: totalDistance };
}

export function orderStopsWithDijkstra(stopsToOrder, startNodeId, userAnchor = null) {
  if (!Array.isArray(stopsToOrder) || stopsToOrder.length === 0) return [];

  const normalized = stopsToOrder.map((stop, idx) => ({
    ...stop,
    stopNodeKey: stop.stopNodeKey || `stop_${stop.productId ?? idx + 1}_${idx}`,
  }));

  const graph = buildIndoorStoreGraph(normalized, userAnchor);
  const stopsByCorridor = new Map();
  for (const stop of normalized) {
    const corridorStops = stopsByCorridor.get(stop.corridorIndex) || [];
    corridorStops.push(stop);
    stopsByCorridor.set(stop.corridorIndex, corridorStops);
  }

  // Percorre corredores em um único sentido e alterna o sentido dentro das gôndolas,
  // evitando a heurística gulosa que podia avançar até o fim e depois voltar.
  const corridorIndexes = [...stopsByCorridor.keys()].sort((a, b) => a - b);
  let corridorDirection = 1;
  if (userAnchor && corridorIndexes.length > 1) {
    const firstX = INDOOR_CORRIDORS[corridorIndexes[0]].centerX;
    const lastX = INDOOR_CORRIDORS[corridorIndexes[corridorIndexes.length - 1]].centerX;
    const midpointX = (firstX + lastX) / 2;
    if (userAnchor.x > midpointX) corridorDirection = -1;
  }
  if (corridorDirection < 0) corridorIndexes.reverse();

  let startsFromBottom = userAnchor ? userAnchor.y >= (TOP_WALKWAY_Y + BOTTOM_WALKWAY_Y) / 2 : true;
  const ordered = [];
  for (const corridorIndex of corridorIndexes) {
    const aisleStops = stopsByCorridor.get(corridorIndex) || [];
    aisleStops.sort((a, b) => startsFromBottom
      ? b.centerY - a.centerY
      : a.centerY - b.centerY);
    ordered.push(...aisleStops);
    startsFromBottom = !startsFromBottom;
  }

  let currentNodeId = graph.nodes.has(startNodeId) ? startNodeId : "entrance";
  return ordered.map((stop) => {
    const path = dijkstraShortestPath(graph, currentNodeId, stop.stopNodeKey);
    currentNodeId = stop.stopNodeKey;
    return { ...stop, dijkstraDistance: path.distance };
  });
}

export function flattenSegmentsToPointsAttr(segments) {
  return segments
    .filter((segment) => Array.isArray(segment) && segment.length > 1)
    .map((segment) => segment
      .filter((point, index) => index === 0 || point.x !== segment[index - 1].x || point.y !== segment[index - 1].y)
      .map((point) => `${Math.round(point.x)},${Math.round(point.y)}`)
      .join(" "));
}

export function computeIndoorRoutePolylines(stops, collectedIds, notFoundIds, userAnchor = null) {
  const graph = buildIndoorStoreGraph(stops, userAnchor);
  const collectedStops = stops.filter((s) => collectedIds.has(s.productId));
  const pendingStops = stops.filter(
    (s) => !collectedIds.has(s.productId) && !notFoundIds.has(s.productId),
  );

  const upcomingSegments = [];
  if (pendingStops.length > 0) {
    const startNodeId = userAnchor
      ? "user"
      : collectedStops.length > 0
        ? collectedStops[collectedStops.length - 1].stopNodeKey
        : "entrance";

    const firstSeg = dijkstraShortestPath(
      graph,
      startNodeId,
      pendingStops[0].stopNodeKey,
    );
    if (firstSeg.points.length > 1) {
      upcomingSegments.push(firstSeg.points);
    }
  }

  return {
    collectedPointsAttr: [],
    upcomingPointsAttr: flattenSegmentsToPointsAttr(upcomingSegments),
  };
}
