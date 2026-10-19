async function findActiveAdmin(pool, email) {
  const { rows } = await pool.query(
    `SELECT id, email, password_hash
     FROM admin_user
     WHERE lower(email) = lower($1) AND active = TRUE`,
    [email],
  );
  return rows[0] || null;
}

async function insertAdmin(pool, email, passwordHash, displayName = "Administrador") {
  const { rows } = await pool.query(
    `INSERT INTO admin_user (email, password_hash, display_name)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING id, email`,
    [email, passwordHash, displayName],
  );
  return rows[0] || null;
}

module.exports = { findActiveAdmin, insertAdmin };
