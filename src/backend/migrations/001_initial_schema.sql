CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE filial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco JSONB NOT NULL,
    logo_url TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE qr_code (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_qr_url_active ON qr_code(url) WHERE active = TRUE;

CREATE TABLE no_grafo (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'checkout', 'corredor', 'produto')),
    coordenadas GEOMETRY(POINT, 4326) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_no_grafo_filial ON no_grafo(filial_id);
CREATE INDEX idx_no_grafo_coords ON no_grafo USING GIST(coordenadas);

CREATE TABLE aresta (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    origem_id BIGINT NOT NULL REFERENCES no_grafo(id) ON DELETE CASCADE,
    destino_id BIGINT NOT NULL REFERENCES no_grafo(id) ON DELETE CASCADE,
    distancia_metros NUMERIC(10, 2) NOT NULL CHECK (distancia_metros > 0),
    bidirecional BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (origem_id <> destino_id)
);

CREATE TABLE produto (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    ean VARCHAR(13) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    marca VARCHAR(100),
    categoria VARCHAR(100),
    preco NUMERIC(10, 2) CHECK (preco IS NULL OR preco >= 0),
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    no_id BIGINT REFERENCES no_grafo(id) ON DELETE SET NULL,
    is_promo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (filial_id, ean)
);

CREATE INDEX idx_produto_nome_trigram ON produto USING GIN(nome gin_trgm_ops);
