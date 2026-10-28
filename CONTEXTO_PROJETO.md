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
│    src/frontend      │       │      src/mobile      │           │   WebApp (QR Code)   │
│   (Dashboard B2B)    │       │  (App Consumidor)    │           │ (Sessão Temporária)  │
├──────────────────────┤       ├──────────────────────┤           ├──────────────────────┤
│ • Portal das lojas   │       │ • Expo / React Native│           │ • Acesso instantâneo │
│ • Login corporativo  │       │ • Login / Cadastro   │           │   ao ler QR na loja  │
│ • Gestão completa do │       │ • Mapa de mercados   │           │ • SEM cadastro/login │
│   catálogo da filial │       │ • Listas salvas (DB) │           │ • Busca no catálogo  │
│ • Mapa/corredores    │       │ • Rota indoor + QR   │           │ • Lista na sessão    │
│   e estoque          │       │ • Perfil completo    │           │ • Rota indoor guiada │
└──────────────────────┘       └──────────────────────┘           └──────────────────────┘
```

1. **Backend (`src/backend`)**:
   - Node.js 20 (`node:http`) + PostgreSQL 16 com PostGIS (rodando via Docker na porta `3000`, banco na porta `5433`).
   - Serve dados de lojas (`filial`), catálogo de produtos (`produto`), grafo de navegação indoor (`no`, `aresta`), listas de compras (`shopping_list`, `shopping_list_item`) e cálculo de menor caminho (`Dijkstra` em `route-model.js`).
2. **Dashboard B2B (`src/frontend`)**:
   - Aplicação Web (React + Vite) voltada para os **supermercados parceiros** (`admin` / `manager`).
   - Onde a loja faz login corporativo (`LoginSupermercado.jsx`) e gerencia todo o seu catálogo, preços, estoque, corredores e mapa da unidade.
3. **App Mobile do Consumidor (`src/mobile`)**:
   - Aplicativo React Native (Expo SDK 52 + NativeWind v4) para o consumidor recorrente que possui conta no Ach.ai.
   - Permite buscar supermercados próximos em mapa real (OpenStreetMap + Leaflet + GPS via `expo-location`), ver detalhes da unidade, criar/salvar/excluir múltiplas listas sincronizadas no banco, escanear QR Code e gerenciar perfil.
4. **WebApp do Consumidor via QR Code (`WebApp` — Foco da Próxima Etapa)**:
   - Experiência web mobile-first (`390x844`) acessada imediatamente quando o cliente escaneia o QR Code físico na entrada do supermercado usando a câmera do celular, **sem precisar instalar aplicativo e sem cadastro** (*"Sem cadastro. Sua sessão é temporária."*).

---

## 2. Estado Atual do Repositório (Branch `mobile` — Commit `d306df5`)

### O que já está pronto no Backend (`src/backend`)
- **Migrations (`001` a `009`)**:
  - `001_initial_schema.sql`: tabelas `filial`, `no`, `aresta`, `produto` com suporte PostGIS, `unaccent` e `pg_trgm`.
  - `002` a `005`: autenticação (`admin_user`, roles `admin`/`manager`, recuperação de senha com token hash).
  - `006` e `007`: loja demo (`00000000-0000-0000-0000-000000000001` — Mercado Aurora / Mercado Liberdade), grafo de nós/arestas e produtos com corredores/prateleiras.
  - `008` e `009`: tabelas `shopping_list` e `shopping_list_item`.
- **Rotas implementadas em `src/backend/src/router.js`**:
  - `GET /health`
  - `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`
  - `POST /admin/register`
  - `GET /suggestions?storeId=<uuid>`
  - `GET /stores/:storeId` (dados da unidade)
  - `GET /stores/:storeId/products?q=<texto>&limit=<n>` (catálogo da unidade)
  - `GET /catalog?storeId=<uuid>&search=<texto>` (alias legado)
  - `GET /lists` (lista todas as listas salvas do usuário autenticado com `items`)
  - `POST /stores/:storeId/lists` (cria lista)
  - `GET /lists/:listId` (resumo da lista)
  - `DELETE /lists/:listId` (remove lista e seus itens via `CASCADE`)
  - `POST /lists/:listId/items`, `PATCH /lists/:listId/items/:productId`, `DELETE /lists/:listId/items/:productId`
  - `POST /lists/:listId/route` (calcula rota indoor otimizada no grafo da loja)
- **CORS (`src/backend/src/middlewares/cors.js`)**:
  - Já configurado com `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`.

### O que já está pronto no Mobile (`src/mobile`)
Todas as telas abaixo já foram criadas seguindo fielmente o Figma e estão registradas em `src/mobile/App.jsx`:
- **Autenticação**: `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `ForgotPasswordConfirmationScreen`, `ResetPasswordScreen`.
- **Abas Principais (com `BottomNavigation` de 4 abas: `Início`, `Buscar`, `Listas`, `Perfil` e headers padronizados)**:
  - `HomeScreen.jsx` (`Início`)
  - `CatalogScreen.jsx` (`Buscar supermercados` — Figma `2088:749`, com mapa interativo real OpenStreetMap + Leaflet em `InteractiveStoreMap.jsx`, GPS via `expo-location`, geocodificação Nominatim e busca de mercados via Overpass API)
  - `MyListsScreen.jsx` (`Minhas listas` — Figma `2063:222`, integrada ao backend via `GET /lists` e `DELETE /lists/:id`)
  - `ProfileScreen.jsx` (`Meu perfil` — Figma `2063:254`)
