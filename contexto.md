# Contexto de Continuidade — Ecossistema Ach.ai

> **Status:** Todas as 3 partes do ecossistema Ach.ai estão **PUBLICADAS E ATIVAS EM PRODUÇÃO**.  
> **Data de Atualização:** 2026-11-04 (deploy concluído com sucesso via Railway e Netlify).

---

## 1. URLs e Status dos Serviços em Produção

| Aplicação | Hospedagem / Plataforma | URL de Produção | Status |
| :--- | :--- | :--- | :--- |
| **Backend API** (`src/backend`) | **Railway** (Web Service Node.js contínuo) | [https://achai-api-production.up.railway.app](https://achai-api-production.up.railway.app) | **Online (200 OK)** · Conectado ao Supabase PostGIS |
| **WebApp QR Code** (`src/webapp`) | **Netlify** (Vite SPA com CDN global) | [https://achai-webapp.netlify.app](https://achai-webapp.netlify.app) | **Online (200 OK)** · Conectado ao Railway API |
| **Mobile Web** (`src/mobile`) | **Netlify** (Expo React Native Web) | [https://achai-mobile.netlify.app](https://achai-mobile.netlify.app) | **Online (200 OK)** · Conectado ao Railway API |
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
│     Supabase DB      │         │    Netlify Hosting   │             │   Netlify Hosting    │
│  PostgreSQL/PostGIS  │         │  achai-mobile.netlify│             │  achai-webapp.netlify│
│  Tabelas + Migrations│         │      .app            │             │        .app          │
├──────────────────────┤         ├──────────────────────┤             ├──────────────────────┤
│ • Migrations 001-015 │         │ • App Consumidor     │             │ • WebApp QR Code     │
│ • Liberdade & Sakura │         │ • Login / Cadastro   │             │ • Sem login/cadastro │
│ • Rotas & Progresso  │         │ • Minhas Listas      │             │ • Mapa indoor guiado │
│ • Pooler aws-0-us    │         │ • Compra em rota     │             │ • Catálogo e rota    │
└──────────────────────┘         └──────────────────────┘             └──────────────────────┘
```

---

## 3. Resumo Técnico Completo das Ações Realizadas

### 3.1. Ajuste de Interface pós-animação (`RouteCompletedScreen.jsx`)
- Corrigido o espaçamento do **Banner Hero Laranja** (`"Hora de ir para o caixa!"`):
  - Aumentada a margem superior de `mt-4` (16px) para `mt-6` (24px) no `<Animated.View>`, eliminando a sensação de elemento "grudado" no cabeçalho padronizado da página.
  - Atualizado fallback do nome da loja de `"Mercado Aurora"` para `"Mercado Liberdade"`.

### 3.2. Deploy do Backend no Railway
- **Projeto Railway**: `achai-backend` (ID: `65b6b97a-2b25-4cd0-af05-261f83a1099e`)
- **Serviço**: `achai-api` (ID: `ad58ef17-4f36-45c7-9475-96a02f3a0626`)
- **Configuração no Railway**:
  - `rootDirectory`: `/src/backend`
  - `startCommand`: `npm start` (executa `node scripts/migrate.js && node src/server.js`)
  - `healthcheckPath`: `/health`
  - `watchPatterns`: `["/src/backend/**"]`
  - Conectado diretamente ao repositório GitHub `2026-2-NCC7/Projeto2` na branch `webapp`.
- **Variáveis de Ambiente Configuradas no Railway**:
  - `DATABASE_URL`: String de conexão ao PostgreSQL do Supabase via pooler (`aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`)
  - `DATABASE_SSL_REJECT_UNAUTHORIZED`: `false`
  - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`
  - `JWT_SECRET`: Chave para emissão de tokens administrativos
  - `FRONTEND_ORIGIN`: `*` (compatível com os domínios Netlify e app móvel)
  - `PASSWORD_RESET_BASE_URL`: `https://achai-mobile.netlify.app`
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`: Configuração de e-mail transacional
  - `PORT`: `3000`
- **Validação de Produção**:
  - Endpoint `/health`: Retorna `{"status":"ok","database":"connected"}`.
  - Endpoint `/stores`: Retorna as filiais ativas (`Mercado Liberdade` e `Supermercado Sakura`).
  - Endpoint `/stores/:id/products`: Retorna catálogo e informações da loja com CORS liberado.

### 3.3. Deploy do WebApp no Netlify
- **Projeto Netlify**: `achai-webapp` (Site ID: `96deb382-d2ef-4805-baa4-9128909b5ac6`)
- **URL**: `https://achai-webapp.netlify.app`
- **Build e Configuração**:
  - `netlify.toml` com regra SPA:
    ```toml
    [build]
      publish = "dist"

    [[redirects]]
      from = "/*"
      to = "/index.html"
      status = 200
    ```
  - `public/_redirects` com fallback `/* /index.html 200`
  - `.env.production` configurado com `VITE_API_BASE_URL=https://achai-api-production.up.railway.app`
  - Módulo `src/webapp/src/shared/indoor-map-engine.js` encapsulado para execução estática sem depender de diretórios externos.

### 3.4. Deploy do Mobile Web no Netlify
- **Projeto Netlify**: `achai-mobile` (Site ID: `11fd5640-b188-41e3-ae0e-ec0f81edc865`)
- **URL**: `https://achai-mobile.netlify.app`
- **Build e Configuração**:
  - Exportado com `EXPO_PUBLIC_API_URL=https://achai-api-production.up.railway.app npx expo export --platform web`.
  - `netlify.toml` e `dist/_redirects` configurados para roteamento SPA sem perda de rotas ao recarregar.

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
- **Último Commit**: Contém todo o setup de deploy para Railway e Netlify, sincronização de rota e arquivos de redirecionamento.
