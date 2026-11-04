let iconColumnChecked = false;
let routeProgressColumnsChecked = false;

async function ensureListIconColumn(pool) {
  if (!iconColumnChecked && pool && typeof pool.query === "function") {
    iconColumnChecked = true;
    try {
      await pool.query("ALTER TABLE shopping_list ADD COLUMN IF NOT EXISTS icone VARCHAR(32)");
    } catch {
      // Em testes unitários com mocks de pool ou bancos sem a tabela real, ignora silenciosamente
    }
  }
  if (!routeProgressColumnsChecked && pool && typeof pool.query === "function") {
    routeProgressColumnsChecked = true;
    try {
      await pool.query("ALTER TABLE shopping_list ADD COLUMN IF NOT EXISTS rota_em_andamento BOOLEAN NOT NULL DEFAULT FALSE");
      await pool.query("ALTER TABLE shopping_list_item ADD COLUMN IF NOT EXISTS coletado BOOLEAN NOT NULL DEFAULT FALSE");
      await pool.query("ALTER TABLE shopping_list_item ADD COLUMN IF NOT EXISTS nao_encontrado BOOLEAN NOT NULL DEFAULT FALSE");
    } catch {
      // Em testes unitários com mocks de pool ou bancos sem a tabela real, ignora silenciosamente
    }
  }
}

function normalizeListName(value) {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name && name.length <= 255 ? name : null;
}