- **Fluxo de Loja, Lista, QR e Rota**:
  - `StoreDetailsScreen.jsx` (`Detalhes do Mercado Liberdade` — Figma `2102:1157`)
  - `CreateListScreen.jsx` (`Criar nova lista` — Figma `2102:722`, com carrossel horizontal de 10 categorias e integração com backend)
  - `QrScannerScreen.jsx` (`Leitor de QR Code`)
  - `RouteScreen.jsx` (`Rota indoor otimizada`)
- **Subtelas de Perfil**:
  - `PersonalDataScreen.jsx` (`2088:1278`)
  - `PreferencesScreen.jsx` (`2088:1594`)
  - `PrivacyScreen.jsx` (`2088:1959`)
  - `PrivacyPolicyScreen.jsx` (`2096:310`)
  - `SecurityScreen.jsx` (`2088:2229`)
  - `HelpScreen.jsx` (`2088:2533`)
  - `ContactTeamScreen.jsx` (`2096:3`)
  - `ContactSuccessScreen.jsx` (`2098:41`)

---

## 3. Escopo do Novo Chat: Desenvolvimento do WebApp (Consumidor via QR Code)

O próximo escopo é construir o **WebApp do Consumidor** baseado nas **4 telas do Figma** (arquivo `IrxLRT7xxR4HuImDxYvHjr`).

### Diferença Conceitual Importante (App Mobile vs. WebApp)
- No **WebApp**, o usuário **não faz login** (*"Sem cadastro. Sua sessão é temporária."*).
- Ele entra no WebApp ao ler o QR Code na porta do supermercado (ex.: `/webapp?storeId=00000000-0000-0000-0000-000000000001`).
- A lista de compras do WebApp pode ser mantida em `sessionStorage`/`localStorage` (ou sessão anônima) e a navegação inferior tem **apenas 3 abas**: `Início`, `Buscar` e `Minha lista` (não existe aba `Perfil`).

### Especificação das 4 Telas do WebApp no Figma

#### Tela 1 — `01 — Entrada via QR Code` (Node `2063:2`)
- **Link**: `https://www.figma.com/design/IrxLRT7xxR4HuImDxYvHjr/Ach.ai-telas?node-id=2063-2`
- **Dimensões base**: `390x844`
- **Estrutura e Conteúdo**:
  - **Hero (`2063:3`)**:
    - Marca: `"Ach.ai"`
    - Eyebrow: `"SUA COMPRA, MAIS INTELIGENTE"`
    - Headline: `"Encontre tudo. Sem perder tempo."`
    - Subheadline: `"Sua rota de compras começa aqui."`
  - **Card de Identificação da Loja (`2063:8`)**:
    - Eyebrow: `"VOCÊ ESTÁ EM"`
    - Nome da loja: `"Mercado Aurora"` (carregado via `storeId` do QR Code)
    - Badge de confirmação QR (`2063:11`): `"✓"`
  - **Seção `"Como funciona"` (`2063:13`)**:
    - Passo `1` (`2063:14`): `"Monte sua lista"` — `"Busque os produtos que precisa."`
    - Passo `2` (`2063:18`): `"Receba sua rota"` — `"Encontre o caminho mais eficiente."`
    - Passo `3` (`2063:22`): `"Acompanhe a compra"` — `"Marque os itens conforme coleta."`
  - **CTA Principal (`2063:26`)**:
    - Botão: `"Começar minha compra  →"` (navega para a Tela 2 — Busca de produtos)
    - Rodapé de privacidade (`2063:28`): `"Sem cadastro. Sua sessão é temporária."`

