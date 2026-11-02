ALTER TABLE shopping_list
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('draft', 'confirmed')),
    ADD COLUMN confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX idx_shopping_list_status ON shopping_list(status);
