# 05. Regras de Negócio

**Versão:** 1.0  
**Responsável:** Product Owner  
**Status:** Draft

---

## 1. Regras de Precificação

### RN-001: Exibição de Preço Restrita
**Contexto:** Apenas itens em promoção ou com parceria ativa exibem preço.

**Justificativa:** Evitar conflitos com política de precificação do supermercado.

**Implementação:**
```javascript
function shouldDisplayPrice(product) {
  return product.is_promo || product.has_partnership;
}
```

---

### RN-002: Badge de Identificação
**Contexto:** Produtos com preço exibem badge "Promoção" ou "Parceria".

**Valores possíveis:**
- `promo`: Promoção interna do supermercado
- `partner`: Parceria Ach.ai (Retail Media)

---

## 2. Regras de Roteirização

### RN-003: Sequência de Paradas
**Contexto:** Rota sempre inicia na entrada e termina no checkout.

**Fluxo:**
1. Entrada
2. Produtos ordenados por proximidade (TSP)
3. Checkout

---

### RN-004: Produtos Sem Localização
**Contexto:** Produtos sem coordenadas não entram na rota.

**Comportamento:**
- Permanecem na lista de compras
- Marcados com ⚠️ "Localização não cadastrada"
- Não afetam cálculo de distância

---

### RN-005: Recálculo Automático
**Contexto:** Rota recalcula ao adicionar/remover item.

**Exceções:**
- Não recalcula se >50 itens (alerta ao usuário)
- Não recalcula se item já marcado como "encontrado"

---

## 3. Regras de Retail Media

### RN-006: Complementaridade de Produtos
**Contexto:** Ofertas baseadas em regras fixas de complementaridade.

**Exemplos:**
```javascript
const complementarity = {
  'macarrão': ['molho de tomate', 'queijo ralado'],
  'pão': ['manteiga', 'requeijão'],
  'café': ['leite condensado', 'açúcar']
};
```

---

### RN-007: Limite de Sugestões
**Contexto:** Máximo 2 sugestões por parada.

**Priorização:**
1. Maior margem de contribuição
2. Maior taxa de conversão histórica
3. Menor distância no corredor

---

### RN-008: Registro de Métricas
**Contexto:** Três eventos principais para Retail Media.

**Eventos:**
- **Impressão:** Oferta exibida na tela (>50% viewport)
- **Clique:** Usuário toca na oferta
- **Conversão:** Usuário adiciona à lista

---

## 4. Regras de Disponibilidade

### RN-009: Sincronização de Estoque
**Contexto:** Disponibilidade consultada no ERP a cada 15min.

**Cache:**
- TTL: 10 minutos
- Invalidação: manual via dashboard

---

### RN-010: Fallback de Disponibilidade
**Contexto:** Se ERP offline, assume produto disponível.

**Comportamento:**
- Exibe disclaimer: "Estoque não confirmado"
- Permite adicionar à lista
- Registra evento de fallback

---

## 5. Regras de Analytics

### RN-011: Sessão Anônima
**Contexto:** Sessão iniciada ao escanear QR, sem identificar usuário.

**Dados coletados:**
- UUID de sessão (gerado)
- Filial
- Timestamp início/fim
- User-agent (navegador)
- **NÃO:** IP, CPF, nome, telefone

---

### RN-012: Expiração de Sessão
**Contexto:** Sessão expira após 30min de inatividade.

**Comportamento:**
- Timer resetado a cada interação
- Ao expirar, dados são salvos e sessão fechada
- Novo QR scan inicia nova sessão

---

## 6. Regras de Cadastro

### RN-013: Mapeamento Automático ERP
**Contexto:** Sistema usa atributo de localização do ERP.

**Algoritmo:**
1. Lê `produto.localizacao` do ERP (ex: "Corredor 3")
2. Busca nó no grafo com `nome LIKE '%Corredor 3%'`
3. Vincula produto ao nó
4. Flag `auto_mapped = true`

---

### RN-014: Validação de EAN
**Contexto:** EAN (código de barras) deve ser único por filial.

**Validação:**
- 13 dígitos
- Dígito verificador válido
- Único na base da filial

---

## 7. Regras de Segurança

### RN-015: Rate Limiting por IP
**Contexto:** Limitar abuso de API pública.

**Limites:**
- 100 req/min para endpoints públicos
- 1000 req/min para endpoints autenticados
- Ban temporário (10min) após 3 violações

---

### RN-016: Sanitização de Input
**Contexto:** Todo input de usuário deve ser validado.

**Implementação:** Zod schemas + regex whitelist

---

**Anterior:** [04. Requisitos Não-Funcionais](./04-requisitos-nao-funcionais.md)  
**Próximo:** [06. Modelo de Dados](./06-modelo-dados.md)
