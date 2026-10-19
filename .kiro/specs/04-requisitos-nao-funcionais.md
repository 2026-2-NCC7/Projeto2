# 04. Requisitos Não-Funcionais

**Versão:** 1.0  
**Responsável:** Arquiteto de Software  
**Status:** Draft

---

## 1. Performance

### RNF-020: Carregamento Inicial
**Prioridade:** Alta  
**Descrição:** Web App [DEVE] carregar em <3s (p95) em 4G.

**Critérios de Mensuração:**
- Lighthouse Performance Score >90
- First Contentful Paint <1.5s
- Time to Interactive <3s
- Total Bundle Size <500KB (gzipped)

---

### RNF-028: Cálculo de Rota
**Prioridade:** Alta  
**Descrição:** Roteirização [DEVE] calcular em <2s para 50 itens (p99).

**Critérios de Mensuração:**
- Testes de carga com K6
- p50: <500ms
- p95: <1.5s
- p99: <2s

---

### RNF-029: Busca de Produtos
**Prioridade:** Média  
**Descrição:** Busca [DEVE] retornar resultados em <300ms (p95).

**Critérios de Mensuração:**
- Full-text search PostgreSQL
- Índice GIN em nome/marca/categoria
- Cache Redis (TTL 10min)

---

## 2. Escalabilidade

### RNF-030: Throughput da API
**Prioridade:** Alta  
**Descrição:** API [DEVE] suportar >1000 req/s.

**Critérios de Mensuração:**
- Load test K6: 1000 VUs durante 5min
- Error rate <1%
- Auto-scaling horizontal (2-10 containers)

---

### RNF-031: Crescimento de Dados
**Prioridade:** Média  
**Descrição:** Banco [DEVE] suportar até 1M eventos/dia.

**Estratégia:**
- Particionamento de tabela `events` por data
- Retenção: 90 dias online, >90 dias em cold storage

---

## 3. Disponibilidade

### RNF-032: Uptime
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] ter 99.5% uptime (excluindo manutenções).

**Implementação:**
- Multi-AZ deployment
- Health checks a cada 30s
- Rollback automático em falha

---

### RNF-033: Disaster Recovery
**Prioridade:** Alta  
**Descrição:** RTO=1h, RPO=5min.

**Implementação:**
- Backup diário completo
- WAL contínuo (PostgreSQL)
- Restore testado mensalmente

---

## 4. Segurança

### RNF-034: HTTPS Obrigatório
**Prioridade:** Alta  
**Descrição:** Todo tráfego [DEVE] ser TLS 1.3.

---

### RNF-035: Rate Limiting
**Prioridade:** Alta  
**Descrição:** API [DEVE] limitar 100 req/min por IP.

---

### RNF-036: OWASP Top 10
**Prioridade:** Alta  
**Descrição:** Mitigar OWASP Top 10 2021.

**Ver:** [16-seguranca.md](./16-seguranca.md)

---

## 5. Usabilidade

### RNF-037: Mobile-First
**Prioridade:** Alta  
**Descrição:** UI otimizada para telas 360px+.

---

### RNF-038: Acessibilidade WCAG 2.1 AA
**Prioridade:** Média  
**Descrição:** Conformidade parcial WCAG 2.1 nível AA.

**Prioridades:**
- Contraste mínimo 4.5:1
- Tamanho mínimo de toque: 44x44px
- Navegação por teclado

---

## 6. Compatibilidade

### RNF-039: Navegadores Suportados
**Prioridade:** Alta  
**Descrição:** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+.

---

## 7. Manutenibilidade

### RNF-040: Cobertura de Testes
**Prioridade:** Média  
**Descrição:** Cobertura >70% (unit + integration).

---

### RNF-041: Documentação
**Prioridade:** Média  
**Descrição:** OpenAPI atualizado, README completo.

---

## 8. Compliance

### RNF-042: LGPD
**Prioridade:** Alta  
**Descrição:** Conformidade com Lei 13.709/2018.

**Ver:** [17-lgpd-privacidade.md](./17-lgpd-privacidade.md)

---

**Anterior:** [03. Requisitos Funcionais](./03-requisitos-funcionais.md)  
**Próximo:** [05. Regras de Negócio](./05-regras-negocio.md)
