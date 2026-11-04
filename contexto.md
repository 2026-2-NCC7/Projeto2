# Contexto de Continuidade — Ecossistema Ach.ai

> **Status:** Todas as 3 partes do ecossistema Ach.ai estão **PUBLICADAS, TESTADAS E 100% OPERACIONAIS EM PRODUÇÃO**.  
> **Data de Atualização:** 2026-11-04 (deploy concluído com sucesso via Railway e Vercel, sem marcas d'água).

---

## 1. URLs e Status dos Serviços em Produção

| Aplicação | Hospedagem / Plataforma | URL Oficial de Produção | Status |
| :--- | :--- | :--- | :--- |
| **Backend API** (`src/backend`) | **Railway** (Web Service Node.js contínuo) | [https://achai-api-production.up.railway.app](https://achai-api-production.up.railway.app) | **Online (200 OK)** · Conectado ao Supabase PostGIS |
| **WebApp QR Code** (`src/webapp`) | **Vercel** (Vite + React 19) | [https://achai-webapp.vercel.app](https://achai-webapp.vercel.app) | **Online (200 OK)** · Sem marcas d'água · Roteamento SPA |
| **Mobile Web** (`src/mobile`) | **Vercel** (Expo React Native Web) | [https://achai-mobile.vercel.app](https://achai-mobile.vercel.app) | **Online (200 OK)** · Sem marcas d'água · Interface Renderizada |
| **Mobile Android** (`src/mobile`) | **Expo EAS** (Build APK/AAB) | `eas build -p android --profile preview` | Pronto para geração de instalador |

---

## 2. Visão Geral da Arquitetura em Produção

```
                       ┌──────────────────────────────────────────┐
                       │          Railway Web Service             │
                       │           src/backend (API)              │
                       │   Node.js 20 (node:http) + pg.Pool       │
                       │ achai-api-production.up.railway.app      │
                       └──────┬─────────────┬──────────────┬──────┘
                              │             │              │
        ┌─────────────────────┘             │              └─────────────────────┐
        ▼                                   ▼                                    ▼
┌──────────────────────┐         ┌──────────────────────┐             ┌──────────────────────┐
│     Supabase DB      │         │    Vercel Hosting    │             │    Vercel Hosting    │
│  PostgreSQL/PostGIS  │         │  achai-mobile.vercel │             │  achai-webapp.vercel │
│  Tabelas + Migrations│         │         .app         │             │         .app         │
├──────────────────────┤         ├──────────────────────┤             ├──────────────────────┤
│ • Migrations 001-015 │         │ • App Consumidor     │             │ • WebApp QR Code     │
│ • Liberdade & Sakura │         │ • Login / Cadastro   │             │ • Sem login/cadastro │
│ • Rotas & Progresso  │         │ • Minhas Listas      │             │ • Mapa indoor guiado │
│ • Pooler aws-0-us    │         │ • Compra em rota     │             │ • Catálogo e rota    │
└──────────────────────┘         └──────────────────────┘             └──────────────────────┘
```

---

## 3. Resumo Técnico Completo das Ações Realizadas

### 3.1. Resolução do Erro de Inicialização do Mobile Web no Vercel
- **Causa Raiz Identificada via Chrome DevTools Protocol**:
  - O pacote `expo-font` tentava registrar um módulo web através de `registerWebModule(createExpoFontLoader)` no boot do bundle.
  - Na minificação de produção da Vercel/Expo, `createExpoFontLoader.name` era ofuscado, disparando o erro fatal: `Uncaught Error: Module implementation must be a class`, impedindo o `AppRegistry.runApplication` de montar a árvore de componentes.
- **Solução Definitiva**:
  - Criado o loader de fontes condicional [`fontLoader.web.js`](file:///c:/Users/Leo/Projeto2/src/mobile/src/theme/fontLoader.web.js) e [`fontLoader.js`](file:///c:/Users/Leo/Projeto2/src/mobile/src/theme/fontLoader.js). Na Web, o Metro importa o arquivo `.web.js`, eliminando 100% da dependência nativa do `expo-font` no bundle web e carregando as fontes *Inter* e *Rubik* via Google Fonts CDN no CSS. No Android/iOS nativo, as fontes continuam sendo carregadas pelo Expo Font.
  - Normalizadas todas as barras do `index.html`.
  - Validado via navegador headless que o `#root` renderiza completamente a tela de login (`Ach.ai`, inputs de e-mail/senha, botões e navegação).

### 3.2. Correção de CORS no Railway e Resolução de URLs de Produção
- **Causa dos erros de CORS e `loopback` (localhost)**:
  1. O serviço Railway `achai-api` estava configurado sem vinculação de branch, efetuando build automático a partir da branch `main` antiga (que não continha o suporte a wildcard `*` e preflights OPTIONS liberados).
  2. O WebApp chamava `http://localhost:8081` na tela pós-compra [`PurchaseCompletedScreen.jsx`](file:///c:/Users/Leo/Projeto2/src/webapp/src/screens/PurchaseCompletedScreen.jsx) por falta de fallback para o domínio de produção.
  3. O Mobile Web gerava chamadas para `http://localhost:3000` em [`src/mobile/src/config/api.js`](file:///c:/Users/Leo/Projeto2/src/mobile/src/config/api.js) pois o export do Expo Web não herdava a URL de produção dinamicamente quando acessado fora do ambiente de desenvolvimento.
- **Soluções Implementadas e Verificadas**:
  1. **Vinculação da Branch no Railway**: Conectado `achai-api` explicitamente à branch `webapp` (`2026-2-NCC7/Projeto2@webapp`). Deployment realizado com sucesso.
  2. **Headers de CORS Robustos**: Atualizados [`cors.js`](file:///c:/Users/Leo/Projeto2/src/backend/src/middlewares/cors.js), [`app.js`](file:///c:/Users/Leo/Projeto2/src/backend/src/app.js) e [`http.js`](file:///c:/Users/Leo/Projeto2/src/backend/src/utils/http.js) para responder requisições `OPTIONS` (preflight) com 204 e os cabeçalhos `Access-Control-Allow-Origin: <origin>`, `Access-Control-Allow-Methods` e `Access-Control-Allow-Headers`.
  3. **Fallback Automático de API no Mobile**: Atualizado [`src/mobile/src/config/api.js`](file:///c:/Users/Leo/Projeto2/src/mobile/src/config/api.js) para que qualquer acesso web fora de `localhost` direcione automaticamente para `https://achai-api-production.up.railway.app`. Adicionado prefixo `https://achai-mobile.vercel.app` ao linking do [`App.jsx`](file:///c:/Users/Leo/Projeto2/src/mobile/App.jsx).
  4. **Link do Mobile no WebApp**: Corrigido o botão de download/acesso ao app em [`PurchaseCompletedScreen.jsx`](file:///c:/Users/Leo/Projeto2/src/webapp/src/screens/PurchaseCompletedScreen.jsx) para apontar para `https://achai-mobile.vercel.app`.
  5. **Re-deploy completo**: WebApp e Mobile re-exportados e publicados na Vercel com testes de navegação e login validados via CDP.

### 3.2. Deploy do Backend no Railway
- **Projeto Railway**: `achai-backend` (ID: `65b6b97a-2b25-4cd0-af05-261f83a1099e`)
- **Serviço**: `achai-api` (ID: `ad58ef17-4f36-45c7-9475-96a02f3a0626`)
- **Configuração no Railway**:
  - `rootDirectory`: `/src/backend`
  - `startCommand`: `npm start` (executa `node scripts/migrate.js && node src/server.js`)
  - `healthcheckPath`: `/health`
  - `watchPatterns`: `["/src/backend/**"]`
  - Conectado diretamente ao repositório GitHub `2026-2-NCC7/Projeto2` na branch `webapp`.

### 3.3. Deploy do WebApp na Vercel
- **Projeto Vercel**: `achai-webapp` (ID: `prj_ueN9V953TGlt9sPq88XkjrWOxesf`)
- **URL**: `https://achai-webapp.vercel.app`
- **Configuração**:
  - `vercel.json` com regra de reescrita SPA (`/(.*)` $\rightarrow$ `/index.html`)
  - `.env.production` configurado com `VITE_API_BASE_URL=https://achai-api-production.up.railway.app`
  - Módulo `src/webapp/src/shared/indoor-map-engine.js` encapsulado.
  - SSO/Deployment Protection desativado (totalmente público).

### 3.4. Deploy do Mobile Web na Vercel
- **Projeto Vercel**: `achai-mobile` (ID: `prj_Rw6oFLU8cjgz6ctSFHm6gDYtG21L`)
- **URL**: `https://achai-mobile.vercel.app`
- **Configuração**:
  - Exportado com `EXPO_PUBLIC_API_URL=https://achai-api-production.up.railway.app npx expo export --platform web`.
  - `vercel.json` configurado para roteamento SPA sem perda de rotas ao recarregar.
  - SSO/Deployment Protection desativado (totalmente público).

---

## 4. Como gerar o APK do App Mobile Android

Para gerar o aplicativo nativo Android (.apk) para testes em celular físico ou emulação:

1. Instalar o EAS CLI (caso não tenha):
   ```bash
   npm install -g eas-cli
   ```
2. Fazer login na conta Expo:
   ```bash
   cd src/mobile
   eas login
   ```
3. Executar o build direto do APK:
   ```bash
   eas build -p android --profile preview
   ```
   *(O arquivo `.env.production` com `EXPO_PUBLIC_API_URL=https://achai-api-production.up.railway.app` já está configurado e pronto para o EAS).*

---

## 5. Repositório e Branches

- **Repositório Git**: `https://github.com/2026-2-NCC7/Projeto2.git`
- **Branch Ativa**: `webapp`
- **Pull Request Aberto para `develop`**: [PR #34](https://github.com/2026-2-NCC7/Projeto2/pull/34)
