function distanceBetween(nodes, from, to) {
  const fromNode = nodes.get(from);
  const toNode = nodes.get(to);
  if (!fromNode || !toNode) return null;
  return Math.sqrt(
    ((Number(fromNode.x) || 0) - (Number(toNode.x) || 0)) ** 2 +
    ((Number(fromNode.y) || 0) - (Number(toNode.y) || 0)) ** 2,
  );
}

function shortestPath(adjacency, nodes, start, end) {
  const distances = new Map([[start, 0]]);
  const previous = new Map();
  const pending = new Set([start]);

  while (pending.size) {
    let current = null;
    for (const candidate of pending) {
      if (current === null || (distances.get(candidate) ?? Infinity) < (distances.get(current) ?? Infinity)) {
        current = candidate;
      }
    }
    pending.delete(current);
    if (current === end) break;
    for (const edge of adjacency.get(current) || []) {
      const nextDistance = (distances.get(current) ?? Infinity) + edge.distance;
      if (nextDistance < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, nextDistance);
        previous.set(edge.to, current);
        pending.add(edge.to);
      }
    }
  }

  if (!distances.has(end)) return null;
  const path = [];
  for (let node = end; node !== undefined; node = previous.get(node)) path.unshift(node);
  return { path, distance: distances.get(end) };
}

function buildAdjacency(edges, nodes) {
  const adjacency = new Map();
  for (const edge of edges) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to)) continue;
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push({ to: edge.to, distance: Number(edge.distance) });
    if (edge.bidirectional) {
      if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
      adjacency.get(edge.to).push({ to: edge.from, distance: Number(edge.distance) });
    }
  }
  return adjacency;
}

async function calculateListRoute(pool, listId, ownerId) {
  const listResult = await pool.query(
    `SELECT l.id, l.nome AS name, l.filial_id AS "storeId", l.status,
            f.nome AS "storeName"
     FROM shopping_list l
     JOIN filial f ON f.id = l.filial_id
     WHERE l.id = $1 AND l.admin_user_id = $2`,
    [listId, ownerId],
  );
  const list = listResult.rows[0];
  if (!list) return { error: "Lista não encontrada.", status: 404 };
  if (list.status !== "confirmed") {
    return { error: "A lista precisa ser confirmada antes de calcular a rota.", status: 409 };
  }

  const itemResult = await pool.query(
    `SELECT i.produto_id AS "productId", i.quantidade AS quantity,
            p.nome AS name, p.no_id AS "nodeId",
            p.corredor AS aisle, p.prateleira AS shelf
     FROM shopping_list_item i
     JOIN produto p ON p.id = i.produto_id
     WHERE i.list_id = $1
     ORDER BY i.created_at`,
    [listId],
  );
  const items = itemResult.rows;
  const unlocatedItems = items.filter((item) => item.nodeId === null);
  const locatedItems = items.filter((item) => item.nodeId !== null);
  const graphNodesResult = await pool.query(
    `SELECT id, ST_X(coordenadas) AS x, ST_Y(coordenadas) AS y, tipo, nome
     FROM no_grafo
     WHERE filial_id = $1`,
    [list.storeId],
  );
  const edgeResult = await pool.query(
    `SELECT origem_id AS "from", destino_id AS "to",
            distancia_metros AS distance, bidirecional AS bidirectional
     FROM aresta e
     JOIN no_grafo n ON n.id = e.origem_id
     WHERE n.filial_id = $1`,
    [list.storeId],
  );
  const nodes = new Map(graphNodesResult.rows.map((node) => [String(node.id), node]));
  const adjacency = buildAdjacency(edgeResult.rows.map((edge) => ({
    ...edge,
    from: String(edge.from),
    to: String(edge.to),
  })), nodes);
  const entrance = graphNodesResult.rows.find((node) => node.tipo === "entrada");
  const orderedStops = [];
  let currentNode = entrance ? String(entrance.id) : null;
  let totalDistance = 0;

  for (const item of locatedItems) {
    const target = String(item.nodeId);
    const segment = currentNode && currentNode !== target
      ? shortestPath(adjacency, nodes, currentNode, target)
      : { path: [target], distance: 0 };
    if (!segment) {
      unlocatedItems.push({ ...item, reason: "Não há caminho conectado no grafo da loja." });
      continue;
    }
    totalDistance += segment.distance;
    orderedStops.push({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      nodeId: item.nodeId,
      aisle: item.aisle,
      shelf: item.shelf,
      path: segment.path.map((nodeId) => Number(nodeId)),
      distance: segment.distance,
    });
    currentNode = target;
  }

  return {
    route: {
      list,
      stops: orderedStops,
      unlocatedItems,
      totalDistance,
      hasLocationWarning: unlocatedItems.length > 0,
      locationWarning: unlocatedItems.length
        ? "Alguns produtos não possuem localização ou não estão conectados ao grafo e ficaram fora da rota."
        : null,
    },
  };
}

