# 03. Requisitos Funcionais

**Versão:** 1.0  
**Responsável:** Product Owner  
**Status:** Draft  
**Dependências:** [01-visao-geral.md](./01-visao-geral.md)

---

## 1. Módulo: Acesso via QR Code

### RF-001: Gerar QR Code por Filial
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] gerar QR Code único por filial que identifica loja e abre Web App.

**Critérios de Aceitação:**
- [ ] QR Code contém ID único da filial (UUID)
- [ ] URL gerada inclui parâmetro `?filial={uuid}`
- [ ] QR Code é gerado em PNG/SVG para impressão
- [ ] Expiração configurável (padrão: sem expiração)

**Regras de Negócio:**
- RN-001: Um QR Code por carrinho ou entrada da loja
- RN-002: QR Code redireciona para `https://app.achai.com.br/f/{uuid}`

---

### RF-002: Validar QR Code Escaneado
**Prioridade:** Alta  
**Descrição:** Web App [DEVE] validar QR Code e carregar contexto da filial.

**Critérios de Aceitação:**
- [ ] Verifica se UUID existe no banco
- [ ] Retorna erro 404 se filial não encontrada
- [ ] Carrega nome, endereço e logo da filial
- [ ] Inicia sessão anônima

---

## 2. Módulo: Catálogo e Busca

### RF-003: Buscar Produtos no Catálogo
**Prioridade:** Alta  
**Descrição:** Cliente [DEVE] poder buscar produtos por nome, marca ou categoria.

**Critérios de Aceitação:**
- [ ] Busca retorna resultados em <300ms (p95)
- [ ] Suporta busca parcial ("arr" encontra "arroz")
- [ ] Ordena por relevância (nome > marca > categoria)
- [ ] Exibe disponibilidade em tempo real (estoque>0)
- [ ] Máximo 50 resultados por página

**Regras de Negócio:**
- RN-003: Produtos sem estoque aparecem acinzentados
- RN-004: Produtos sem localização cadastrada não entram na rota

---

### RF-004: Exibir Detalhes do Produto
**Prioridade:** Média  
**Descrição:** Cliente [PODE] ver detalhes como preço, marca, categoria.

**Critérios de Aceitação:**
- [ ] Preço exibido apenas se item em promoção OU com parceria ativa
- [ ] Badge "Promoção" ou "Parceria" visível
- [ ] Localização no formato "Corredor 3, Prateleira 2"
- [ ] Disponibilidade: "Em estoque" ou "Sem estoque"

---

### RF-005: Adicionar Item à Lista
**Prioridade:** Alta  
**Descrição:** Cliente [DEVE] poder adicionar produtos à lista de compras.

**Critérios de Aceitação:**
- [ ] Botão "Adicionar" visível em cada produto
- [ ] Feedback visual imediato (botão muda para "Adicionado ✓")
- [ ] Contador de itens na lista atualiza em tempo real
- [ ] Limite de 100 itens por lista

---

### RF-006: Remover Item da Lista
**Prioridade:** Alta  
**Descrição:** Cliente [DEVE] poder remover produtos da lista.

**Critérios de Aceitação:**
- [ ] Botão "Remover" visível em lista de compras
- [ ] Confirmação visual antes de remover
- [ ] Lista recalcula automaticamente após remoção

---

## 3. Módulo: Roteirização

### RF-007: Calcular Rota Otimizada
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] calcular menor caminho entre entrada, produtos e checkout.

**Critérios de Aceitação:**
- [ ] Algoritmo TSP (heurística vizinho mais próximo)
- [ ] Calcula em <2s para até 50 itens (RNF-028)
- [ ] Retorna sequência ordenada de paradas
- [ ] Inclui distância estimada em metros
- [ ] Tempo estimado em minutos

**Regras de Negócio:**
- RN-005: Rota começa na entrada e termina no checkout
- RN-006: Produtos sem localização ficam fora da rota
- RN-007: Recalcula rota se item for removido da lista

---

### RF-008: Exibir Mapa Visual da Rota
**Prioridade:** Alta  
**Descrição:** Cliente [DEVE] ver mapa 2D com rota desenhada.

**Critérios de Aceitação:**
- [ ] Mapa SVG com corredores da loja
- [ ] Linha de rota conectando paradas
- [ ] Numeração sequencial (1, 2, 3...)
- [ ] Zoom e pan habilitados
- [ ] Destaque visual da próxima parada

