-- Seed additional stores, catalog products, and indoor graphs for switching stores in lists
INSERT INTO filial (id, nome, cnpj, endereco)
VALUES
    ('00000000-0000-0000-0000-000000000002', 'Supermercado Sakura', '22.222.222/0001-22', '{"logradouro":"Rua São Joaquim, 120","bairro":"Liberdade","cidade":"São Paulo","uf":"SP"}'),
    ('00000000-0000-0000-0000-000000000003', 'Mercado Liberdade', '33.333.333/0001-33', '{"logradouro":"Av. da Liberdade, 680","bairro":"Liberdade","cidade":"São Paulo","uf":"SP"}')
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
    v_source_store UUID := '00000000-0000-0000-0000-000000000001';
    v_target_store UUID;
    v_node_entrada BIGINT;
    v_node_corredor_1 BIGINT;
    v_node_corredor_2 BIGINT;
    v_node_corredor_3 BIGINT;
    v_node_hortifruti BIGINT;
    v_node_checkout BIGINT;
BEGIN
    FOREACH v_target_store IN ARRAY ARRAY[
        '00000000-0000-0000-0000-000000000002'::UUID,
        '00000000-0000-0000-0000-000000000003'::UUID,
        '11111111-1111-1111-1111-111111111111'::UUID
    ]
    LOOP
        IF EXISTS (SELECT 1 FROM filial WHERE id = v_target_store) THEN
            -- Copy catalog products from source store if missing
            INSERT INTO produto (filial_id, ean, nome, marca, categoria, preco, estoque, tamanho, imagem_url, corredor, prateleira)
            SELECT
                v_target_store,
                p.ean,
                p.nome,
                p.marca,
                p.categoria,
                p.preco,
                GREATEST(p.estoque, 15),
                p.tamanho,
                p.imagem_url,
                p.corredor,
                p.prateleira
            FROM produto p
            WHERE p.filial_id = v_source_store
            ON CONFLICT (filial_id, ean) DO NOTHING;

            -- Ensure indoor graph nodes exist for the store
            SELECT id INTO v_node_entrada FROM no_grafo WHERE filial_id = v_target_store AND tipo = 'entrada' LIMIT 1;
            IF v_node_entrada IS NULL THEN
                INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
                VALUES (v_target_store, 'Entrada Principal', 'entrada', ST_SetSRID(ST_MakePoint(0, 0), 4326), '{"zone":"entrada"}')
                RETURNING id INTO v_node_entrada;
            END IF;

            SELECT id INTO v_node_corredor_1 FROM no_grafo WHERE filial_id = v_target_store AND nome = 'Corredor 1' LIMIT 1;
            IF v_node_corredor_1 IS NULL THEN
                INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
                VALUES (v_target_store, 'Corredor 1', 'corredor', ST_SetSRID(ST_MakePoint(10, 20), 4326), '{"aisle":"CORREDOR 1","col":0}')
                RETURNING id INTO v_node_corredor_1;
            END IF;

            SELECT id INTO v_node_corredor_2 FROM no_grafo WHERE filial_id = v_target_store AND nome = 'Corredor 2' LIMIT 1;
            IF v_node_corredor_2 IS NULL THEN
                INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
                VALUES (v_target_store, 'Corredor 2', 'corredor', ST_SetSRID(ST_MakePoint(20, 20), 4326), '{"aisle":"CORREDOR 2","col":1}')
                RETURNING id INTO v_node_corredor_2;
            END IF;

            SELECT id INTO v_node_corredor_3 FROM no_grafo WHERE filial_id = v_target_store AND nome = 'Corredor 3' LIMIT 1;
            IF v_node_corredor_3 IS NULL THEN
                INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
                VALUES (v_target_store, 'Corredor 3', 'corredor', ST_SetSRID(ST_MakePoint(30, 15), 4326), '{"aisle":"CORREDOR 3","col":2}')
                RETURNING id INTO v_node_corredor_3;
            END IF;

            SELECT id INTO v_node_hortifruti FROM no_grafo WHERE filial_id = v_target_store AND nome = 'Hortifruti' LIMIT 1;
            IF v_node_hortifruti IS NULL THEN
                INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
                VALUES (v_target_store, 'Hortifruti', 'corredor', ST_SetSRID(ST_MakePoint(40, 30), 4326), '{"aisle":"HORTI","col":3}')
                RETURNING id INTO v_node_hortifruti;
            END IF;

            SELECT id INTO v_node_checkout FROM no_grafo WHERE filial_id = v_target_store AND tipo = 'checkout' LIMIT 1;
            IF v_node_checkout IS NULL THEN
                INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
                VALUES (v_target_store, 'Caixas', 'checkout', ST_SetSRID(ST_MakePoint(5, 35), 4326), '{"zone":"checkout"}')
                RETURNING id INTO v_node_checkout;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM aresta WHERE origem_id = v_node_entrada AND destino_id = v_node_corredor_1) THEN
                INSERT INTO aresta (origem_id, destino_id, distancia_metros, bidirecional) VALUES
                    (v_node_entrada, v_node_corredor_1, 8.0, TRUE),
                    (v_node_entrada, v_node_corredor_3, 12.0, TRUE),
                    (v_node_corredor_1, v_node_corredor_2, 6.0, TRUE),
                    (v_node_corredor_2, v_node_corredor_3, 6.0, TRUE),
                    (v_node_corredor_3, v_node_hortifruti, 7.0, TRUE),
                    (v_node_corredor_1, v_node_hortifruti, 14.0, TRUE),
                    (v_node_hortifruti, v_node_checkout, 10.0, TRUE),
                    (v_node_corredor_1, v_node_checkout, 6.0, TRUE);
            END IF;

            -- Link products to graph nodes by aisle
            UPDATE produto
            SET corredor = COALESCE(corredor, 'Corredor 1'),
                prateleira = COALESCE(prateleira, 'Prateleira central'),
                no_id = v_node_corredor_1
            WHERE filial_id = v_target_store AND (corredor ILIKE '%1%' OR categoria IN ('Padaria', 'Bebidas'));

            UPDATE produto
            SET corredor = COALESCE(corredor, 'Corredor 2'),
                prateleira = COALESCE(prateleira, 'Prateleira central'),
                no_id = v_node_corredor_2
            WHERE filial_id = v_target_store AND (corredor ILIKE '%2%' OR categoria IN ('Mercearia', 'Limpeza'));

            UPDATE produto
            SET corredor = COALESCE(corredor, 'Corredor 3'),
                prateleira = COALESCE(prateleira, 'Prateleira central'),
                no_id = v_node_corredor_3
            WHERE filial_id = v_target_store AND (corredor ILIKE '%3%' OR categoria = 'Laticínios');

            UPDATE produto
            SET corredor = COALESCE(corredor, 'Setor A'),
                prateleira = COALESCE(prateleira, 'Banca central'),
                no_id = v_node_hortifruti
            WHERE filial_id = v_target_store AND (corredor ILIKE '%Setor%' OR categoria = 'Hortifruti');
        END IF;
    END LOOP;
END $$;
