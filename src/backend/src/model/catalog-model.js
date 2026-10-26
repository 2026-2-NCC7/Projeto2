function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(parsed, 1), 50);
}

async function findProducts(pool, filialId, query, limit) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  const params = [filialId];
  let searchSql = "";

  if (normalizedQuery) {
    params.push(normalizedQuery);
    searchSql = `
      AND (
        unaccent(lower(p.nome)) LIKE '%' || unaccent(lower($2)) || '%'
        OR similarity(unaccent(lower(p.nome)), unaccent(lower($2))) >= 0.18
      )`;
  }

  params.push(normalizeLimit(limit));
  const limitParam = `$${params.length}`;
  const orderSql = normalizedQuery
    ? `ORDER BY
        CASE WHEN unaccent(lower(p.nome)) LIKE unaccent(lower($2)) || '%' THEN 0 ELSE 1 END,
        similarity(unaccent(lower(p.nome)), unaccent(lower($2))) DESC,
        p.nome`
    : "ORDER BY p.nome";

  const result = await pool.query(
    `SELECT
       p.id,
       p.nome AS name,
       p.marca AS brand,
       p.tamanho AS size,
       p.categoria AS category,
       p.preco AS price,
       p.estoque > 0 AS "inStock",
       CASE
         WHEN p.no_id IS NULL AND p.corredor IS NULL AND p.prateleira IS NULL THEN NULL
         ELSE jsonb_build_object(
           'aisle', p.corredor,
           'shelf', p.prateleira,
           'nodeId', p.no_id
         )
       END AS location,
       p.imagem_url AS "imageUrl"
     FROM produto p
     WHERE p.filial_id = $1
       ${searchSql}
     ${orderSql}
     LIMIT ${limitParam}`,
    params,
  );
  return result.rows;
}

async function findStore(pool, filialId) {
  const result = await pool.query(
    "SELECT id, nome AS name FROM filial WHERE id = $1",
    [filialId],
  );
  return result.rows[0] || null;
}

module.exports = { findProducts, findStore };
