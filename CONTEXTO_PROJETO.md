# Contexto de continuidade — Ach.ai

## Objetivo atual

O projeto é o Ach.ai, uma plataforma de navegação indoor para supermercados. A arquitetura possui:

- `src/backend`: API Node.js HTTP + PostgreSQL/PostGIS;
- `src/mobile`: aplicativo React Native com Expo, também exportável para Web;
- `src/frontend`: Web App separado.

O trabalho atual concluiu a Fase 3 — Lista de compras.

## Stack

### Mobile

- Expo SDK 52;
- React Native 0.76.5;
- React 18;
- React Navigation 6;
- NativeWind;
- `expo-secure-store`;
- `expo-camera`;
- `react-native-svg`;
- fontes Inter e Rubik.

### Backend

- Node.js 20;
- API HTTP própria usando `node:http`;
- PostgreSQL 16 com PostGIS;
- `pg`, `jsonwebtoken`, `bcryptjs`;
- JWT com issuer `achai-api`;
- migrations SQL aplicadas em ordem por `src/backend/scripts/migrate.js`.

## Fases concluídas

### Autenticação

- Login, cadastro e recuperação de senha;
- JWT;
- armazenamento seguro no mobile;
- recuperação por link direto;
- tokens de recuperação com hash, expiração e uso único.

### Home e QR Code

- `HomeScreen`;
- CTA de QR Code;
- `QrScannerScreen`;
- permissão da câmera e flash;
- leitura real do conteúdo do QR Code ainda não foi concluída;
- `storeId` ainda usa o valor demo padrão em alguns fluxos.

### Fase 1 — Catálogo

Arquivos relevantes:

- `src/backend/migrations/006_demo_catalog.sql`;
- `src/backend/migrations/007_phase1_catalog_seed.sql`;
- `src/backend/src/model/catalog-model.js`;
- `src/backend/src/router.js`;
- `src/backend/test/catalog.test.js`.

Endpoint canônico:

```http
GET /stores/{storeId}/products?q=<texto>&limit=<n>
Authorization: Bearer <token>
```

O catálogo é filtrado por filial, possui busca com `unaccent`/`pg_trgm`, estoque e localização. O alias legado `/catalog` continua disponível.

### Fase 2 — Busca mobile

Arquivos relevantes:

- `src/mobile/src/screens/CatalogScreen.jsx`;
- `src/mobile/src/components/SearchBar.jsx`;
- `src/mobile/src/services/catalog-api.js`.

Implementado:

- debounce de 300 ms;
- cancelamento de requisições antigas com `AbortController`;
- categorias;
- `FlatList`;
- skeleton loading;
- estados de carregamento, vazio, erro e offline;
- pull-to-refresh;
- botão desabilitado para produto fora de estoque.

### Fase 3 — Lista de compras

Arquivos adicionados ou alterados:

- `src/backend/migrations/008_shopping_lists.sql`;
- `src/backend/src/model/shopping-list-model.js`;
- `src/backend/src/router.js`;
- `src/backend/src/utils/http.js`;
- `src/backend/test/shopping-list.test.js`;
- `src/mobile/src/services/shopping-list-api.js`;
- `src/mobile/src/screens/CreateListScreen.jsx`;
- `README.md`.

## API da Fase 3

Todas as rotas exigem Bearer Token e restringem os dados ao usuário autenticado.

### Criar lista

```http
POST /stores/{storeId}/lists
Content-Type: application/json

{
  "name": "Compra da semana"
}
```

Retorna `201` com `{ list }`.

### Adicionar item

```http
POST /lists/{listId}/items
Content-Type: application/json

{
  "productId": 123,
  "quantity": 2
}
```

Retorna o resumo atualizado da lista.

### Alterar quantidade

```http
PATCH /lists/{listId}/items/{productId}
Content-Type: application/json

{
  "quantity": 3
}
```

### Remover item

```http
DELETE /lists/{listId}/items/{productId}
```

### Consultar resumo

```http
GET /lists/{listId}
```

O resumo inclui:

- `itemCount`;
- `productCount`;
- `total`;
- `storeId`;
- `storeName`;
- `hasLocationWarning`;
- `locationWarning`.

Produtos fora de estoque são rejeitados com `409`. Produtos sem `no_id`, `corredor` e `prateleira` podem ser adicionados, mas ativam o alerta de que ficarão fora da rota.

## Estado do mobile na Fase 3

`CreateListScreen` agora:

- carrega produtos do endpoint persistido;
- usa a filial demo `00000000-0000-0000-0000-000000000001`;
- permite pesquisar e filtrar categorias;
- bloqueia adição de produtos fora de estoque;
- exibe indicação de produto sem localização;
- calcula quantidade e total estimado;
- cria a lista no backend;
- adiciona os itens sequencialmente;
- exibe alerta quando algum item não possui localização.

Limitação importante: a tela ainda usa a filial demo fixa. O próximo passo natural é processar o QR Code, salvar a loja atual no contexto/storage e passar o `storeId` real para catálogo e listas.

## Validações realizadas

Executar a partir da raiz do repositório:

```powershell
cd src\backend
npm test
```

Resultado atual: 23 testes passaram.

```powershell
cd src\mobile
npx expo export --platform web
```

Resultado atual: exportação web passou.

```powershell
git diff --check
```

Resultado atual: passou.

## Próximos passos recomendados

1. Implementar leitura efetiva do QR Code em `QrScannerScreen`.
2. Validar o payload do QR Code e persistir o `storeId` atual.
3. Criar contexto ou storage de loja selecionada.
4. Remover o `DEFAULT_STORE_ID` fixo de `CreateListScreen` e `CatalogScreen`.
5. Criar tela para consultar e editar listas já criadas.
6. Atualizar a Home para carregar listas persistidas em vez de sempre mostrar estado vazio.
7. Corrigir o fluxo de adicionar itens para fazer operações em lote ou usar transação no backend.
8. Adicionar endpoint de atualização do nome da lista, se necessário.
9. Criar testes de integração HTTP para criação, isolamento por usuário, alteração e remoção de itens.
10. Implementar cálculo de rota indoor somente depois de loja, produtos e localizações estarem ligados ao QR Code.

## Atenções técnicas

- Não editar migrations antigas já aplicadas; criar uma nova migration numerada.
- Não usar catálogos públicos como fonte principal de preço/estoque.
- O catálogo principal deve vir do ERP da loja, CSV no piloto ou banco próprio.
- O backend atualmente usa `admin`/`manager` como roles; no futuro deve existir uma separação adequada para consumidor final.
- A leitura de QR Code ainda não está ligada ao catálogo.
- A persistência de listas usa tabelas `shopping_list` e `shopping_list_item`.
- O arquivo `src/mobile/Venha para a FECAP!.txt` é vazio e deve permanecer no worktree.

## Comandos úteis

```powershell
# Backend
cd src\backend
npm test
npm start

# Mobile
cd src\mobile
npm start
npx expo export --platform web

# Banco/API via Docker
docker compose up --build --wait
docker compose down
```

## Regra para retomada

Antes de implementar uma nova fase:

1. ler este arquivo;
2. verificar `git status --short`;
3. ler os arquivos diretamente relacionados à nova tarefa;
4. preservar migrations já aplicadas;
5. executar testes backend, export Expo e `git diff --check` após as alterações.
