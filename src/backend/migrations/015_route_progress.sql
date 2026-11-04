-- Persist route progress (collected/not_found) per item and route session state per shopping list
ALTER TABLE shopping_list_item
    ADD COLUMN IF NOT EXISTS coletado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS nao_encontrado BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE shopping_list
    ADD COLUMN IF NOT EXISTS rota_em_andamento BOOLEAN NOT NULL DEFAULT FALSE;
