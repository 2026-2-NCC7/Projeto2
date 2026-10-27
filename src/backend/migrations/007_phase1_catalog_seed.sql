ALTER TABLE produto
    ADD COLUMN IF NOT EXISTS tamanho VARCHAR(100),
    ADD COLUMN IF NOT EXISTS imagem_url TEXT,
    ADD COLUMN IF NOT EXISTS corredor VARCHAR(100),
    ADD COLUMN IF NOT EXISTS prateleira VARCHAR(100);

INSERT INTO filial (id, nome, cnpj, endereco)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Mercado Aurora - Centro', '11.111.111/0001-11', '{"cidade":"São Paulo","uf":"SP"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO produto (filial_id, ean, nome, marca, categoria, preco, estoque, no_id)
VALUES
    ('00000000-0000-0000-0000-000000000001', '7891000000073', 'Café torrado e moído 500 g', 'Pilão', 'Mercearia', 18.90, 12, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000080', 'Ovos brancos 12 unidades', 'Aurora', 'Laticínios', 12.99, 20, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000097', 'Pão de forma 500 g', 'Seven Boys', 'Padaria', 8.49, 15, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000103', 'Suco de laranja 1 L', 'Del Valle', 'Bebidas', 7.99, 9, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000110', 'Sabão em pó 1 kg', 'Omo', 'Limpeza', 14.90, 8, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000127', 'Tomate 1 kg', NULL, 'Hortifruti', 7.49, 30, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000134', 'Queijo muçarela 200 g', 'Aurora', 'Laticínios', 11.90, 6, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000141', 'Macarrão espaguete 500 g', 'Adria', 'Mercearia', 5.49, 22, NULL),
    ('00000000-0000-0000-0000-000000000001', '7891000000158', 'Papel higiênico 12 rolos', 'Personal', 'Limpeza', 18.50, 0, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000010', 'Banana prata', NULL, 'Hortifruti', 7.49, 25, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000027', 'Leite integral 1 L', 'Bom Dia', 'Laticínios', 5.29, 14, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000034', 'Arroz Tio João 5 kg', 'Tio João', 'Mercearia', 25.90, 10, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000041', 'Feijão carioca 1 kg', 'Kicaldo', 'Mercearia', 9.49, 0, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000058', 'Água mineral 1,5 L', 'Crystal', 'Bebidas', 2.79, 50, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000065', 'Detergente neutro 500 ml', 'Ypê', 'Limpeza', 2.69, 18, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000072', 'Café torrado e moído 500 g', '3 Corações', 'Mercearia', 19.90, 7, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000089', 'Ovos brancos 12 unidades', 'Granja Azul', 'Laticínios', 13.49, 12, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000096', 'Pão de forma 500 g', 'Wickbold', 'Padaria', 9.29, 9, NULL),
    ('11111111-1111-1111-1111-111111111111', '7892000000102', 'Suco de laranja 1 L', 'Natural One', 'Bebidas', 8.49, 11, NULL)
ON CONFLICT (filial_id, ean) DO NOTHING;