function normalizeListEmoji(value) {
  if (typeof value !== "string") return null;
  const emoji = value.trim();
  return emoji && emoji.length <= 32 ? emoji : null;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

async function listUserLists(pool, ownerId) {
  await ensureListIconColumn(pool);
  const result = await pool.query(
    `SELECT
       l.id,
       l.nome AS name,
       l.icone AS emoji,
       l.filial_id AS "storeId",
       f.nome AS "storeName",
       l.status,
       l.rota_em_andamento AS "routeInProgress",
       l.created_at AS "createdAt",
       l.updated_at AS "updatedAt",
       COALESCE(SUM(i.quantidade), 0)::INTEGER AS "itemCount",
       COUNT(i.produto_id)::INTEGER AS "productCount",
       COALESCE(COUNT(i.produto_id) FILTER (WHERE i.coletado = TRUE), 0)::INTEGER AS "collectedCount",
       COALESCE(COUNT(i.produto_id) FILTER (WHERE i.nao_encontrado = TRUE), 0)::INTEGER AS "notFoundCount",
       COALESCE(SUM(i.quantidade * i.preco_unitario), 0)::NUMERIC(10, 2) AS total,
       COALESCE(
         BOOL_OR(i.produto_id IS NOT NULL AND p.no_id IS NULL AND p.corredor IS NULL AND p.prateleira IS NULL),
         FALSE
       ) AS "hasLocationWarning",
       COALESCE(
         json_agg(
           json_build_object(
             'productId', i.produto_id,
             'name', p.nome,
             'size', p.tamanho,
             'category', p.categoria,
             'aisle', p.corredor,
             'shelf', p.prateleira,
             'nodeId', p.no_id,
             'quantity', i.quantidade,
             'unitPrice', i.preco_unitario,
             'collected', COALESCE(i.coletado, FALSE),
             'notFound', COALESCE(i.nao_encontrado, FALSE)
           )
         ) FILTER (WHERE i.produto_id IS NOT NULL),
         '[]'::json
       ) AS items
     FROM shopping_list l
     JOIN filial f ON f.id = l.filial_id
     LEFT JOIN shopping_list_item i ON i.list_id = l.id
     LEFT JOIN produto p ON p.id = i.produto_id
     WHERE l.admin_user_id = $1
     GROUP BY l.id, f.nome
     ORDER BY l.updated_at DESC, l.created_at DESC`,
    [ownerId],
  );
  return result.rows.map((row) => ({
    ...row,
    emoji: row.emoji || null,
    routeInProgress: Boolean(row.routeInProgress),
    collectedCount: Number(row.collectedCount || 0),
    notFoundCount: Number(row.notFoundCount || 0),
    total: Number(row.total || 0),
    hasLocationWarning: Boolean(row.hasLocationWarning),
    items: Array.isArray(row.items) ? row.items : [],
  }));
}

async function getListSummary(pool, listId, ownerId) {
  await ensureListIconColumn(pool);
  const result = await pool.query(
    `SELECT
       l.id,
       l.nome AS name,
       l.icone AS emoji,
       l.filial_id AS "storeId",
       f.nome AS "storeName",
       l.rota_em_andamento AS "routeInProgress",
       COALESCE(SUM(i.quantidade), 0)::INTEGER AS "itemCount",
       COUNT(i.produto_id)::INTEGER AS "productCount",
       COALESCE(COUNT(i.produto_id) FILTER (WHERE i.coletado = TRUE), 0)::INTEGER AS "collectedCount",
       COALESCE(COUNT(i.produto_id) FILTER (WHERE i.nao_encontrado = TRUE), 0)::INTEGER AS "notFoundCount",
       COALESCE(SUM(i.quantidade * i.preco_unitario), 0)::NUMERIC(10, 2) AS total,
       COALESCE(
         BOOL_OR(i.produto_id IS NOT NULL AND p.no_id IS NULL AND p.corredor IS NULL AND p.prateleira IS NULL),
         FALSE
       ) AS "hasLocationWarning",
       COALESCE(
         json_agg(
           json_build_object(
             'productId', i.produto_id,
             'name', p.nome,
             'size', p.tamanho,
             'category', p.categoria,
             'aisle', p.corredor,
             'shelf', p.prateleira,
             'nodeId', p.no_id,
             'quantity', i.quantidade,
             'unitPrice', i.preco_unitario,
             'collected', COALESCE(i.coletado, FALSE),
             'notFound', COALESCE(i.nao_encontrado, FALSE)
           )
         ) FILTER (WHERE i.produto_id IS NOT NULL),
         '[]'::json
       ) AS items
     FROM shopping_list l
     JOIN filial f ON f.id = l.filial_id
     LEFT JOIN shopping_list_item i ON i.list_id = l.id
     LEFT JOIN produto p ON p.id = i.produto_id
     WHERE l.id = $1 AND l.admin_user_id = $2
     GROUP BY l.id, f.nome`,
    [listId, ownerId],
  );
  const summary = result.rows[0];
  if (!summary) return null;
  return {
    ...summary,
    emoji: summary.emoji || null,
    routeInProgress: Boolean(summary.routeInProgress),
    collectedCount: Number(summary.collectedCount || 0),
    notFoundCount: Number(summary.notFoundCount || 0),
    total: Number(summary.total || 0),
    hasLocationWarning: Boolean(summary.hasLocationWarning),
    locationWarning: Boolean(summary.hasLocationWarning)
      ? "Alguns produtos não possuem localização e ficarão fora da rota."
      : null,
    items: Array.isArray(summary.items) ? summary.items : [],
  };
}

async function createList(pool, ownerId, storeId, name, emoji = null) {
  await ensureListIconColumn(pool);
  const normalizedName = normalizeListName(name);
  if (!normalizedName) return null;
  const normalizedEmoji = normalizeListEmoji(emoji);
  const result = await pool.query(
    `INSERT INTO shopping_list (admin_user_id, filial_id, nome, icone, status, confirmed_at)
     VALUES ($1, $2, $3, $4, 'confirmed', NOW())
     RETURNING id, nome AS name, icone AS emoji, filial_id AS "storeId", status, confirmed_at AS "confirmedAt",
               created_at AS "createdAt", updated_at AS "updatedAt"`,
    [ownerId, storeId, normalizedName, normalizedEmoji],
  );
  return result.rows[0] || null;
}

async function updateListMetadata(pool, listId, ownerId, { name, emoji, storeId, routeInProgress } = {}) {
  await ensureListIconColumn(pool);
  const normalizedName = name !== undefined ? normalizeListName(name) : undefined;
  if (name !== undefined && !normalizedName) {
    return { error: "Informe um nome de lista válido.", status: 400 };
  }
  const normalizedEmoji = emoji !== undefined ? normalizeListEmoji(emoji) : undefined;
  const normalizedStoreId = typeof storeId === "string" && storeId.trim() ? storeId.trim() : null;

  if (storeId !== undefined) {
    if (!normalizedStoreId || normalizedStoreId.startsWith("osm-")) {
      return { error: "Loja não encontrada.", status: 404 };
    }
    const storeCheck = await pool.query("SELECT id FROM filial WHERE id = $1", [normalizedStoreId]);
    if (!storeCheck.rows || !storeCheck.rows[0]) {
      return { error: "Loja não encontrada.", status: 404 };
    }
  }

  const result = await pool.query(
    `UPDATE shopping_list
     SET nome = COALESCE($3, nome),
         icone = CASE WHEN $4::BOOLEAN THEN $5 ELSE icone END,
         filial_id = COALESCE($6::UUID, filial_id),
         rota_em_andamento = CASE WHEN $7::BOOLEAN THEN $8::BOOLEAN ELSE rota_em_andamento END,
         updated_at = NOW()
     WHERE id = $1 AND admin_user_id = $2
     RETURNING id, nome AS name, icone AS emoji, filial_id AS "storeId", status, rota_em_andamento AS "routeInProgress", updated_at AS "updatedAt"`,
    [
      listId,
      ownerId,
      normalizedName ?? null,
      emoji !== undefined,
      normalizedEmoji ?? null,
      normalizedStoreId,
      typeof routeInProgress === "boolean",
      Boolean(routeInProgress),
    ],
  );
  if (!result.rows[0]) {
    return { error: "Lista não encontrada.", status: 404 };
  }
  if (routeInProgress === false) {
    await pool.query(
      "UPDATE shopping_list_item SET coletado = FALSE, nao_encontrado = FALSE, updated_at = NOW() WHERE list_id = $1",
      [listId],
    );
  }
  return { list: result.rows[0] };
}

async function findProductForList(pool, listId, ownerId, productId) {
  const result = await pool.query(
    `SELECT p.id, p.filial_id AS "storeId", p.preco AS price, p.estoque > 0 AS "inStock",
            p.no_id AS "nodeId", p.corredor AS aisle, p.prateleira AS shelf
     FROM produto p
     JOIN shopping_list l ON l.filial_id = p.filial_id
     WHERE l.id = $1 AND l.admin_user_id = $2 AND p.id = $3`,
    [listId, ownerId, productId],
  );
  return result.rows[0] || null;
}

async function upsertListItem(pool, listId, ownerId, productId, quantity) {
  const normalizedQuantity = normalizeQuantity(quantity);
  if (!normalizedQuantity) return { error: "A quantidade deve ser um inteiro maior que zero.", status: 400 };
  const product = await findProductForList(pool, listId, ownerId, productId);
  if (!product) return { error: "Produto não encontrado para esta lista.", status: 404 };
  if (!product.inStock) return { error: "O produto está fora de estoque.", status: 409 };
  await pool.query(
    `INSERT INTO shopping_list_item (list_id, produto_id, quantidade, preco_unitario)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (list_id, produto_id)
     DO UPDATE SET quantidade = shopping_list_item.quantidade + EXCLUDED.quantidade,
                   preco_unitario = EXCLUDED.preco_unitario,
                   updated_at = NOW()`,
    [listId, productId, normalizedQuantity, product.price],
  );
  await pool.query("UPDATE shopping_list SET updated_at = NOW() WHERE id = $1 AND admin_user_id = $2", [listId, ownerId]);
  return { product };
}

async function updateListItem(pool, listId, ownerId, productId, payload) {
  await ensureListIconColumn(pool);
  const isObjectPayload = payload !== null && typeof payload === "object";
  const rawQuantity = isObjectPayload ? payload.quantity : payload;
  const hasQuantity = rawQuantity !== undefined;
  const normalizedQuantity = hasQuantity ? normalizeQuantity(rawQuantity) : null;
  if (hasQuantity && !normalizedQuantity) {
    return { error: "A quantidade deve ser um inteiro maior que zero.", status: 400 };
  }
  const hasCollected = isObjectPayload && typeof payload.collected === "boolean";
  const hasNotFound = isObjectPayload && typeof payload.notFound === "boolean";

  if (!hasQuantity && !hasCollected && !hasNotFound) {
    return { error: "Informe a quantidade ou o status de coleta do item.", status: 400 };
  }

  const result = await pool.query(
    `UPDATE shopping_list_item i
     SET quantidade = COALESCE($3::INTEGER, i.quantidade),
         coletado = CASE WHEN $5::BOOLEAN THEN $6::BOOLEAN ELSE i.coletado END,
         nao_encontrado = CASE WHEN $7::BOOLEAN THEN $8::BOOLEAN ELSE i.nao_encontrado END,
         updated_at = NOW()
     FROM shopping_list l
     WHERE i.list_id = l.id AND i.list_id = $1 AND l.admin_user_id = $2 AND i.produto_id = $4
     RETURNING i.produto_id, i.coletado AS collected, i.nao_encontrado AS "notFound"`,
    [
      listId,
      ownerId,
      normalizedQuantity,
      productId,
      hasCollected,
      Boolean(isObjectPayload && payload.collected),
      hasNotFound,
      Boolean(isObjectPayload && payload.notFound),
    ],
  );
  if (!result.rows[0]) return { error: "Item não encontrado nesta lista.", status: 404 };

  if (hasCollected || hasNotFound) {
    const progressResult = await pool.query(
      `SELECT
         COUNT(produto_id)::INTEGER AS total,
         COUNT(produto_id) FILTER (WHERE coletado = TRUE OR nao_encontrado = TRUE)::INTEGER AS done
       FROM shopping_list_item
       WHERE list_id = $1`,
      [listId],
    );
    const { total = 0, done = 0 } = progressResult.rows[0] || {};
    const stillInProgress = total > 0 && done < total;
    await pool.query(
      "UPDATE shopping_list SET rota_em_andamento = $3, updated_at = NOW() WHERE id = $1 AND admin_user_id = $2",
      [listId, ownerId, stillInProgress],
    );
    if (!stillInProgress && total > 0 && done >= total) {
      await pool.query(
        "UPDATE shopping_list_item SET coletado = FALSE, nao_encontrado = FALSE WHERE list_id = $1",
        [listId],
      );
    }
  } else {
    await pool.query("UPDATE shopping_list SET updated_at = NOW() WHERE id = $1 AND admin_user_id = $2", [listId, ownerId]);
  }
  return { product: result.rows[0] };
}

async function deleteList(pool, listId, ownerId) {
  const result = await pool.query(
    "DELETE FROM shopping_list WHERE id = $1 AND admin_user_id = $2 RETURNING id",
    [listId, ownerId],
  );
  return Boolean(result.rows[0]);
}

async function removeListItem(pool, listId, ownerId, productId) {
  const result = await pool.query(
    `DELETE FROM shopping_list_item i
     USING shopping_list l
     WHERE i.list_id = l.id AND i.list_id = $1 AND l.admin_user_id = $2 AND i.produto_id = $3
     RETURNING i.produto_id`,
    [listId, ownerId, productId],
  );
  if (!result.rows[0]) return false;
  await pool.query("UPDATE shopping_list SET updated_at = NOW() WHERE id = $1 AND admin_user_id = $2", [listId, ownerId]);
  return true;
}

module.exports = {
  createList,
  deleteList,
  getListSummary,
  listUserLists,
  normalizeListEmoji,
  normalizeListName,
  normalizeQuantity,
  removeListItem,
  updateListItem,
  updateListMetadata,
  upsertListItem,
};
