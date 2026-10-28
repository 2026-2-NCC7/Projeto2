# Contexto de Continuidade — Ecossistema Ach.ai

## 1. Visão Geral da Arquitetura (3 Frontends + 1 Backend Central)

O **Ach.ai** é uma plataforma de navegação indoor e descoberta de produtos para supermercados. O ecossistema é composto por **um único Backend central** que conversa com **três aplicações clientes distintas**:

```
                       ┌──────────────────────────────────────┐
                       │          src/backend (API)           │
                       │  Node.js 20 HTTP + PostgreSQL/PostGIS│
                       │         http://localhost:3000        │
                       └──────┬───────────┬────────────┬──────┘
                              │           │            │
        ┌─────────────────────┘           │            └─────────────────────┐
        ▼                                 ▼                                  ▼
┌──────────────────────┐       ┌──────────────────────┐           ┌──────────────────────┐
│    src/frontend      │       │      src/mobile      │           │      src/webapp      │
│   (Dashboard B2B)    │       │  (App Consumidor)    │           │  (WebApp QR Code)    │
│   http://...:5173    │       │   http://...:8081    │           │   http://...:5174    │
├──────────────────────┤       ├──────────────────────┤           ├──────────────────────┤
│ • Portal das lojas   │       │ • Expo / React Native│           │ • React 19 + Vite    │
│ • Login corporativo  │       │ • Login / Cadastro   │           │ • Acesso instantâneo │
│ • Gestão completa do │       │ • Mapa de mercados   │           │   ao ler QR na loja  │
│   catálogo da filial │       │ • Listas salvas (DB) │           │ • SEM cadastro/login │
│ • Mapa/corredores    │       │ • Rota indoor + QR   │           │ • Rota indoor guiada │
│   e estoque          │       │ • Perfil completo    │           │ • Conversão pro App  │
└──────────────────────┘       └──────────────────────┘           └──────────────────────┘
```

1. **Backend (`src/backend` — Porta `3000`)**:
   - Node.js 20 (`node:http`) + PostgreSQL 16 com PostGIS (rodando via Docker na porta `3000`, banco na porta `5432`/`5433`).
   - Serve dados de lojas (`filial`), catálogo de produtos (`produto`), grafo de navegação indoor (`no_grafo`, `aresta`), listas de compras (`shopping_list`, `shopping_list_item`) e cálculo de menor caminho (`Dijkstra` + *Nearest-Neighbor* em `route-model.js`).
2. **Dashboard B2B (`src/frontend` — Porta `5173`)**:
   - Aplicação Web (React + Vite) voltada para os **supermercados parceiros** (`admin` / `manager`).
   - Onde a loja faz login corporativo (`LoginSupermercado.jsx`) e gerencia catálogo, preços, estoque, corredores e mapa da unidade.
3. **App Mobile do Consumidor (`src/mobile` — Porta `8081`)**:
   - Aplicativo React Native (Expo SDK 52 + NativeWind v4) para o consumidor recorrente que possui conta no Ach.ai.
   - Permite buscar supermercados próximos em mapa real (OpenStreetMap + Leaflet + GPS via `expo-location`), ver detalhes da unidade, criar/salvar/excluir múltiplas listas sincronizadas no banco, escanear QR Code e gerenciar perfil.
4. **WebApp do Consumidor via QR Code (`src/webapp` — Porta `5174`)**:
   - Aplicação Web dedicada (React 19 + Vite) mobile-first (`390x844`) acessada imediatamente quando o cliente escaneia o QR Code físico na entrada do supermercado usando a câmera do celular, **sem precisar instalar aplicativo e sem cadastro** (*"Sem cadastro. Sua sessão é temporária."*).

---

## 2. Estado Atual do Repositório (Branch `webapp`)

### 2.1. O que já está pronto no Backend (`src/backend`)
- **Migrations (`001` a `010`)**:
  - `001_initial_schema.sql`: tabelas `filial`, `qr_code`, `no_grafo`, `aresta`, `produto` com suporte PostGIS, `unaccent` e `pg_trgm`.
  - `002` a `005`: autenticação (`admin_user`, roles `admin`/`manager`, recuperação de senha com token hash).
  - `006` e `007`: lojas demo (`00000000-0000-0000-0000-000000000001` — `Mercado Aurora` e `11111111-1111-1111-1111-111111111111` — `Mercado Aurora - Centro`) e catálogo inicial.
  - `008` e `009`: tabelas `shopping_list` e `shopping_list_item` com status `confirmed`.
  - `010_webapp_store_graph.sql`: popula os nós do grafo indoor (`Entrada Principal`, `Corredor 1`, `Corredor 2`, `Corredor 3`, `Hortifruti`, `Caixas`), arestas bidirecionais (`aresta`) e vincula todos os produtos do `Mercado Aurora` aos seus respectivos corredores, prateleiras e `no_id`.