#### Tela 2 — `02 — Busca de produtos` (Node `2063:29`)
- **Link**: `https://www.figma.com/design/IrxLRT7xxR4HuImDxYvHjr/Ach.ai-telas?node-id=2063-29`
- **Dimensões base**: `390x844`
- **Estrutura e Conteúdo**:
  - **Topo**:
    - Marca `"Ach.ai"` + Pílula da loja (`2063:31`): `"⌖  Mercado Aurora"`
    - Saudação (`2063:33`): `"O que você precisa hoje?"`
    - Campo de busca (`2063:34`): ícone `"⌕"` + placeholder `"Buscar produto ou marca"`
  - **Categorias (`2063:37`)**:
    - `"Hortifruti"` (`🥬`), `"Laticínios"` (`🥛`), `"Padaria"` (`🍞`), `"Limpeza"` (`🧼`)
  - **Mais buscados (`2063:50`)**:
    - Cards horizontais de produtos vindos do catálogo da loja:
      1. `"Leite integral 1 L"` — `"Laticínios · Corredor 3"` — `"R$ 5,49"` + botão `"+"`
      2. `"Banana prata"` — `"Hortifruti · Setor A"` — `"R$ 6,99/kg"` + botão `"+"`
      3. `"Pão de forma"` — `"Padaria · Corredor 1"` — `"R$ 8,90"` + botão `"+"`
  - **Barra Flutuante da Lista (`2063:75`)**:
    - `"Ver minha lista  ·  3 itens  →"` (navega para a Tela 3)
  - **Bottom Navigation de 3 abas (`2063:77`)**:
    - `Início` (`⌂`), `Buscar` (`⌕` — ativa), `Minha lista` (`☷`)

#### Tela 3 — `03 — Lista de compras` (Node `2063:84`)
- **Link**: `https://www.figma.com/design/IrxLRT7xxR4HuImDxYvHjr/Ach.ai-telas?node-id=2063-84`
- **Dimensões base**: `390x844`
- **Estrutura e Conteúdo**:
  - **Topo**:
    - Marca `"Ach.ai"` + Pílula `"⌖  Mercado Aurora"`
    - Título (`2063:88`): `"Minha lista"`
    - Subtítulo (`2063:89`): `"3 produtos adicionados"`
  - **Itens da Lista**:
    - Card 1 (`2063:90`): Checkbox `"✓"` + `"Leite integral 1 L"` + `"Corredor 3"` + `"1 un."`
    - Card 2 (`2063:96`): Checkbox `"✓"` + `"Banana prata"` + `"Hortifruti"` + `"1 kg"`
    - Card 3 (`2063:102`): Checkbox `"✓"` + `"Pão de forma"` + `"Corredor 1"` + `"1 un."`
  - **Botão Secundário (`2063:108`)**:
    - `"+  Adicionar mais produtos"` (volta para a Tela 2)
  - **Card de Resumo de Rota (`2063:110`)**:
    - Título: `"Sua rota está quase pronta"`
    - Detalhe: `"3 itens · percurso otimizado"`
  - **CTA Principal (`2063:113`)**:
    - `"Gerar rota otimizada  →"` (navega para a Tela 4)
  - **Bottom Navigation de 3 abas (`2063:115`)**:
    - `Início` (`⌂`), `Buscar` (`⌕`), `Minha lista` (`☷` — ativa)

