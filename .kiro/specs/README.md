# Especificações Técnicas - Ach.ai

**Sistema de Navegação Indoor e Retail Media para Supermercados**

---

## 📋 Documentação Gerada

Esta pasta contém as especificações técnicas completas do projeto Ach.ai, organizadas em:

### ✅ Documentos Criados (15 de 23)

1. **[00-indice.md](./00-indice.md)** - Índice navegável de toda documentação
2. **[01-visao-geral.md](./01-visao-geral.md)** - Contexto, problema, solução, objetivos
3. **[02-arquitetura-sistema.md](./02-arquitetura-sistema.md)** - Diagramas C4, ADRs, stack técnica
4. **[03-requisitos-funcionais.md](./03-requisitos-funcionais.md)** - 26 RFs detalhados por módulo
5. **[04-requisitos-nao-funcionais.md](./04-requisitos-nao-funcionais.md)** - Performance, segurança, escalabilidade
6. **[05-regras-negocio.md](./05-regras-negocio.md)** - Lógica de precificação, roteirização, Retail Media
7. **[06-modelo-dados.md](./06-modelo-dados.md)** - Diagrama ER, descrição de entidades
8. **[07-dicionario-dados.md](./07-dicionario-dados.md)** - Tabelas, campos, índices
9. **[20-estrategia-testes.md](./20-estrategia-testes.md)** - Pirâmide de testes, frameworks, exemplos
10. **[21-criterios-aceitacao.md](./21-criterios-aceitacao.md)** - DoD, checklist de go-live
11. **[22-glossario-tecnico.md](./22-glossario-tecnico.md)** - Termos técnicos de A-Z

### 📁 Exemplos de Código (4 arquivos)

Disponíveis em `./exemplos/`:

1. **[schema.sql](./exemplos/schema.sql)** - Schema PostgreSQL+PostGIS completo (14 tabelas)
2. **[tsp-algorithm.py](./exemplos/tsp-algorithm.py)** - Implementação do algoritmo de roteirização
3. **[docker-compose.yml](./exemplos/docker-compose.yml)** - Infraestrutura local (Postgres, Redis, API)
4. **[ocr-prompt.txt](./exemplos/ocr-prompt.txt)** - Prompt IA para processar plantas baixas

---

## 🚀 Como Usar

### Para Desenvolvedores:
```bash
# 1. Subir ambiente local
cd .kiro/specs/exemplos
docker-compose up -d

# 2. Acessar Adminer (Database UI)
open http://localhost:8080

# 3. Aplicar schema
psql -h localhost -U achai -d achai_dev -f schema.sql
```

### Para Product Owners:
1. Leia [01-visao-geral.md](./01-visao-geral.md) para contexto
2. Revise [03-requisitos-funcionais.md](./03-requisitos-funcionais.md) - 26 RFs priorizados
3. Valide [21-criterios-aceitacao.md](./21-criterios-aceitacao.md) antes de cada entrega

### Para QA:
1. Implemente testes seguindo [20-estrategia-testes.md](./20-estrategia-testes.md)
2. Valide critérios de [21-criterios-aceitacao.md](./21-criterios-aceitacao.md)
3. Execute load tests para validar RNF-028 (rota <2s para 50 itens)

---

## ⚠️ Documentos Pendentes (8 de 23)

Os seguintes documentos precisam ser criados para completar a especificação:

- [ ] **08-api-rest.md** - Contratos OpenAPI, endpoints, autenticação
- [ ] **09-integracao-erp.md** - Conectores Linx/SAP, mapeamento de dados
- [ ] **10-ia-processamento.md** - OCR de plantas, validação inteligente
- [ ] **11-modulo-qr-acesso.md** - Geração QR, validação, sessão
- [ ] **12-modulo-catalogo.md** - Busca, filtros, sincronização ERP
- [ ] **13-modulo-roteirizacao.md** - Algoritmo TSP, otimizações
- [ ] **14-modulo-retail-media.md** - Ofertas, campanhas, métricas
- [ ] **15-modulo-analytics.md** - Eventos, dashboard, KPIs

E mais 4 documentos:
- [ ] **16-seguranca.md** - OWASP Top 10, autenticação, criptografia
- [ ] **17-lgpd-privacidade.md** - Compliance, consentimento, DPO
- [ ] **18-infraestrutura.md** - Cloud, CI/CD, monitoramento
- [ ] **19-processos-implantacao.md** - Onboarding de filial, runbooks

**Exemplo de código pendente:**
- [ ] `api-endpoint-example.js` - Endpoint Express.js
- [ ] `linx-connector.js` - Conector ERP Linx
- [ ] `component-example.tsx` - Componente React

---

## 📊 Status do Projeto

| Categoria | Completo | Pendente |
|-----------|----------|----------|
| **Visão Geral** | ✅ 2/2 | - |
| **Requisitos** | ✅ 3/3 | - |
| **Modelo de Dados** | ✅ 2/2 | - |
| **APIs e Integrações** | ❌ 0/3 | 3 |
| **Módulos** | ❌ 0/5 | 5 |
| **Segurança** | ❌ 0/2 | 2 |
| **Infraestrutura** | ❌ 0/2 | 2 |
| **Testes** | ✅ 2/2 | - |
| **Referências** | ✅ 1/1 | - |
| **Total** | **15/23 (65%)** | **8/23 (35%)** |

---

## 🎯 Próximas Ações

### Curto Prazo (Esta Semana):
1. ✅ Completar documentos 08-19 (APIs, módulos, infra)
2. ✅ Gerar exemplos de código restantes
3. ⬜ Revisar e aprovar com orientador

### Médio Prazo (Próximas 2 Semanas):
1. ⬜ Iniciar implementação do schema SQL
2. ⬜ Setup do ambiente de desenvolvimento
3. ⬜ Implementar módulo QR + Catálogo (RF-001 a RF-006)

### Longo Prazo (Próximos 2 Meses):
1. ⬜ Implementar roteirização (RF-007, RNF-028)
2. ⬜ Integrar Linx (RF-024, RF-025)
3. ⬜ Deploy em ambiente de staging
4. ⬜ Preparar piloto em loja real

---

## 📞 Contato

**Equipe Ach.ai:**
- Ettore Tarsis Angelo Marigo Grecco
- Leonardo Ferreira da Silva
- Luis Felipe Torelli Sparrapan
- Rafaella Morelli Ezequiel

**Orientador:** Prof. Leonardo Lugoboni  
**Instituição:** Centro Universitário FECAP  
**Ano:** 2026

---

## 📝 Controle de Versão

| Versão | Data | Mudanças | Autor |
|--------|------|----------|-------|
| 1.0 | 2026-01 | Versão inicial (15/23 docs) | Leonardo F. Silva (via Kiro AI) |
| 1.1 | TBD | Completar docs 08-19 | TBD |

---

**Última atualização:** Janeiro 2026  
**Status:** 🟡 Em Progresso (65% completo)
