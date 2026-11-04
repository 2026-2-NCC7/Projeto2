# Contexto de Continuidade — Ecossistema Ach.ai

> **Documento de passagem de bastão para o próximo chat / agente.**  
> **Objetivo da próxima sessão:** Publicar em produção as 3 partes do ecossistema: **Backend**, **WebApp (QR Code)** e **Mobile (App do Consumidor)**.

---

## 1. Visão Geral da Arquitetura

O **Ach.ai** é uma plataforma de navegação indoor e descoberta de produtos para supermercados. O ecossistema é formado por **1 Backend central** conectado a **3 aplicações clientes**:

```
                       ┌──────────────────────────────────────────┐
                       │            src/backend (API)             │
                       │   Node.js 20 (node:http) + PostgreSQL    │
                       │           PostGIS no Supabase            │
                       │          http://localhost:3000           │
                       └──────┬─────────────┬──────────────┬──────┘
                              │             │              │
        ┌─────────────────────┘             │              └─────────────────────┐
        ▼                                   ▼                                    ▼
┌──────────────────────┐         ┌──────────────────────┐             ┌──────────────────────┐
│     src/frontend     │         │      src/mobile      │             │      src/webapp      │
│   (Dashboard B2B)    │         │  (App Consumidor)    │             │  (WebApp QR Code)    │
│   http://...:5173    │         │   http://...:8081    │             │   http://...:5174    │
├──────────────────────┤         ├──────────────────────┤             ├──────────────────────┤
│ • Portal das lojas   │         │ • React Native / Expo│             │ • React 19 + Vite    │
│ • Login corporativo  │         │ • Login / Cadastro   │             │ • Acesso instantâneo │
│ • Catálogo, preços e │         │ • Mapa de mercados   │             │   por QR na entrada  │
│   gestão de estoque  │         │ • Listas com emoji   │             │ • Sem login/cadastro │
│ • Edição de mapa     │         │ • Rota indoor + QR   │             │ • Rota guiada indoor │
│   e corredores       │         │ • Compra em andamento│             │ • Conversão pro App  │
└──────────────────────┘         └──────────────────────┘             └──────────────────────┘
```

---

## 2. Resumo Técnico Completo das Alterações Realizadas (Última Sessão)

Durante esta sessão, todas as pontas do sistema foram alinhadas e testadas:

### 2.1. Backend (`src/backend`)
- **Migrations 001 a 015 no PostgreSQL (Supabase)**:
  - `012_shopping_list_icon.sql`: adicionou coluna `icone VARCHAR(32)` em `shopping_list` para persistir o emoji escolhido pelo usuário.
  - `013_additional_stores.sql` & `014_remove_aurora_stores.sql`: **removeu as antigas lojas fictícias "Mercado Aurora" e "Mercado Aurora - Centro" do banco de dados**, consolidando apenas as **2 lojas reais cadastradas que aparecem no mapa**:
    1. `00000000-0000-0000-0000-000000000001` — **Mercado Liberdade** (`Av. da Liberdade, 680 · Liberdade · São Paulo · SP`)
    2. `00000000-0000-0000-0000-000000000002` — **Supermercado Sakura** (`Rua São Joaquim, 120 · Liberdade · São Paulo · SP`)
    - Todas as listas pré-existentes (`mês`, `semana`, `bebe`, `produtinhos`) foram preservadas e migradas para o Mercado Liberdade.
  - `015_route_progress.sql`: persistência dinâmica do progresso da rota:
    - `shopping_list.rota_em_andamento BOOLEAN NOT NULL DEFAULT FALSE`
    - `shopping_list_item.coletado BOOLEAN NOT NULL DEFAULT FALSE`
    - `shopping_list_item.nao_encontrado BOOLEAN NOT NULL DEFAULT FALSE`
- **Endpoints Atualizados em `src/backend/src/router.js`**:
  - `GET /stores`: lista as filiais ativas do banco.
  - `PATCH /lists/:listId`: aceita `{ name, emoji, storeId, routeInProgress }`.
  - `PATCH /lists/:listId/items/:productId`: aceita `{ quantity, collected, notFound }` e atualiza automaticamente se a rota ainda está em andamento.
  - `POST /lists/:listId/route`: marca `rota_em_andamento = TRUE` e zera flags anteriores de coleta ao iniciar uma nova rota.
  - `GET /lists` e `GET /lists/:listId`: retornam `routeInProgress`, `collectedCount`, `notFoundCount` diretamente do banco.
