function normalizeListName(value) {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name && name.length <= 255 ? name : null;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

async function getListSummary(pool, listId, ownerId) {
  const result = await pool.query(
    `SELECT
       l.id,
       l.nome AS name,
       l.filial_id AS "storeId",
       f.nome AS "storeName",
       COALESCE(SUM(i.quantidade), 0)::INTEGER AS "itemCount",
       COUNT(i.produto_id)::INTEGER AS "productCount",
       COALESCE(SUM(i.quantidade * i.preco_unitario), 0)::NUMERIC(10, 2) AS total,
       COALESCE(
         BOOL_OR(i.produto_id IS NOT NULL AND p.no_id IS NULL AND p.corredor IS NULL AND p.prateleira IS NULL),
         FALSE
       ) AS "hasLocationWarning"
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
    total: Number(summary.total || 0),
    hasLocationWarning: Boolean(summary.hasLocationWarning),
    locationWarning: Boolean(summary.hasLocationWarning)
      ? "Alguns produtos não possuem localização e ficarão fora da rota."
      : null,
  };
}

async function createList(pool, ownerId, storeId, name) {
  const normalizedName = normalizeListName(name);
  if (!normalizedName) return null;
  const result = await pool.query(
    `INSERT INTO shopping_list (admin_user_id, filial_id, nome, status, confirmed_at)
     VALUES ($1, $2, $3, 'confirmed', NOW())
     RETURNING id, nome AS name, filial_id AS "storeId", status, confirmed_at AS "confirmedAt",
               created_at AS "createdAt", updated_at AS "updatedAt"`,
    [ownerId, storeId, normalizedName],
  );
  return result.rows[0] || null;
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

async function updateListItem(pool, listId, ownerId, productId, quantity) {
  const normalizedQuantity = normalizeQuantity(quantity);
  if (!normalizedQuantity) return { error: "A quantidade deve ser um inteiro maior que zero.", status: 400 };
  const result = await pool.query(
    `UPDATE shopping_list_item i
     SET quantidade = $3, updated_at = NOW()
     FROM shopping_list l
     WHERE i.list_id = l.id AND i.list_id = $1 AND l.admin_user_id = $2 AND i.produto_id = $4
     RETURNING i.produto_id`,
    [listId, ownerId, normalizedQuantity, productId],
  );
  if (!result.rows[0]) return { error: "Item não encontrado nesta lista.", status: 404 };
  await pool.query("UPDATE shopping_list SET updated_at = NOW() WHERE id = $1 AND admin_user_id = $2", [listId, ownerId]);
  return { product: result.rows[0] };
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
  getListSummary,
  normalizeListName,
  normalizeQuantity,
  removeListItem,
  updateListItem,
  upsertListItem,
};