async function calculateStoreRoute(pool, storeId, rawItems) {
  const storeResult = await pool.query(
    "SELECT id, nome AS name FROM filial WHERE id = $1",
    [storeId],
  );
  const store = storeResult.rows[0];
  if (!store) return { error: "Loja não encontrada.", status: 404 };

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: "Adicione pelo menos um produto na lista para gerar a rota.", status: 400 };
  }

  const normalizedMap = new Map();
  for (const entry of rawItems) {
    const productId = Number.parseInt(entry?.productId ?? entry?.id, 10);
    const quantity = Number.parseInt(entry?.quantity ?? 1, 10);
    if (!Number.isFinite(productId) || productId <= 0) continue;
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    normalizedMap.set(productId, (normalizedMap.get(productId) || 0) + safeQuantity);
  }

  const productIds = Array.from(normalizedMap.keys());
  if (productIds.length === 0) {
    return { error: "Informe produtos válidos para calcular a rota.", status: 400 };
  }

  const productResult = await pool.query(
    `SELECT p.id AS "productId", p.nome AS name, p.categoria AS category,
            p.tamanho AS size, p.no_id AS "nodeId",
            p.corredor AS aisle, p.prateleira AS shelf
     FROM produto p
     WHERE p.filial_id = $1 AND p.id = ANY($2::bigint[])`,
    [storeId, productIds],
  );

  const productsById = new Map(productResult.rows.map((row) => [Number(row.productId), row]));
  const items = productIds
    .map((id) => {
      const product = productsById.get(id);
      if (!product) return null;
      return {
        ...product,
        productId: Number(product.productId),
        quantity: normalizedMap.get(id) || 1,
      };
    })
    .filter(Boolean);

  if (items.length === 0) {
    return { error: "Nenhum produto da lista foi encontrado nesta loja.", status: 404 };
  }

  const unlocatedItems = items.filter((item) => item.nodeId === null);
  const locatedItems = items.filter((item) => item.nodeId !== null);

  const graphNodesResult = await pool.query(
    `SELECT id, ST_X(coordenadas) AS x, ST_Y(coordenadas) AS y, tipo, nome
     FROM no_grafo
     WHERE filial_id = $1`,
    [storeId],
  );
  const edgeResult = await pool.query(
    `SELECT origem_id AS "from", destino_id AS "to",
            distancia_metros AS distance, bidirecional AS bidirectional
     FROM aresta e
     JOIN no_grafo n ON n.id = e.origem_id
     WHERE n.filial_id = $1`,
    [storeId],
  );

  const nodes = new Map(graphNodesResult.rows.map((node) => [String(node.id), node]));
  const adjacency = buildAdjacency(
    edgeResult.rows.map((edge) => ({
      ...edge,
      from: String(edge.from),
      to: String(edge.to),
    })),
    nodes,
  );
  const entrance = graphNodesResult.rows.find((node) => node.tipo === "entrada");
  const orderedStops = [];
  let currentNode = entrance ? String(entrance.id) : null;
  let totalDistance = 0;

  for (const item of locatedItems) {
    const target = String(item.nodeId);
    const segment = currentNode && currentNode !== target
      ? shortestPath(adjacency, nodes, currentNode, target)
      : { path: [target], distance: 0 };
    if (!segment) {
      unlocatedItems.push({ ...item, reason: "Não há caminho conectado no grafo da loja." });
      continue;
    }
    totalDistance += segment.distance;
    orderedStops.push({
      productId: item.productId,
      name: item.name,
      category: item.category,
      size: item.size,
      quantity: item.quantity,
      nodeId: item.nodeId,
      aisle: item.aisle,
      shelf: item.shelf,
      path: segment.path.map((nodeId) => Number(nodeId)),
      distance: segment.distance,
    });
    currentNode = target;
  }

  return {
    route: {
      store,
      stops: orderedStops,
      unlocatedItems,
      totalDistance,
      hasLocationWarning: unlocatedItems.length > 0,
      locationWarning: unlocatedItems.length
        ? "Alguns produtos não possuem localização ou não estão conectados ao grafo e ficaram fora da rota."
        : null,
    },
  };
}

module.exports = { calculateListRoute, calculateStoreRoute, shortestPath };
