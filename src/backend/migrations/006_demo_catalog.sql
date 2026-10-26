CREATE EXTENSION IF NOT EXISTS unaccent;

INSERT INTO filial (id, nome, cnpj, endereco)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Mercado Aurora',
    '00.000.000/0001-00',
    '{"cidade":"São Paulo","uf":"SP"}'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO produto (filial_id, ean, nome, marca, categoria, preco, estoque, no_id)
VALUES
    ('00000000-0000-0000-0000-000000000001', '7891000000011', 'Banana prata', NULL, 'Hortifruti', 6.99, 40, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000028', 'Leite integral 1 L', 'Aurora', 'Laticínios', 4.79, 24, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000035', 'Arroz Tio João 5 kg', 'Tio João', 'Mercearia', 24.90, 18, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000042', 'Feijão carioca 1 kg', 'Kicaldo', 'Mercearia', 8.99, 0, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000059', 'Água mineral 1,5 L', 'Crystal', 'Bebidas', 2.49, 60, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000066', 'Detergente neutro 500 ml', 'Ypê', 'Limpeza', 2.49, 35, NULL)
ON CONFLICT (filial_id, ean) DO NOTHING;