- **Rotas implementadas em `src/backend/src/router.js`**:
  - **Públicas (usadas pelo `src/webapp` via QR Code e pelo Mobile)**:
    - `GET /health`
    - `GET /stores/:storeId` (dados da unidade)
    - `GET /stores/:storeId/products?q=<texto>&limit=<n>` (catálogo da unidade com busca por trigramas e `unaccent`)
    - `POST /stores/:storeId/route` (recebe `{ items: [{ productId, quantity }], startAisle?, startNodeId? }` e retorna a rota indoor ordenada pelo menor caminho via *Nearest-Neighbor + Dijkstra* + metadados do grafo `entrance`, `checkout`, `nodes`)
  - **Autenticação**:
    - `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`
  - **Protegidas por JWT (`requireRole`)**:
    - `POST /admin/register`
    - `GET /suggestions?storeId=<uuid>`
    - `GET /catalog?storeId=<uuid>&search=<texto>`
    - `GET /lists`, `POST /stores/:storeId/lists`, `GET /lists/:listId`, `DELETE /lists/:listId`
    - `POST /lists/:listId/items`, `PATCH /lists/:listId/items/:productId`, `DELETE /lists/:listId/items/:productId`
    - `POST /lists/:listId/route`
- **CORS (`src/backend/src/app.js` e `docker-compose.yml`)**:
  - Permite `http://localhost:5173,http://localhost:5174,http://localhost:8081` com `GET, POST, PATCH, DELETE, OPTIONS`.
- **Testes Automatizados (`npm --prefix src/backend test`)**:
  - 27 testes unitários e de integração passando (`auth.test.js`, `catalog.test.js`, `migrate.test.js`, `shopping-list.test.js`).

---

### 2.2. O que já está pronto no WebApp (`src/webapp`)
Aplicação independente em `src/webapp` rodando na porta `5174` com proxy Vite configurado para `/stores`, `/auth`, `/lists` e `/health` (`http://localhost:3000`), além de fallback offline automático em `src/webapp/src/services/webapp-api.js`.

#### Estrutura de Arquivos de `src/webapp`:
- `src/webapp/package.json` e `src/webapp/vite.config.js`
- `src/webapp/index.html` (Fontes Google `Rubik` e `Inter`)
- `src/webapp/src/App.jsx` (Gerencia estado da sessão em `sessionStorage`, leitura de `?storeId=...` e `?screen=entry|search|list|route|completed`)
- `src/webapp/src/services/webapp-api.js` (Integração com `GET /stores/:storeId`, `GET /stores/:storeId/products`, `POST /stores/:storeId/route`, e cadastro rápido `registerAndSaveSessionList` que cria conta e persiste a lista da sessão temporária no banco)
- `src/webapp/src/components/StoreHeader.jsx` (Header com marca `"Ach.ai"` + pílula `"⌖  Mercado Aurora"`)
- `src/webapp/src/components/BottomNav.jsx` (Navegação inferior de 3 abas do WebApp: `Início`, `Buscar`, `Minha lista`)
- `src/webapp/src/styles/webapp.css` (Estilização fiel ao Figma `390x844`)

#### As 5 Telas Implementadas em `src/webapp/src/screens/`:
1. **`QrEntryScreen.jsx` (`01 — Entrada via QR Code` — Figma `2063:2`)**:
   - Hero laranja (`#F26900`) com `"Ach.ai"`, `"SUA COMPRA, MAIS INTELIGENTE"`, `"Encontre tudo. Sem perder tempo."`.
   - Card de identificação da loja (`"VOCÊ ESTÁ EM"` → `"Mercado Aurora"` com check `"✓"`).
   - Seção `"Como funciona"` (passos `1`, `2`, `3`).
   - Botão `"Começar minha compra  →"` e aviso `"Sem cadastro. Sua sessão é temporária."`.
2. **`ProductSearchScreen.jsx` (`02 — Busca de produtos` — Figma `2063:29`)**:
   - Busca em tempo real no catálogo da loja (`GET /stores/:storeId/products`).
   - Filtro interativo pelas 4 categorias (`Hortifruti` `🥬`, `Laticínios` `🥛`, `Padaria` `🍞`, `Limpeza` `🧼`).
   - Cards de produtos (`"Mais buscados"` / resultados) com corredor, preço formatado e botão `"+"` para adicionar à lista da sessão.
   - CTA `"Ver minha lista  ·  X itens  →"` e Bottom Navigation de 3 abas.
3. **`ShoppingListScreen.jsx` (`03 — Lista de compras` — Figma `2063:84`)**:
   - Lista de itens adicionados na sessão com checkbox `"✓"`, corredor/setor e ajuste de quantidade (`1 un.`, `1 kg`).
   - Botão `"+  Adicionar mais produtos"`, card `"Sua rota está quase pronta"` e CTA `"Gerar rota otimizada  →"`.