---

### RF-009: Marcar Item Como Encontrado
**Prioridade:** Alta  
**Descrição:** Cliente [DEVE] poder marcar itens encontrados durante a compra.

**Critérios de Aceitação:**
- [ ] Checkbox ao lado de cada item na lista
- [ ] Marca item como concluído (strikethrough)
- [ ] Atualiza progresso visual (barra de progresso)
- [ ] Registra timestamp do evento

---

### RF-010: Reportar "Não Encontrei"
**Prioridade:** Média  
**Descrição:** Cliente [PODE] reportar que não encontrou produto.

**Critérios de Aceitação:**
- [ ] Botão "Não encontrei" visível na lista
- [ ] Modal solicita motivo (opcional): "Fora de estoque", "Localização errada", "Outro"
- [ ] Registra evento com filial, produto, timestamp
- [ ] Envia para dashboard operacional

---

## 4. Módulo: Retail Media

### RF-011: Exibir Ofertas Contextuais
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] sugerir produtos complementares durante a rota.

**Critérios de Aceitação:**
- [ ] Sugere itens do mesmo corredor da parada atual
- [ ] Regras de complementaridade (ex: macarrão → molho)
- [ ] Exibe preço se item em promoção/parceria
- [ ] Badge "Sugestão" visível
- [ ] Máximo 2 sugestões por parada

**Regras de Negócio:**
- RN-008: Ofertas baseadas em regras fixas (não ML no MVP)
- RN-009: Preço exibido apenas com autorização

---

### RF-012: Adicionar Oferta à Lista
**Prioridade:** Média  
**Descrição:** Cliente [PODE] adicionar sugestões à lista com um clique.

**Critérios de Aceitação:**
- [ ] Botão "Adicionar" na card de sugestão
- [ ] Item entra na lista e rota recalcula
- [ ] Registra evento de conversão (para analytics)

---

### RF-013: Registrar Impressões e Cliques
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] registrar métricas de Retail Media.

**Critérios de Aceitação:**
- [ ] Impressão: oferta exibida na tela
- [ ] Clique: cliente toca na oferta
- [ ] Conversão: cliente adiciona à lista
- [ ] Timestamp, filial, produto, campanha registrados

---

## 5. Módulo: Analytics Operacional

### RF-014: Registrar Sessão de Uso
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] registrar início e fim da sessão do cliente.

**Critérios de Aceitação:**
- [ ] Sessão inicia ao escanear QR
- [ ] Registra filial, timestamp, user_agent
- [ ] Sessão termina após 30min de inatividade OU ao marcar todos itens
- [ ] Duração total calculada

---

### RF-015: Registrar Buscas
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] registrar todas as buscas realizadas.

**Critérios de Aceitação:**
- [ ] Query de busca armazenada
- [ ] Número de resultados retornados
- [ ] Timestamp e filial registrados
- [ ] Flag "found" se resultado >0

---

### RF-016: Registrar Rotas Calculadas
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] registrar detalhes das rotas geradas.

**Critérios de Aceitação:**
- [ ] Lista de produtos (IDs)
- [ ] Sequência de paradas
- [ ] Distância total estimada
- [ ] Timestamp e filial

---

### RF-017: Dashboard Operacional Básico
**Prioridade:** Média  
**Descrição:** Gerente [DEVE] visualizar métricas agregadas.

**Critérios de Aceitação:**
- [ ] Total de sessões (dia/semana/mês)
- [ ] Taxa de adoção (QR escaneados / visitantes estimados)
- [ ] Top 10 buscas sem resultado
- [ ] Top 10 produtos "não encontrei"
- [ ] Taxa de conversão de ofertas

---

## 6. Módulo: Administração da Loja

### RF-018: Cadastrar Filial
**Prioridade:** Alta  
**Descrição:** Admin [DEVE] cadastrar nova filial no sistema.

**Critérios de Aceitação:**
- [ ] Formulário com nome, endereço, CNPJ
- [ ] Upload de logo (PNG/JPG, max 2MB)
- [ ] Geração automática de UUID
- [ ] Criação de QR Code para download

---

### RF-019: Cadastrar Produtos Manualmente
**Prioridade:** Média  
**Descrição:** Admin [PODE] cadastrar produtos manualmente.

