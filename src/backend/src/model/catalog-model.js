let storesSeedChecked = false;

async function ensureAdditionalStoresSeeded(pool) {
  if (storesSeedChecked || !pool || typeof pool.query !== "function") return;
  storesSeedChecked = true;
  try {
    await pool.query(`
      INSERT INTO filial (id, nome, cnpj, endereco)
      VALUES
        ('00000000-0000-0000-0000-000000000001', 'Mercado Liberdade', '00.000.000/0001-00', '{"logradouro":"Av. da Liberdade, 680","bairro":"Liberdade","cidade":"São Paulo","uf":"SP"}'),
        ('00000000-0000-0000-0000-000000000002', 'Supermercado Sakura', '22.222.222/0001-22', '{"logradouro":"Rua São Joaquim, 120","bairro":"Liberdade","cidade":"São Paulo","uf":"SP"}')
      ON CONFLICT (id) DO UPDATE
      SET nome = EXCLUDED.nome,
          endereco = EXCLUDED.endereco,
          updated_at = NOW()
    `);

    await pool.query(`
      DELETE FROM filial
      WHERE id IN (
        '00000000-0000-0000-0000-000000000003'::UUID,
        '11111111-1111-1111-1111-111111111111'::UUID
      )
    `);

    await pool.query(`
      INSERT INTO produto (filial_id, ean, nome, marca, categoria, preco, estoque, tamanho, imagem_url, corredor, prateleira)
      SELECT
        '00000000-0000-0000-0000-000000000002'::UUID,
        p.ean,
        p.nome,
        p.marca,
        p.categoria,
        p.preco,
        GREATEST(p.estoque, 15),
        p.tamanho,
        p.imagem_url,
        p.corredor,
        p.prateleira
      FROM produto p
      WHERE p.filial_id = '00000000-0000-0000-0000-000000000001'
      ON CONFLICT (filial_id, ean) DO NOTHING
    `);
  } catch {
    // Em testes unitários com mocks de pool ou bancos sem a tabela real, ignora silenciosamente
  }
}

function formatStoreAddress(endereco) {
  if (!endereco) return "São Paulo, SP";
  if (typeof endereco === "string") {
    try {
      const parsed = JSON.parse(endereco);
      return formatStoreAddress(parsed);
    } catch {
      return endereco;
    }
  }
  const parts = [endereco.logradouro, endereco.bairro, endereco.cidade, endereco.uf].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "São Paulo, SP";
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(parsed, 1), 50);
}

async function findProducts(pool, filialId, query, limit) {
  await ensureAdditionalStoresSeeded(pool);
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
  if (typeof filialId !== "string" || filialId.startsWith("osm-")) return null;
  await ensureAdditionalStoresSeeded(pool);
  const result = await pool.query(
    "SELECT id, nome AS name, endereco FROM filial WHERE id = $1",
    [filialId],
  );
  const row = result.rows[0];
  if (!row) return null;
  if (row.endereco === undefined) {
    return {
      id: row.id,
      name: row.name,
    };
  }
  return {
    id: row.id,
    name: row.name,
    address: formatStoreAddress(row.endereco),
  };
}

async function listStores(pool) {
  await ensureAdditionalStoresSeeded(pool);
  const result = await pool.query(
    `SELECT id, nome AS name, endereco
     FROM filial
     ORDER BY
       CASE WHEN id = '00000000-0000-0000-0000-000000000001' THEN 0 ELSE 1 END,
       nome ASC`,
  );
  return (result.rows || []).map((row) => ({
    id: row.id,
    name: row.name,
    address: formatStoreAddress(row.endereco),
  }));
}

module.exports = { findProducts, findStore, listStores };
