# 06. Modelo de Dados

**Versão:** 1.0  
**Responsável:** Arquiteto de Dados  
**Status:** Draft

---

## 1. Diagrama ER (Entidade-Relacionamento)

```mermaid
erDiagram
    FILIAL ||--o{ PRODUTO : tem
    FILIAL ||--o{ NO_GRAFO : possui
    FILIAL ||--o{ SESSAO : hospeda
    FILIAL ||--|| QR_CODE : identifica
    
    PRODUTO ||--o{ ITEM_LISTA : compoe
    PRODUTO }o--|| NO_GRAFO : localizado_em
    PRODUTO ||--o{ CAMPANHA_RETAIL : patrocina
    
    SESSAO ||--o{ ITEM_LISTA : contem
    SESSAO ||--o{ ROTA : gera
    SESSAO ||--o{ EVENTO : registra
    
    ROTA ||--o{ PARADA : contem
    PARADA }o--|| NO_GRAFO : referencia
    PARADA }o--|| PRODUTO : busca
    
    CAMPANHA_RETAIL ||--o{ EVENTO_RETAIL : rastreia
    
    NO_GRAFO ||--o{ ARESTA : origem
    NO_GRAFO ||--o{ ARESTA : destino

    FILIAL {
        uuid id PK
        string nome
        string cnpj
        jsonb endereco
        string logo_url
        timestamp created_at
    }
    
    QR_CODE {
        uuid id PK
        uuid filial_id FK
        string url
        timestamp expires_at
        boolean active
    }
    
    PRODUTO {
        bigint id PK
        uuid filial_id FK
        string ean
        string nome
        string marca
        string categoria
        decimal preco
        integer estoque
        bigint no_id FK
        boolean is_promo
        boolean has_partnership
        boolean auto_mapped
        timestamp synced_at
    }
    
    NO_GRAFO {
        bigint id PK
        uuid filial_id FK
        string nome
        string tipo
        point coordenadas
        jsonb metadata
    }
    
    ARESTA {
        bigint id PK
        bigint origem_id FK
        bigint destino_id FK
        decimal distancia_metros
        boolean bidirecional
    }
    
    SESSAO {
        uuid id PK
        uuid filial_id FK
        timestamp started_at
        timestamp ended_at
        string user_agent
        integer total_items
    }
    
    ITEM_LISTA {
        bigint id PK
        uuid sessao_id FK
        bigint produto_id FK
        timestamp added_at
        boolean found
        timestamp found_at
    }
    
    ROTA {
        bigint id PK
        uuid sessao_id FK
        jsonb sequencia_produtos
        decimal distancia_total
        integer tempo_estimado_min
        timestamp calculated_at
    }
    
    PARADA {
        bigint id PK
        bigint rota_id FK
        bigint no_id FK
        bigint produto_id FK
        integer ordem
        timestamp reached_at
    }
    
    CAMPANHA_RETAIL {
        bigint id PK
        bigint produto_id FK
        string nome_campanha
        decimal preco_promocional
        date validade_inicio
        date validade_fim
        boolean active
    }
    
    EVENTO {
        bigint id PK
        uuid sessao_id FK
        string tipo
        jsonb payload
        timestamp created_at
    }
    
    EVENTO_RETAIL {
        bigint id PK
        bigint campanha_id FK
        uuid sessao_id FK
        string tipo
        timestamp created_at
    }
```

---

## 2. Descrição das Entidades

### 2.1 FILIAL
Representa um ponto de venda (loja) da rede de supermercados.

**Relacionamentos:**
- 1:N com PRODUTO (catálogo da filial)
- 1:N com NO_GRAFO (layout da loja)
- 1:1 com QR_CODE (identificação)

---

### 2.2 PRODUTO
Itens do catálogo da filial, sincronizados com ERP.

**Índices:**
- `idx_produto_filial_ean` (filial_id, ean) UNIQUE
- `idx_produto_busca` GIN (to_tsvector('portuguese', nome || ' ' || marca))

---

### 2.3 NO_GRAFO
Pontos de interesse no mapa da loja (entrada, checkout, posições de produtos).

**Tipos de nó:**
- `entrada`: Ponto de entrada
- `checkout`: Caixa
- `corredor`: Corredor genérico
- `produto`: Posição específica de produto

**Campo `coordenadas`:** PostGIS POINT (x, y)

---

### 2.4 ARESTA
Conexões entre nós (caminhos possíveis).

**Propriedades:**
- `distancia_metros`: Calculada via ST_Distance
- `bidirecional`: Se true, pode ir A→B e B→A

---

### 2.5 SESSAO
Uso do Web App por um cliente (anônimo).

**Ciclo de vida:**
1. Criada ao escanear QR
2. Ativa durante compra
3. Fechada após 30min inatividade OU conclusão

---

### 2.6 ROTA
Resultado do cálculo de roteirização (TSP).

**Campo `sequencia_produtos`:** Array JSON com IDs ordenados
```json
{
  "produtos": [123, 456, 789],
  "nos": [10, 15, 22],
  "heuristica": "nearest_neighbor"
}
```

---

### 2.7 EVENTO
Registro genérico de ações do usuário.

**Tipos de evento:**
- `qr_scan`: Escaneou QR
- `search`: Buscou produto
- `add_to_list`: Adicionou item
- `calculate_route`: Calculou rota
- `item_found`: Marcou item como encontrado
- `item_not_found`: Reportou "não encontrei"

**Campo `payload`:** JSON flexível com detalhes

---

### 2.8 EVENTO_RETAIL
Métricas específicas de Retail Media.

**Tipos:**
- `impression`: Oferta exibida
- `click`: Oferta clicada
- `conversion`: Oferta adicionada à lista

---

## 3. Schemas SQL Completos

Ver arquivo: [`exemplos/schema.sql`](./exemplos/schema.sql)

---

## 4. Estratégias de Otimização

### 4.1 Particionamento
Tabela `evento` particionada por mês:
```sql
CREATE TABLE evento_2026_01 PARTITION OF evento
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### 4.2 Índices Geoespaciais
```sql
CREATE INDEX idx_no_grafo_coords ON no_grafo USING GIST (coordenadas);
```

### 4.3 Cache Redis
Estruturas cacheadas:
- Catálogo por filial (TTL 10min)
- Grafo da loja (TTL 1h)
- Disponibilidade de produtos (TTL 5min)

---

**Anterior:** [05. Regras de Negócio](./05-regras-negocio.md)  
**Próximo:** [07. Dicionário de Dados](./07-dicionario-dados.md)
