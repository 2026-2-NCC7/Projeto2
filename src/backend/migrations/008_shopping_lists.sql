CREATE TABLE shopping_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_user(id) ON DELETE CASCADE,
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL CHECK (char_length(trim(nome)) BETWEEN 1 AND 255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shopping_list_owner ON shopping_list(admin_user_id, updated_at DESC);
CREATE INDEX idx_shopping_list_store ON shopping_list(filial_id);

CREATE TABLE shopping_list_item (
    list_id UUID NOT NULL REFERENCES shopping_list(id) ON DELETE CASCADE,
    produto_id BIGINT NOT NULL REFERENCES produto(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10, 2) CHECK (preco_unitario IS NULL OR preco_unitario >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (list_id, produto_id)
);

CREATE INDEX idx_shopping_list_item_product ON shopping_list_item(produto_id);
