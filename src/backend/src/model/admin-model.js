async function findActiveAdmin(pool, email) {
  const { rows } = await pool.query(
    `SELECT id, email, display_name, password_hash, role
     FROM admin_user
     WHERE lower(email) = lower($1) AND active = TRUE`,
    [email],
  );
  return rows[0] || null;
}

async function findActiveAdminByEmail(pool, email) {
  const { rows } = await pool.query(
    `SELECT id, email, display_name, role
     FROM admin_user
     WHERE lower(email) = lower($1) AND active = TRUE`,
    [email],
  );
  return rows[0] || null;
}

async function findAdminProfileById(pool, id) {
  const { rows } = await pool.query(
    `SELECT id, email, display_name, role, active, created_at, updated_at
     FROM admin_user
     WHERE id = $1 AND active = TRUE`,
    [id],
  );
  return rows[0] || null;
}

async function findAdminWithPasswordById(pool, id) {
  const { rows } = await pool.query(
    `SELECT id, email, display_name, password_hash, role
     FROM admin_user
     WHERE id = $1 AND active = TRUE`,
    [id],
  );
  return rows[0] || null;
}

async function updateAdminProfile(pool, id, { displayName, email }) {
  const { rows } = await pool.query(
    `UPDATE admin_user
     SET display_name = $2,
         email = $3,
         updated_at = NOW()
     WHERE id = $1 AND active = TRUE
     RETURNING id, email, display_name, role`,
    [id, displayName, email],
  );
  return rows[0] || null;
}

async function updateAdminPassword(pool, id, passwordHash) {
  const { rows } = await pool.query(
    `UPDATE admin_user
     SET password_hash = $2,
         updated_at = NOW()
     WHERE id = $1 AND active = TRUE
     RETURNING id`,
    [id, passwordHash],
  );
  return Boolean(rows[0]);
}

async function deactivateAdminAccount(pool, id) {
  const { rows } = await pool.query(
    `UPDATE admin_user
     SET active = FALSE,
         updated_at = NOW()
     WHERE id = $1 AND active = TRUE
     RETURNING id`,
    [id],
  );
  return Boolean(rows[0]);
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

module.exports = {
  deactivateAdminAccount,
  findActiveAdmin,
  findActiveAdminByEmail,
  findAdminProfileById,
  findAdminWithPasswordById,
  insertAdmin,
  updateAdminPassword,
  updateAdminProfile,
};
