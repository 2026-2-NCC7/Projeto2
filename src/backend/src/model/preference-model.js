const ALLOWED_CATEGORIES = new Set([
  "Hortifruti",
  "Mercearia",
  "Laticínios",
  "Bebidas",
  "Limpeza",
  "Higiene pessoal",
]);

function normalizePreferences(input) {
  const categories = Array.isArray(input?.selectedCategories)
    ? [...new Set(input.selectedCategories.filter((category) => ALLOWED_CATEGORIES.has(category)))]
    : [];

  return {
    selectedCategories: categories,
    productSuggestions: input?.productSuggestions !== false,
    shoppingNotifications: input?.shoppingNotifications === true,
  };
}

async function findPreferences(pool, adminUserId) {
  const { rows } = await pool.query(
    `SELECT selected_categories AS "selectedCategories",
            product_suggestions AS "productSuggestions",
            shopping_notifications AS "shoppingNotifications"
     FROM admin_preference
     WHERE admin_user_id = $1`,
    [adminUserId],
  );
  return rows[0] ? normalizePreferences(rows[0]) : null;
}

async function upsertPreferences(pool, adminUserId, input) {
  const preferences = normalizePreferences(input);
  const { rows } = await pool.query(
    `INSERT INTO admin_preference (
       admin_user_id, selected_categories, product_suggestions, shopping_notifications
     )
     VALUES ($1, $2::TEXT[], $3, $4)
     ON CONFLICT (admin_user_id) DO UPDATE SET
       selected_categories = EXCLUDED.selected_categories,
       product_suggestions = EXCLUDED.product_suggestions,
       shopping_notifications = EXCLUDED.shopping_notifications,
       updated_at = NOW()
     RETURNING selected_categories AS "selectedCategories",
               product_suggestions AS "productSuggestions",
               shopping_notifications AS "shoppingNotifications"`,
    [
      adminUserId,
      preferences.selectedCategories,
      preferences.productSuggestions,
      preferences.shoppingNotifications,
    ],
  );
  return normalizePreferences(rows[0]);
}

module.exports = { findPreferences, normalizePreferences, upsertPreferences };