#### Tela 4 — `04 — Rota otimizada` (Node `2063:122`)
- **Link**: `https://www.figma.com/design/IrxLRT7xxR4HuImDxYvHjr/Ach.ai-telas?node-id=2063-122`
- **Dimensões base**: `390x844`
- **Estrutura e Conteúdo**:
  - **Topo**:
    - Marca `"Ach.ai"` + Pílula `"⌖  Mercado Aurora"`
    - Título (`2063:126`): `"Sua rota de compra"`
    - Subtítulo (`2063:127`): `"Mercado Aurora · 3 paradas"`
  - **Mapa Indoor da Loja (`2063:128`)**:
    - Corredores (`CORREDOR 1`, `CORREDOR 2`, `CORREDOR 3`, `HORTI`)
    - Traçado da rota (`Route segment vertical`, `horizontal`, `last`)
    - Paradas numeradas: `Stop 1` (`1`), `Stop 2` (`2`), `Stop 3` (`3`)
  - **Card da Parada Atual (`2063:146`)**:
    - Eyebrow (`2063:147`): `"PRÓXIMO PRODUTO · 1 DE 3"`
    - Produto (`2063:148`): `"Leite integral 1 L"`
    - Localização (`2063:149`): `"Corredor 3 · Prateleira central"`
    - Botão principal (`2063:150`): `"Marcar como coletado"`
    - Link secundário (`2063:152`): `"Não encontrei"`
  - **Barra de Progresso (`2063:153`)**:
    - Barra de preenchimento + texto `"1 de 3 itens coletados"`

---

## 4. Pontos de Atenção para o Backend ao Integrar o WebApp

1. **Acesso Público / Sessão Temporária no Backend (`src/backend/src/router.js`)**:
   - Atualmente, `GET /stores/:storeId`, `GET /stores/:storeId/products` e o cálculo de rota exigem `requireRole(..., ["admin", "manager"])` (Bearer JWT).
   - Para que o **WebApp sem cadastro** funcione de ponta a ponta consumindo o backend real:
     - Permitir leitura pública (ou criar endpoints públicos/de sessão temporária) para consultar dados da loja (`GET /stores/:storeId`), produtos da loja (`GET /stores/:storeId/products`) e calcular rota a partir de uma lista de `productIds` em memória (`POST /stores/:storeId/route` recebendo `{ items: [{ productId, quantity }] }`), **sem exigir login**, mantendo as rotas administrativas protegidas para o Dashboard B2B.
   - Verificar `CORS_ORIGIN` no `docker-compose.yml` / `src/backend/src/app.js` caso o WebApp rode em uma porta diferente (ex.: `http://localhost:5173` do Vite já está permitido por padrão no backend, além de `http://localhost:8081`).

2. **Como Inspecionar os Nós do Figma Rapidamente**:
   - O token da API do Figma está configurado em `C:/Users/Leo/.gemini/config/mcp_config.json` (`mcpServers.figma.env.FIGMA_API_KEY`).
   - O `fileKey` do projeto no Figma é `IrxLRT7xxR4HuImDxYvHjr`.
   - Basta consultar `https://api.figma.com/v1/files/IrxLRT7xxR4HuImDxYvHjr/nodes?ids=2063:2,2063:29,2063:84,2063:122` e `https://api.figma.com/v1/images/IrxLRT7xxR4HuImDxYvHjr?ids=...&format=png&scale=2` para obter cores exatas, tipografia, paddings e imagens de referência.

3. **Regras Gerais do Repositório**:
   - **Nunca editar migrations SQL já aplicadas** (`001` a `009`); se precisar alterar o schema, criar `010_*.sql`.
   - Preservar o arquivo `src/mobile/Venha para a FECAP!.txt`.
   - Validar sempre com `cd src/backend && npm test` e `git diff --check`.

---

## 5. Comandos Úteis

```powershell
# Subir ou atualizar Banco (PostGIS :5433) + API (:3000) via Docker
docker compose up -d --build

# Rodar testes do Backend
cd src/backend
npm test

# Rodar Frontend Web / Dashboard B2B (Vite :5173)
cd src/frontend
npm run dev

# Rodar App Mobile (Expo :8081)
cd src/mobile
npx expo start --web
```
