-- Seed indoor graph (no_grafo + aresta) and product locations for Mercado Aurora (WebApp QR Code flow)
DO $$
DECLARE
    v_store_id UUID := '00000000-0000-0000-0000-000000000001';
    v_node_entrada BIGINT;
    v_node_corredor_1 BIGINT;
    v_node_corredor_2 BIGINT;
    v_node_corredor_3 BIGINT;
    v_node_hortifruti BIGINT;
    v_node_checkout BIGINT;
BEGIN
    IF EXISTS (SELECT 1 FROM filial WHERE id = v_store_id) THEN
        SELECT id INTO v_node_entrada FROM no_grafo WHERE filial_id = v_store_id AND tipo = 'entrada' LIMIT 1;
        IF v_node_entrada IS NULL THEN
            INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
            VALUES (v_store_id, 'Entrada Principal', 'entrada', ST_SetSRID(ST_MakePoint(0, 0), 4326), '{"zone":"entrada"}')
            RETURNING id INTO v_node_entrada;
        END IF;

        SELECT id INTO v_node_corredor_1 FROM no_grafo WHERE filial_id = v_store_id AND nome = 'Corredor 1' LIMIT 1;
        IF v_node_corredor_1 IS NULL THEN
            INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
            VALUES (v_store_id, 'Corredor 1', 'corredor', ST_SetSRID(ST_MakePoint(10, 20), 4326), '{"aisle":"CORREDOR 1","col":0}')
            RETURNING id INTO v_node_corredor_1;
        END IF;

        SELECT id INTO v_node_corredor_2 FROM no_grafo WHERE filial_id = v_store_id AND nome = 'Corredor 2' LIMIT 1;
        IF v_node_corredor_2 IS NULL THEN
            INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
            VALUES (v_store_id, 'Corredor 2', 'corredor', ST_SetSRID(ST_MakePoint(20, 20), 4326), '{"aisle":"CORREDOR 2","col":1}')
            RETURNING id INTO v_node_corredor_2;
        END IF;

        SELECT id INTO v_node_corredor_3 FROM no_grafo WHERE filial_id = v_store_id AND nome = 'Corredor 3' LIMIT 1;
        IF v_node_corredor_3 IS NULL THEN
            INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
            VALUES (v_store_id, 'Corredor 3', 'corredor', ST_SetSRID(ST_MakePoint(30, 15), 4326), '{"aisle":"CORREDOR 3","col":2}')
            RETURNING id INTO v_node_corredor_3;
        END IF;

        SELECT id INTO v_node_hortifruti FROM no_grafo WHERE filial_id = v_store_id AND nome = 'Hortifruti' LIMIT 1;
        IF v_node_hortifruti IS NULL THEN
            INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
            VALUES (v_store_id, 'Hortifruti', 'corredor', ST_SetSRID(ST_MakePoint(40, 30), 4326), '{"aisle":"HORTI","col":3}')
            RETURNING id INTO v_node_hortifruti;
        END IF;

        SELECT id INTO v_node_checkout FROM no_grafo WHERE filial_id = v_store_id AND tipo = 'checkout' LIMIT 1;
        IF v_node_checkout IS NULL THEN
            INSERT INTO no_grafo (filial_id, nome, tipo, coordenadas, metadata)
            VALUES (v_store_id, 'Caixas', 'checkout', ST_SetSRID(ST_MakePoint(5, 35), 4326), '{"zone":"checkout"}')
            RETURNING id INTO v_node_checkout;
        END IF;

        -- Connect edges if not already present
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

        -- Update products with aisle, shelf, size, price and graph node
        UPDATE produto
        SET corredor = 'Corredor 3',
            prateleira = 'Prateleira central',
            tamanho = '1 un.',
            preco = 5.49,
            no_id = v_node_corredor_3
        WHERE filial_id = v_store_id AND ean = '7891000000028';

        UPDATE produto
        SET corredor = 'Setor A',
            prateleira = 'Banca central',
            tamanho = '1 kg',
            preco = 6.99,
            no_id = v_node_hortifruti
        WHERE filial_id = v_store_id AND ean = '7891000000011';

        UPDATE produto
        SET nome = 'Pão de forma',
            corredor = 'Corredor 1',
            prateleira = 'Prateleira central',
            tamanho = '1 un.',
            preco = 8.90,
            no_id = v_node_corredor_1
        WHERE filial_id = v_store_id AND ean = '7891000000097';

        UPDATE produto
        SET corredor = 'Corredor 2',
            prateleira = 'Prateleira inferior',
            tamanho = '1 un.',
            no_id = v_node_corredor_2
        WHERE filial_id = v_store_id AND ean IN ('7891000000035', '7891000000042', '7891000000141');

        UPDATE produto
        SET corredor = 'Corredor 1',
            prateleira = 'Prateleira superior',
            tamanho = '1 un.',
            no_id = v_node_corredor_1
        WHERE filial_id = v_store_id AND ean IN ('7891000000059', '7891000000073', '7891000000103');

        UPDATE produto
        SET corredor = 'Corredor 2',
            prateleira = 'Prateleira central',
            tamanho = '1 un.',
            no_id = v_node_corredor_2
        WHERE filial_id = v_store_id AND ean IN ('7891000000066', '7891000000110', '7891000000158');

        UPDATE produto
        SET corredor = 'Corredor 3',
            prateleira = 'Balcão refrigerado',
            tamanho = '1 un.',
            no_id = v_node_corredor_3
        WHERE filial_id = v_store_id AND ean IN ('7891000000080', '7891000000134');

        UPDATE produto
        SET corredor = 'Setor A',
            prateleira = 'Banca lateral',
            tamanho = '1 kg',
            no_id = v_node_hortifruti
        WHERE filial_id = v_store_id AND ean = '7891000000127';
    END IF;
END $$;
