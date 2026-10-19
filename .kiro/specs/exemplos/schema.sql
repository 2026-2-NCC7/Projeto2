-- Ach.ai - Schema Completo PostgreSQL + PostGIS
-- Versão: 1.0
-- Data: Janeiro 2026

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca fuzzy

-- ============================================
-- TABELA: filial
-- ============================================
CREATE TABLE filial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco JSONB NOT NULL, -- {logradouro, numero, cidade, estado, cep}
    logo_url TEXT,
    config JSONB DEFAULT '{}', -- Configurações específicas da loja
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_filial_cnpj ON filial(cnpj);

-- ============================================
-- TABELA: qr_code
-- ============================================
CREATE TABLE qr_code (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    expires_at TIMESTAMP, -- NULL = sem expiração
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qr_filial ON qr_code(filial_id);
CREATE UNIQUE INDEX idx_qr_url_active ON qr_code(url) WHERE active = TRUE;

-- ============================================
-- TABELA: no_grafo (nós do mapa da loja)
-- ============================================
CREATE TABLE no_grafo (
    id BIGSERIAL PRIMARY KEY,
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL, -- "Entrada", "Corredor 3", "Checkout 1"
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'checkout', 'corredor', 'produto')),
    coordenadas GEOMETRY(POINT, 4326) NOT NULL, -- PostGIS Point (x, y)
    metadata JSONB DEFAULT '{}', -- Dados adicionais flexíveis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_no_filial ON no_grafo(filial_id);
CREATE INDEX idx_no_coords ON no_grafo USING GIST (coordenadas);
CREATE INDEX idx_no_tipo ON no_grafo(tipo);

-- ============================================
-- TABELA: aresta (conexões entre nós)
-- ============================================
CREATE TABLE aresta (
    id BIGSERIAL PRIMARY KEY,
    origem_id BIGINT NOT NULL REFERENCES no_grafo(id) ON DELETE CASCADE,
    destino_id BIGINT NOT NULL REFERENCES no_grafo(id) ON DELETE CASCADE,
    distancia_metros DECIMAL(10,2) NOT NULL,
    bidirecional BOOLEAN DEFAULT TRUE,
    CHECK (origem_id != destino_id)
);

CREATE INDEX idx_aresta_origem ON aresta(origem_id);
CREATE INDEX idx_aresta_destino ON aresta(destino_id);

