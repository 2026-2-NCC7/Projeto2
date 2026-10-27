async function invalidateActiveTokens(pool, adminId) {
  await pool.query(
    `UPDATE password_reset_token
     SET used_at = NOW()
     WHERE admin_id = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [adminId],
  );
}

async function insertResetToken(pool, tokenHash, adminId, expiresAt) {
  await pool.query(
    `INSERT INTO password_reset_token (token_hash, admin_id, expires_at)
     VALUES ($1, $2, $3)`,
    [tokenHash, adminId, expiresAt],
  );
}

async function findValidResetToken(pool, tokenHash) {
  const { rows } = await pool.query(
    `SELECT prt.token_hash, prt.admin_id
     FROM password_reset_token prt
     JOIN admin_user au ON au.id = prt.admin_id
     WHERE prt.token_hash = $1
       AND prt.used_at IS NULL
       AND prt.expires_at > NOW()
       AND au.active = TRUE`,
    [tokenHash],
  );
  return rows[0] || null;
}

async function consumeResetToken(pool, tokenHash, adminId, passwordHash) {
  const { rowCount } = await pool.query(
    `WITH updated_admin AS (
       UPDATE admin_user
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2 AND active = TRUE
       RETURNING id
     )
     UPDATE password_reset_token
     SET used_at = NOW()
     WHERE token_hash = $3
       AND admin_id = $2
       AND used_at IS NULL
       AND expires_at > NOW()
       AND EXISTS (SELECT 1 FROM updated_admin)`,
    [passwordHash, adminId, tokenHash],
  );
  return rowCount === 1;
}

module.exports = {
  consumeResetToken,
  findValidResetToken,
  insertResetToken,
  invalidateActiveTokens,
};
