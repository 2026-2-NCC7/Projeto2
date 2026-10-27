async function findActiveAdmin(pool, email) {
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, role
     FROM admin_user
     WHERE lower(email) = lower($1) AND active = TRUE`,
    [email],
  );
  return rows[0] || null;
}

async function findActiveAdminByEmail(pool, email) {
  const { rows } = await pool.query(
    `SELECT id, email
     FROM admin_user
     WHERE lower(email) = lower($1) AND active = TRUE`,
    [email],
  );
  return rows[0] || null;
}

async function insertAdmin(pool, email, passwordHash, displayName = "Administrador", role = "admin") {
  const { rows } = await pool.query(
    `INSERT INTO admin_user (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING
     RETURNING id, email`,
    [email, passwordHash, displayName, role],
  );
  return rows[0] || null;
}

module.exports = { findActiveAdmin, findActiveAdminByEmail, insertAdmin };