- **Suíte de Testes**:
  - **31 testes automatizados passando** (`npm --prefix src/backend test` com 100% de sucesso).

### 2.2. Motor Compartilhado de Mapa Indoor (`src/shared/indoor-map-engine.js` e `src/mobile/src/shared/indoor-map-engine.js`)
- Criado um motor de grafo ortogonal único e reutilizável que alimenta tanto o `/mobile` quanto o `/webapp`:
  - 4 prateleiras compridas bloqueadas (`P1` a `P4`).
  - 5 corredores caminháveis (`C1` a `C5`) com entrada identificada (`ENTRADA`).
  - Algoritmo de **Dijkstra** para cálculo do traçado da rota e reordenação inteligente por proximidade.
  - Suporte a temas visuais:
    - `mobile`: tons neutros e claros (`#F7F7F3`, `#FFFFFF`, `#EDEDE7`).
    - `webapp`: tons quentes e beges (`#FFF7F1`, `#F6E7D7`, `#F2D0A8`).

### 2.3. Mobile (`src/mobile`)
1. **Regra de Seleção de Produtos no MVP**: botão `+` adiciona 1 unidade do produto à lista e fica desabilitado (`disabled`) se o item já foi adicionado; botão `-` remove o produto da lista.
2. **Criação e Edição de Listas**:
   - Respeita o emoji selecionado e salva no banco.
   - Redireciona para `ListCreatedScreen.jsx` (Figma `2245:1912`) após criar/salvar a lista, sem ir direto para a rota.
   - Ao clicar no lápis ou em `+ Adicionar` em `SavedListDetailsScreen.jsx`, abre `CreateListScreen.jsx` em modo de edição (**"Editar lista"** / **"Editar lista com X itens"**) e sincroniza remoções/adições com o backend.
   - Link em texto vermelho sublinhado **"Excluir lista"** adicionado abaixo de *"Iniciar rota na loja"*.
3. **Splash Screen Animada Laranja (Estilo Itaú) + Pós-Compra (`RouteCompletedScreen.jsx`)**:
   - Splash animada laranja (`#F26900`) com moedas, sacolas, checks e brilhos subindo ao completar a rota, seguida pela tela de resumo pós-compra padronizada com margens adequadas (`px-5`).
4. **Compra em Andamento Dinâmica na Home (`HomeScreen.jsx`)**:
   - Sincronizada tanto com o LocalStorage quanto com o backend (`rota_em_andamento`, `coletado`, `nao_encontrado`).
   - Atualiza em tempo real a quantidade de itens coletados e restantes.
   - **Some automaticamente da Home assim que o último item é coletado ou a rota é concluída.**
5. **Headers Padronizados**:
   - `HomeScreen`, `CatalogScreen`, `MyListsScreen` e `ProfileScreen` utilizam rigorosamente o mesmo padrão de espaçamento (`px-5`, `paddingTop: insets.top + 20`), tipografia e alinhamento, com a seta `<` removida de *Minhas listas*.

### 2.4. WebApp (`src/webapp`)
1. **Modal de Supermercados**: visual completamente reestilizado com a identidade visual do Ach.ai (cards verticais em `#FFFFFF`/`#FFF1E8`, bordas `#F2D3C1`, ícone e radio button laranja).
2. **Sincronização com o Backend**: busca lojas cadastradas via `GET /stores` e atualiza a rota com base na loja selecionada.
3. **Consumo do motor compartilhado de mapa indoor** com tema quente/bege.

---

## 3. GUIA COMPLETO PARA O PRÓXIMO CHAT: Publicação / Deploy das 3 Partes

O próximo chat deve seguir este roteiro de publicação:

```
ETAPA 1: Deploy do Backend (Render / Railway / Fly.io)
    ↓
ETAPA 2: Deploy do WebApp (Vercel ou Netlify)
    ↓
ETAPA 3: Deploy do Mobile Web (Vercel / Netlify / EAS)
    ↓
ETAPA 4: Configuração final do CORS com as URLs públicas geradas
```

---

### ETAPA 1: Publicação do Backend (`src/backend`)

