# 21. Critérios de Aceitação

**Versão:** 1.0  
**Responsável:** Product Owner + QA  
**Status:** Draft

---

## 1. Definition of Done (DoD) Geral

Para qualquer funcionalidade ser considerada "Done":

- [ ] Código revisado por peer review
- [ ] Testes unitários com cobertura >70%
- [ ] Testes de integração passando
- [ ] Documentação atualizada (README, OpenAPI)
- [ ] Deploy em ambiente de staging bem-sucedido
- [ ] Aprovação do PO após demo
- [ ] Sem bugs críticos ou bloqueadores

---

## 2. Critérios por Módulo

### 2.1 Módulo QR Code

**Feature:** RF-001 - Gerar QR Code por Filial

**Critérios de Aceitação:**
- [ ] Admin pode gerar QR via dashboard
- [ ] QR contém UUID da filial no formato `https://app.achai.com.br/f/{uuid}`
- [ ] QR disponível para download em PNG (300x300px mínimo)
- [ ] QR imprimível em A4 com boa qualidade
- [ ] Vários QRs podem ser gerados (impressão em lote)

**Validação:**
- Imprimir QR e escanear com 3 dispositivos diferentes
- Verificar URL gerada no banco de dados
- Confirmar que cada QR é único

---

### 2.2 Módulo Catálogo

**Feature:** RF-003 - Buscar Produtos

**Critérios de Aceitação:**
- [ ] Busca retorna resultados em <300ms (p95)
- [ ] Busca parcial funciona ("mac" encontra "macarrão")
- [ ] Busca ignora acentuação ("acucar" = "açúcar")
- [ ] Resultados ordenados por relevância
- [ ] Exibe disponibilidade em tempo real
- [ ] Máximo 50 resultados por página
- [ ] Indicador visual de "carregando" durante busca

**Validação:**
- Teste com 10 termos de busca comuns
- Medir latência com K6
- Verificar ranking de relevância manualmente

---

### 2.3 Módulo Roteirização

**Feature:** RF-007 - Calcular Rota Otimizada

**Critérios de Aceitação:**
- [ ] Rota calculada em <2s para até 50 produtos (RNF-028)
- [ ] Sequência inicia na entrada e termina no checkout
- [ ] Produtos sem localização excluídos da rota (com aviso)
- [ ] Distância total exibida em metros
- [ ] Tempo estimado exibido em minutos
- [ ] Rota visível no mapa 2D
- [ ] Recalcula automaticamente ao adicionar/remover item

**Validação:**
- Criar lista com 50 produtos e cronometrar cálculo
- Verificar sequência manualmente em mapa da loja
- Comparar distância calculada vs caminho real (tolerância: ±20%)

**Critério de Performance (RNF-028):**
```javascript
// Teste automatizado
it('should calculate route in <2s for 50 items', async () => {
  const products = generateMockProducts(50);
  const start = performance.now();
  const route = await calculateRoute(products);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(2000);
});
```

---

### 2.4 Módulo Retail Media

**Feature:** RF-011 - Exibir Ofertas Contextuais

**Critérios de Aceitação:**
- [ ] Ofertas exibidas apenas em corredores relevantes
- [ ] Máximo 2 ofertas por parada
- [ ] Badge "Promoção" ou "Parceria" visível
- [ ] Preço exibido apenas se autorizado
- [ ] Botão "Adicionar" funcional
- [ ] Registra impressão ao exibir (>50% viewport)
- [ ] Registra clique ao tocar
- [ ] Registra conversão ao adicionar à lista

**Validação:**
- Simular jornada e verificar ofertas exibidas
- Conferir eventos no banco de dados
- Calcular CTR e taxa de conversão

---

### 2.5 Módulo Analytics

**Feature:** RF-017 - Dashboard Operacional

**Critérios de Aceitação:**
- [ ] Dashboard carrega em <5s
- [ ] Exibe total de sessões (dia/semana/mês)
- [ ] Exibe top 10 buscas sem resultado
- [ ] Exibe top 10 produtos "não encontrei"
- [ ] Exibe taxa de conversão de ofertas
- [ ] Filtros por período funcionam
- [ ] Exportação de relatório em CSV

**Validação:**
- Comparar métricas com queries SQL diretas
- Testar filtros com diferentes períodos
- Exportar e validar formato CSV

---

## 3. Critérios de Performance (RNFs)

### RNF-020: Carregamento Inicial

**Critérios:**
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] Lighthouse Performance Score >90
- [ ] Bundle size <500KB (gzipped)

**Validação:**
- Lighthouse em modo incógnito
- Testar em 4G simulado (Chrome DevTools)

---

### RNF-032: Uptime 99.5%

**Critérios:**
- [ ] Sistema disponível 99.5% do mês
- [ ] Health check responde em <100ms
- [ ] Rollback automático em falha de deploy

**Validação:**
- Monitoramento via Pingdom/UptimeRobot
- Simular falha e verificar rollback

---

## 4. Critérios de Segurança

### RNF-035: Rate Limiting

**Critérios:**
- [ ] API limita 100 req/min por IP
- [ ] Retorna HTTP 429 ao ultrapassar
- [ ] Header `X-RateLimit-Remaining` presente

**Validação:**
```bash
# Teste de rate limit
for i in {1..110}; do
  curl -I https://api.achai.com.br/health
done
# Últimas 10 devem retornar 429
```

---

## 5. Critérios de Acessibilidade

### RNF-038: WCAG 2.1 AA

**Critérios:**
- [ ] Contraste mínimo 4.5:1
- [ ] Tamanho de toque mínimo 44x44px
- [ ] Navegação por teclado funcional
- [ ] Alt text em todas as imagens
- [ ] Labels em todos os inputs

**Validação:**
- axe DevTools (Chrome Extension)
- Teste manual com leitor de tela (NVDA/VoiceOver)

---

## 6. Checklist de Go-Live (Produção)

**Antes de liberar para clientes:**

### Funcional
- [ ] Todos os RFs Must Have implementados
- [ ] Testes E2E passando
- [ ] Piloto em 1 loja concluído com sucesso

### Performance
- [ ] RNF-020 (carregamento <3s) validado
- [ ] RNF-028 (rota <2s) validado
- [ ] Load test com 1000 VUs bem-sucedido

### Segurança
- [ ] Scan de vulnerabilidades (OWASP ZAP)
- [ ] HTTPS configurado
- [ ] Rate limiting ativo
- [ ] Logs de auditoria habilitados

### Infraestrutura
- [ ] Backup automático configurado
- [ ] Monitoramento ativo (alertas)
- [ ] Disaster recovery testado
- [ ] Runbook de incidentes documentado

### Compliance
- [ ] LGPD: termos de uso aprovados
- [ ] Política de privacidade publicada
- [ ] Consentimento de cookies implementado

### Operacional
- [ ] Equipe de suporte treinada
- [ ] Documentação completa (admin + cliente)
- [ ] Processo de onboarding de loja testado
- [ ] Plano de rollback definido

---

**Anterior:** [20. Estratégia de Testes](./20-estrategia-testes.md)  
**Próximo:** [22. Glossário Técnico](./22-glossario-tecnico.md)
