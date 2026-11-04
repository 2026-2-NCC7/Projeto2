# Ach.ai — Contexto e Arquitetura do Projeto

> **Status Geral do Projeto:** Ecossistema completo **PUBLICADO EM PRODUÇÃO** e operacional (Backend no Railway, WebApp e Mobile na Vercel).  
> **Data:** 2026-11-04  
> **Repositório:** `https://github.com/2026-2-NCC7/Projeto2.git` (`branch: webapp`) · **PR #34** para `develop`

---

## 1. Ambientes e URLs em Produção

| Componente | Hospedagem | URL Oficial | Teste de Conexão |
| :--- | :--- | :--- | :--- |
| **Backend API** | **Railway** (Node.js Contínuo) | [https://achai-api-production.up.railway.app](https://achai-api-production.up.railway.app) | `GET /health` $\rightarrow$ 200 OK (`database: connected`) |
| **WebApp QR Code** | **Vercel** (Vite + React 19) | [https://achai-webapp.vercel.app](https://achai-webapp.vercel.app) | 200 OK (com rewrites SPA e sem marcas d'água) |
| **Mobile App (Web)** | **Vercel** (Expo React Native Web) | [https://achai-mobile.vercel.app](https://achai-mobile.vercel.app) | 200 OK (com rewrites SPA e sem marcas d'água) |
| **Banco de Dados** | **Supabase** (PostgreSQL + PostGIS) | Região `aws-0-us-east-1` | Migrations `001` a `015` aplicadas |

---

## 2. Estrutura do Ecossistema

- **`src/backend`**:
  - Servidor HTTP nativo Node.js com pooling persistente (`pg.Pool`).
  - Executa migrações automáticas no boot: `node scripts/migrate.js && node src/server.js`.
  - Cálculo de menor caminho indoor com algoritmo de Dijkstra integrado a PostGIS.
  - Sincronização em tempo real de status de lista e rotas (`rota_em_andamento`, `coletado`, `nao_encontrado`).

- **`src/webapp`**:
  - Aplicação sem necessidade de login para quem escaneia o QR Code na entrada da loja física.
  - Catálogo de produtos, modal de seleção de filiais ativas, visualização indoor da rota e incentivo para download do app completo.

- **`src/mobile`**:
  - App do consumidor construído em React Native e Expo.
  - Autenticação e cadastro com perfil do usuário.
  - Gestão de listas de compras personalizadas com seleção de ícone emoji e filial associada.
  - Modo rota com contagem dinâmica de produtos coletados, mapa indoor e tela de finalização de rota com comemoração animada.

---

## 3. Resumo das Últimas Entregas

1. **Ajuste Visual Pós-Finalização de Compra (`RouteCompletedScreen.jsx`)**:
   - Adicionada margem superior (`mt-6` / 24px) no card de encerramento da jornada (*"Hora de ir para o caixa!"*), eliminando o aspecto de elemento colado ao cabeçalho.
2. **Deploy do Backend no Railway**:
   - Provisionado projeto `achai-backend` e serviço `achai-api`.
   - 13 variáveis de ambiente integradas ao Supabase.
   - Domínio SSL gerado e testado com sucesso.
3. **Deploy dos Frontends na Vercel**:
   - `achai-webapp` e `achai-mobile` publicados na Vercel sem marca d'água ou barra de feedback.
   - Regras de roteamento SPA via `vercel.json` configuradas.
   - Apontamentos de produção para a API do Railway validados.
