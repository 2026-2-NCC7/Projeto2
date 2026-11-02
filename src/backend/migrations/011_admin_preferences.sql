CREATE TABLE admin_preference (
    admin_user_id UUID PRIMARY KEY REFERENCES admin_user(id) ON DELETE CASCADE,
    selected_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    product_suggestions BOOLEAN NOT NULL DEFAULT TRUE,
    shopping_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
