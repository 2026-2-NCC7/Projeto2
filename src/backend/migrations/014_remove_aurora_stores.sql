-- Remove "Mercado Aurora" and "Mercado Aurora - Centro" from the database,
-- keeping only the stores that appear on the map ("Mercado Liberdade" and "Supermercado Sakura").

UPDATE filial
SET nome = 'Mercado Liberdade',
    endereco = '{"logradouro":"Av. da Liberdade, 680","bairro":"Liberdade","cidade":"São Paulo","uf":"SP"}'::jsonb,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE filial
SET nome = 'Supermercado Sakura',
    endereco = '{"logradouro":"Rua São Joaquim, 120","bairro":"Liberdade","cidade":"São Paulo","uf":"SP"}'::jsonb,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000002';

UPDATE shopping_list
SET filial_id = '00000000-0000-0000-0000-000000000001',
    updated_at = NOW()
WHERE filial_id IN (
    '00000000-0000-0000-0000-000000000003'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID
);

DELETE FROM shopping_list_item
WHERE produto_id IN (
    SELECT id FROM produto
    WHERE filial_id IN (
        '00000000-0000-0000-0000-000000000003'::UUID,
        '11111111-1111-1111-1111-111111111111'::UUID
    )
);

DELETE FROM filial
WHERE id IN (
    '00000000-0000-0000-0000-000000000003'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID
);