-- ============================================
-- TABELA: produto
-- ============================================
CREATE TABLE produto (
    id BIGSERIAL PRIMARY KEY,
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    ean VARCHAR(13) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    marca VARCHAR(100),
    categoria VARCHAR(100),
    preco DECIMAL(10,2),
    estoque INTEGER DEFAULT 0,
    no_id BIGINT REFERENCES no_grafo(id) ON DELETE SET NULL, -- Localização física
    is_promo BOOLEAN DEFAULT FALSE,
    has_partnership BOOLEAN DEFAULT FALSE,
    auto_mapped BOOLEAN DEFAULT FALSE, -- Mapeado automaticamente via ERP?
    synced_at TIMESTAMP, -- Última sincronização com ERP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_produto_filial_ean ON produto(filial_id, ean);
CREATE INDEX idx_produto_nome_trigram ON produto USING GIN (nome gin_trgm_ops);
CREATE INDEX idx_produto_busca ON produto USING GIN (to_tsvector('portuguese', nome || ' ' || COALESCE(marca, '')));
CREATE INDEX idx_produto_no ON produto(no_id);

-- ============================================
-- TABELA: sessao (uso do Web App)
-- ============================================
CREATE TABLE sessao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filial_id UUID NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    user_agent TEXT,
    total_items INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sessao_filial ON sessao(filial_id);
CREATE INDEX idx_sessao_started ON sessao(started_at);

-- ============================================
-- TABELA: item_lista
-- ============================================
CREATE TABLE item_lista (
    id BIGSERIAL PRIMARY KEY,
    sessao_id UUID NOT NULL REFERENCES sessao(id) ON DELETE CASCADE,
    produto_id BIGINT NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    found BOOLEAN DEFAULT FALSE,
    found_at TIMESTAMP
);

CREATE INDEX idx_item_sessao ON item_lista(sessao_id);
CREATE INDEX idx_item_produto ON item_lista(produto_id);

-- ============================================
-- TABELA: rota (resultado do TSP)
-- ============================================
CREATE TABLE rota (
    id BIGSERIAL PRIMARY KEY,
    sessao_id UUID NOT NULL REFERENCES sessao(id) ON DELETE CASCADE,
    sequencia_produtos JSONB NOT NULL, -- {produtos: [123, 456], nos: [10, 15]}
    distancia_total DECIMAL(10,2),
    tempo_estimado_min INTEGER,
    heuristica VARCHAR(50) DEFAULT 'nearest_neighbor',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rota_sessao ON rota(sessao_id);

-- ============================================
-- TABELA: parada (pontos da rota)
-- ============================================
CREATE TABLE parada (
    id BIGSERIAL PRIMARY KEY,
    rota_id BIGINT NOT NULL REFERENCES rota(id) ON DELETE CASCADE,
    no_id BIGINT NOT NULL REFERENCES no_grafo(id) ON DELETE CASCADE,
    produto_id BIGINT REFERENCES produto(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    reached_at TIMESTAMP
);

CREATE INDEX idx_parada_rota ON parada(rota_id);
CREATE INDEX idx_parada_ordem ON parada(rota_id, ordem);

-- ============================================
-- TABELA: campanha_retail (Retail Media)
-- ============================================
CREATE TABLE campanha_retail (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    nome_campanha VARCHAR(255) NOT NULL,
    preco_promocional DECIMAL(10,2),
    validade_inicio DATE NOT NULL,
    validade_fim DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    budget_total DECIMAL(12,2), -- Budget da campanha
    budget_gasto DECIMAL(12,2) DEFAULT 0,
    cpc DECIMAL(6,2), -- Custo por clique
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campanha_produto ON campanha_retail(produto_id);
CREATE INDEX idx_campanha_ativa ON campanha_retail(active, validade_inicio, validade_fim);

-- ============================================
-- TABELA: evento (analytics genérico)
-- ============================================
CREATE TABLE evento (
    id BIGSERIAL PRIMARY KEY,
    sessao_id UUID REFERENCES sessao(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'qr_scan', 'search', 'add_to_list', etc
    payload JSONB NOT NULL, -- Detalhes flexíveis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Criar partições por mês (exemplo: Janeiro 2026)
CREATE TABLE evento_2026_01 PARTITION OF evento
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE evento_2026_02 PARTITION OF evento
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Índices nas partições
CREATE INDEX idx_evento_2026_01_tipo ON evento_2026_01(tipo);
CREATE INDEX idx_evento_2026_01_sessao ON evento_2026_01(sessao_id);
CREATE INDEX idx_evento_2026_02_tipo ON evento_2026_02(tipo);
CREATE INDEX idx_evento_2026_02_sessao ON evento_2026_02(sessao_id);

-- ============================================
-- TABELA: evento_retail (métricas Retail Media)
-- ============================================
CREATE TABLE evento_retail (
    id BIGSERIAL PRIMARY KEY,
    campanha_id BIGINT NOT NULL REFERENCES campanha_retail(id) ON DELETE CASCADE,
    sessao_id UUID REFERENCES sessao(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('impression', 'click', 'conversion')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evento_retail_campanha ON evento_retail(campanha_id);
CREATE INDEX idx_evento_retail_tipo ON evento_retail(tipo);
CREATE INDEX idx_evento_retail_created ON evento_retail(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_filial_updated
BEFORE UPDATE ON filial
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_produto_updated
BEFORE UPDATE ON produto
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- FUNÇÃO: Calcular distância entre nós
-- ============================================
CREATE OR REPLACE FUNCTION calcular_distancia_nos(no1_id BIGINT, no2_id BIGINT)
RETURNS DECIMAL AS $$
DECLARE
    dist DECIMAL;
BEGIN
    SELECT ST_Distance(n1.coordenadas::geography, n2.coordenadas::geography)
    INTO dist
    FROM no_grafo n1, no_grafo n2
    WHERE n1.id = no1_id AND n2.id = no2_id;
    
    RETURN ROUND(dist, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Busca full-text de produtos
-- ============================================
CREATE OR REPLACE FUNCTION buscar_produtos(
    p_filial_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id BIGINT,
    nome VARCHAR,
    marca VARCHAR,
    preco DECIMAL,
    estoque INTEGER,
    disponivel BOOLEAN,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nome,
        p.marca,
        p.preco,
        p.estoque,
        (p.estoque > 0) AS disponivel,
        ts_rank(to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.marca, '')), plainto_tsquery('portuguese', p_query)) AS rank
    FROM produto p
    WHERE 
        p.filial_id = p_filial_id
        AND to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.marca, '')) @@ plainto_tsquery('portuguese', p_query)
    ORDER BY rank DESC, p.nome
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS ANALÍTICAS
-- ============================================

-- Top produtos mais buscados sem resultado
CREATE OR REPLACE VIEW v_top_buscas_sem_resultado AS
SELECT 
    payload->>'query' AS query,
    COUNT(*) AS total
FROM evento
WHERE tipo = 'search' AND (payload->>'results')::INTEGER = 0
GROUP BY payload->>'query'
ORDER BY total DESC
LIMIT 100;

-- Taxa de conversão por campanha
CREATE OR REPLACE VIEW v_conversao_campanhas AS
SELECT 
    c.id AS campanha_id,
    c.nome_campanha,
    COUNT(CASE WHEN e.tipo = 'impression' THEN 1 END) AS impressions,
    COUNT(CASE WHEN e.tipo = 'click' THEN 1 END) AS clicks,
    COUNT(CASE WHEN e.tipo = 'conversion' THEN 1 END) AS conversions,
    ROUND(100.0 * COUNT(CASE WHEN e.tipo = 'click' THEN 1 END) / NULLIF(COUNT(CASE WHEN e.tipo = 'impression' THEN 1 END), 0), 2) AS ctr,
    ROUND(100.0 * COUNT(CASE WHEN e.tipo = 'conversion' THEN 1 END) / NULLIF(COUNT(CASE WHEN e.tipo = 'click' THEN 1 END), 0), 2) AS conversion_rate
FROM campanha_retail c
LEFT JOIN evento_retail e ON e.campanha_id = c.id
GROUP BY c.id, c.nome_campanha;

-- ============================================
-- SEED DATA (Exemplo)
-- ============================================

-- Inserir filial de teste
INSERT INTO filial (id, nome, cnpj, endereco) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Supermercado Piloto', '12.345.678/0001-99', 
 '{"logradouro": "Rua Teste", "numero": "100", "cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}');

-- Inserir QR Code
INSERT INTO qr_code (id, filial_id, url) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 
 'https://app.achai.com.br/f/550e8400-e29b-41d4-a716-446655440000');

-- Inserir nós do grafo
INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Entrada', 'entrada', ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326)),
('550e8400-e29b-41d4-a716-446655440000', 'Corredor 1', 'corredor', ST_SetSRID(ST_MakePoint(-46.6334, -23.5505), 4326)),
('550e8400-e29b-41d4-a716-446655440000', 'Corredor 2', 'corredor', ST_SetSRID(ST_MakePoint(-46.6335, -23.5505), 4326)),
('550e8400-e29b-41d4-a716-446655440000', 'Checkout', 'checkout', ST_SetSRID(ST_MakePoint(-46.6336, -23.5505), 4326));

COMMIT;