**Critérios de Aceitação:**
- [ ] Formulário com nome, EAN, marca, categoria
- [ ] Campo de localização (corredor, prateleira)
- [ ] Estoque inicial (quantidade)
- [ ] Validação de EAN duplicado

---

### RF-020: Importar Catálogo via CSV
**Prioridade:** Alta  
**Descrição:** Admin [DEVE] importar catálogo via arquivo CSV.

**Critérios de Aceitação:**
- [ ] Template CSV disponível para download
- [ ] Validação de formato (colunas obrigatórias)
- [ ] Preview antes de confirmar importação
- [ ] Log de erros com linha do CSV
- [ ] Importação em background (para >1000 produtos)

**Formato CSV:**
```csv
ean,nome,marca,categoria,corredor,prateleira,estoque_inicial
7891234567890,Arroz Tio João 1kg,Tio João,Mercearia,3,2,50
```

---

### RF-021: Processar Planta Baixa com IA
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] processar foto/PDF da planta e extrair layout.

**Critérios de Aceitação:**
- [ ] Upload de imagem (PNG/JPG/PDF, max 10MB)
- [ ] OCR identifica corredores, entrada, checkout
- [ ] IA sugere coordenadas (x,y) de cada nó
- [ ] Admin revisa e aprova/edita sugestões
- [ ] Processamento assíncrono (notifica ao concluir)

---

### RF-022: Mapear Localização Automática via ERP
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] usar atributos do ERP para localizar produtos.

**Critérios de Aceitação:**
- [ ] Lê atributo "corredor" do ERP (ex: "Corredor 1")
- [ ] Mapeia texto para nó do grafo da loja
- [ ] Flag "auto_mapped" para rastreabilidade
- [ ] Admin pode corrigir mapeamento manual

**Exemplo:**
- ERP retorna: `produto.localizacao = "Corredor 3"`
- Sistema busca nó com `nome = "Corredor 3"` no grafo
- Vincula produto ao nó automaticamente

---

### RF-023: Validar Cadastro com IA
**Prioridade:** Média  
**Descrição:** IA [RECOMENDA] correções no cadastro da loja.

**Critérios de Aceitação:**
- [ ] Detecta produtos sem localização
- [ ] Detecta nós desconectados no grafo
- [ ] Detecta categorias sem produtos
- [ ] Sugere correções via dashboard

---

## 7. Integração com ERP

### RF-024: Consultar Catálogo do ERP
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] sincronizar catálogo do ERP Linx.

**Critérios de Aceitação:**
- [ ] Conector REST/SOAP para Linx
- [ ] Sincroniza: nome, EAN, marca, categoria, preço
- [ ] Atualização a cada 15 minutos (configurável)
- [ ] Cache Redis (TTL 10min)

---

### RF-025: Consultar Estoque em Tempo Real
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] verificar disponibilidade no ERP.

**Critérios de Aceitação:**
- [ ] Consulta estoque ao montar lista
- [ ] Flag "disponível" se estoque >0
- [ ] Cache de 5 minutos por produto
- [ ] Fallback: assume disponível se ERP offline

---

### RF-026: Fallback CSV para Sistemas Legados
**Prioridade:** Alta  
**Descrição:** Sistema [DEVE] suportar importação CSV se ERP não integrável.

**Critérios de Aceitação:**
- [ ] Mesmas validações que RF-020
- [ ] Atualização manual (sem sincronização automática)
- [ ] Aviso ao admin: "Estoque não sincronizado"

---

## 8. Requisitos Não-Funcionais Relacionados

- **RNF-020:** Carregamento inicial <3s (ver [04-requisitos-nao-funcionais.md](./04-requisitos-nao-funcionais.md))
- **RNF-028:** Cálculo de rota <2s para 50 itens

---

## 9. Matriz de Priorização (MoSCoW)

| Categoria | Requisitos |
|-----------|------------|
| **Must Have** | RF-001 a RF-009, RF-011, RF-013 a RF-016, RF-018, RF-020, RF-024, RF-025 |
| **Should Have** | RF-010, RF-012, RF-017, RF-021, RF-022, RF-026 |
| **Could Have** | RF-004, RF-019, RF-023 |
| **Won't Have (MVP)** | Integração pagamento, gamificação, app nativo |

---

**Anterior:** [02. Arquitetura](./02-arquitetura-sistema.md)  
**Próximo:** [04. Requisitos Não-Funcionais](./04-requisitos-nao-funcionais.md)
