# 07. Dicionário de Dados

**Versão:** 1.0  
**Responsável:** Arquiteto de Dados  
**Status:** Draft

---

## Tabela: filial

| Campo | Tipo | Nulo | Default | Descrição |
|-------|------|------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | Identificador único |
| nome | VARCHAR(255) | NOT NULL | - | Nome da loja |
| cnpj | VARCHAR(18) | NOT NULL | - | CNPJ (formato: XX.XXX.XXX/XXXX-XX) |
| endereco | JSONB | NOT NULL | - | {logradouro, numero, cidade, estado, cep} |
| logo_url | TEXT | NULL | - | URL do logo da loja |
| config | JSONB | NULL | {} | Configurações específicas |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Última atualização |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (cnpj)

---

## Tabela: produto

| Campo | Tipo | Nulo | Default | Descrição |
|-------|------|------|---------|-----------|
| id | BIGSERIAL | NOT NULL | - | ID autoincrementável |
| filial_id | UUID | NOT NULL | - | Referência à filial |
| ean | VARCHAR(13) | NOT NULL | - | Código de barras |
| nome | VARCHAR(255) | NOT NULL | - | Nome do produto |
| marca | VARCHAR(100) | NULL | - | Marca |
| categoria | VARCHAR(100) | NULL | - | Categoria |
| preco | DECIMAL(10,2) | NULL | - | Preço em R$ |
| estoque | INTEGER | NOT NULL | 0 | Quantidade em estoque |
| no_id | BIGINT | NULL | - | Localização física (FK no_grafo) |
| is_promo | BOOLEAN | NOT NULL | FALSE | Se está em promoção |
| has_partnership | BOOLEAN | NOT NULL | FALSE | Se tem parceria Retail Media |
| auto_mapped | BOOLEAN | NOT NULL | FALSE | Mapeado automaticamente via ERP |
| synced_at | TIMESTAMP | NULL | - | Última sincronização ERP |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (filial_id, ean)
- GIN (to_tsvector('portuguese', nome || marca))
- FOREIGN KEY (filial_id) REFERENCES filial(id)
- FOREIGN KEY (no_id) REFERENCES no_grafo(id)

**Ver schema completo:** [exemplos/schema.sql](./exemplos/schema.sql)

---

**Anterior:** [06. Modelo de Dados](./06-modelo-dados.md)  
**Próximo:** [08. API REST](./08-api-rest.md)