**Recomendação de Plataforma:** **Render** (Web Service gratuito/pago) ou **Railway**.

1. **Configurações do Serviço**:
   - **Root Directory**: `src/backend`
   - **Build Command**: `npm install && npm run migrate`
   - **Start Command**: `node src/server.js`
   - **Node Version**: `20.x`
2. **Variáveis de Ambiente de Produção**:
   | Variável | Valor / Instrução |
   | :--- | :--- |
   | `DATABASE_URL` | String de conexão do pooler do Supabase (ex: `postgresql://postgres.[REF]:[SENHA]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`) |
   | `DATABASE_SSL_REJECT_UNAUTHORIZED` | `true` |
   | `JWT_SECRET` | String segura aleatória com mais de 32 caracteres |
   | `PORT` | `3000` (ou atribuída automaticamente pela plataforma) |
   | `FRONTEND_ORIGIN` | Inicialmente `*` ou as URLs locais, depois atualizada com as URLs de produção do WebApp e Mobile |
   | `RESEND_API_KEY` | (Opcional) Chave Resend para disparo de e-mails de redefinição de senha |
   | `RESEND_FROM_EMAIL` | `Ach.ai <onboarding@resend.dev>` |
3. **Verificação de Sucesso**:
   - Acesse `https://<url-do-backend>/health` → deve retornar `{ "status": "ok" }`.
   - Acesse `https://<url-do-backend>/stores` → deve retornar as 2 lojas cadastradas (`Mercado Liberdade` e `Supermercado Sakura`).

---

### ETAPA 2: Publicação do WebApp (`src/webapp`)

**Recomendação de Plataforma:** **Vercel** ou **Netlify**.

1. **Configurações do Projeto**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `src/webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
2. **Variáveis de Ambiente**:
   | Variável | Valor |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://<url-do-backend-publicado>` |
3. **Configuração de Roteamento SPA (se necessário)**:
   - Se for na Vercel, criar `src/webapp/vercel.json`:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - Se for no Netlify, criar `src/webapp/_redirects`:
     ```
     /*    /index.html   200
     ```
4. **Verificação de Sucesso**:
   - Abrir `https://<url-do-webapp>/?storeId=00000000-0000-0000-0000-000000000001`
   - Testar o fluxo completo: Entrada QR → Buscar Produtos → Minha Lista → Gerar Rota → Compra Concluída.

---

### ETAPA 3: Publicação do Mobile (`src/mobile`)

O Mobile possui duas vias de publicação:

#### Opção A: Versão Web do Mobile (Instantânea via Vercel/Netlify)
1. **Configurações do Projeto**:
   - **Root Directory**: `src/mobile`
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
2. **Variáveis de Ambiente**:
   | Variável | Valor |
   | :--- | :--- |
   | `EXPO_PUBLIC_API_URL` | `https://<url-do-backend-publicado>` |
3. **Configuração de Roteamento SPA**:
   - Vercel `vercel.json` ou Netlify `_redirects` apontando `/*` para `/index.html`.

#### Opção B: Build Nativo / Expo Go (EAS)
1. Instalar CLI do EAS: `npm install -g eas-cli`
2. Login no Expo: `eas login`
3. Configurar projeto: `eas build:configure`
4. Publicar atualização OTA: `eas update` ou gerar APK Android com `eas build --platform android --profile preview`.

---

### ETAPA 4: Atualização Final do CORS no Backend

Após obter as URLs de produção do WebApp e do Mobile, atualizar a variável `FRONTEND_ORIGIN` no serviço do Backend:

```env
FRONTEND_ORIGIN=https://<url-webapp>.vercel.app,https://<url-mobile>.vercel.app,http://localhost:5173,http://localhost:5174,http://localhost:8081
```

Isso garante que todas as chamadas `GET`, `POST`, `PATCH`, `DELETE` e `OPTIONS` funcionem sem bloqueio de segurança no navegador.

---

## 4. Comandos de Validação Local (Cheat Sheet)

```powershell
# 1. Backend (Migrations + Testes Automatizados)
cd src/backend
npm run migrate
npm test

# 2. WebApp (Build de Produção do Vite)
cd ../webapp
npm run build

# 3. Mobile (Exportação Web de Produção do Expo)
cd ../mobile
npx expo export --platform web
```