4. **`OptimizedRouteScreen.jsx` (`04 — Rota otimizada` — Figma `2063:122`)**:
   - **Mapa Indoor Interativo (`350x355`)**:
     - 4 colunas de corredores (`CORREDOR 1`, `CORREDOR 2`, `CORREDOR 3`, `HORTI`).
     - **Traçado ortogonal dinâmico em SVG** (`buildOrthogonalPolylinePoints`) conectando os corredores dos itens presentes na lista do usuário.
     - **Pins numerados das paradas (`1`, `2`, `3`...)** que viram `"✓"` conforme os produtos são coletados.
     - **Indicador de posição `"• VOCÊ"`** que acompanha a parada ativa do consumidor entre a `ENTRADA (QR)` e o `CAIXA`.
     - **Reposicionamento por toque no corredor**: tocar em qualquer corredor no mapa ancora a posição atual do usuário naquele corredor (`startAisle`) e recalcula a rota otimizada a partir dali.
   - Card da parada atual (`"PRÓXIMO PRODUTO · X DE Y"`, `"Marcar como coletado"`, `"Não encontrei"`) e barra de progresso (`"X de Y itens coletados"`).
5. **`PurchaseCompletedScreen.jsx` (`05 — Compra concluída e Conversão para o App`)**:
   - Exibida automaticamente ao concluir a coleta do último item da rota.
   - Confirma a conclusão da compra (`"Tudo no carrinho. Siga para o caixa!"`) e apresenta os 3 benefícios de criar conta no App Ach.ai.
   - Possui modal (*bottom sheet*) integrado ao backend (`POST /auth/register` + `POST /auth/login` + `POST /stores/:storeId/lists`) que permite criar a conta em segundos e **salvar automaticamente a lista da sessão temporária no banco de dados**, ou abrir diretamente o App Mobile.

---

## 3. Próximas Melhorias Sugeridas para o WebApp (Foco para Continuar com Outras IAs)

1. **Tratamento de Itens `"Não encontrei"` e Sugestão de Substitutos**:
   - Na `OptimizedRouteScreen.jsx`, quando o usuário clica em `"Não encontrei"`, além de avançar para o próximo item, exibir um alerta/opção rápida sugerindo produtos equivalentes da mesma categoria naquela loja (consumindo `GET /stores/:storeId/products?q=<categoria>`) ou listar os itens não encontrados na `PurchaseCompletedScreen.jsx`.
2. **Controles de Quantidade (`-` / `+`) e Exclusão Individual na `ShoppingListScreen.jsx`**:
   - Permitir incrementar/decrementar a quantidade com botões `-` e `+` explícitos ou deslizar/clicar para remover um item específico sem precisar apenas ciclar a quantidade.
3. **Compartilhamento / Exportação de QR Code da Lista**:
   - Permitir gerar um link compartilhável ou QR Code da lista montada no WebApp para abrir direto no App Mobile (`src/mobile`).
4. **Animação Suave de Transição no Mapa Indoor e Destaque de Prateleira**:
   - Adicionar indicação visual da altura da prateleira (*Superior*, *Central*, *Inferior*, *Balcão refrigerado*) no card da parada atual em `OptimizedRouteScreen.jsx` e destacar no mapa o caminho final até o `CAIXA` quando faltar o último item.
5. **Testes Automatizados para o `src/webapp`**:
   - Adicionar testes unitários/componentes para o cálculo de coordenadas do mapa e fluxo de sessão do `src/webapp`.

---

## 4. Referências do Figma e Regras Gerais

- **Figma**:
  - O token da API do Figma está em `C:/Users/Leo/.gemini/config/mcp_config.json` (`mcpServers.figma.env.FIGMA_API_KEY`).
  - `fileKey`: `IrxLRT7xxR4HuImDxYvHjr`
  - Nós do WebApp: `2063:2` (Entrada QR), `2063:29` (Busca), `2063:84` (Minha Lista), `2063:122` (Rota Otimizada).
- **Regras do Repositório**:
  - **Nunca editar migrations SQL já aplicadas** (`001` a `010`); se precisar alterar o schema ou dados, criar `011_*.sql`.
  - Preservar o arquivo `src/mobile/Venha para a FECAP!.txt`.
  - Validar sempre com `npm --prefix src/backend test`, `cd src/webapp && npm run build` e `git diff --check`.

---

## 5. Comandos Úteis

```powershell
# Subir ou atualizar Banco (PostGIS) + API (:3000) via Docker
docker compose up -d --build

# Rodar testes do Backend (27 testes)
npm --prefix src/backend test

# Rodar WebApp (Consumidor via QR Code — Vite :5174)
cd src/webapp
npm run dev
# Acesse: http://localhost:5174/?storeId=00000000-0000-0000-0000-000000000001

# Rodar Dashboard B2B (Supermercados — Vite :5173)
cd src/frontend
npm run dev

# Rodar App Mobile (Consumidor com conta — Expo :8081)
cd src/mobile
npx expo start --web
```
