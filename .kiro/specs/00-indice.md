# Especificações Técnicas - Ach.ai

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Status:** Draft Completo  
**Equipe:** TCC FECAP 2026

---

## Índice de Documentos

### 📋 1. Visão Geral e Arquitetura
- [01. Visão Geral do Sistema](./01-visao-geral.md)
- [02. Arquitetura do Sistema](./02-arquitetura-sistema.md)

### 📐 2. Requisitos e Regras de Negócio
- [03. Requisitos Funcionais](./03-requisitos-funcionais.md)
- [04. Requisitos Não-Funcionais](./04-requisitos-nao-funcionais.md)
- [05. Regras de Negócio](./05-regras-negocio.md)

### 🗄️ 3. Modelo de Dados
- [06. Modelo de Dados](./06-modelo-dados.md)
- [07. Dicionário de Dados](./07-dicionario-dados.md)

### 🔌 4. APIs e Integrações
- [08. API REST](./08-api-rest.md)
- [09. Integração com ERP](./09-integracao-erp.md)
- [10. IA para Processamento](./10-ia-processamento.md)

### ⚙️ 5. Módulos da Aplicação
- [11. Módulo QR e Acesso](./11-modulo-qr-acesso.md)
- [12. Módulo Catálogo](./12-modulo-catalogo.md)
- [13. Módulo Roteirização](./13-modulo-roteirizacao.md)
- [14. Módulo Retail Media](./14-modulo-retail-media.md)
- [15. Módulo Analytics](./15-modulo-analytics.md)

### 🔒 6. Segurança e Compliance
- [16. Segurança](./16-seguranca.md)
- [17. LGPD e Privacidade](./17-lgpd-privacidade.md)

### 🚀 7. Deployment e Operações
- [18. Infraestrutura](./18-infraestrutura.md)
- [19. Processos de Implantação](./19-processos-implantacao.md)

### 🧪 8. Testes e Qualidade
- [20. Estratégia de Testes](./20-estrategia-testes.md)
- [21. Critérios de Aceitação](./21-criterios-aceitacao.md)

### 📚 9. Referências
- [22. Glossário Técnico](./22-glossario-tecnico.md)

---

## Exemplos de Código

Disponíveis em `./exemplos/`:
- `api-endpoint-example.js` - Endpoint Express.js
- `tsp-algorithm.py` - Algoritmo de roteirização
- `linx-connector.js` - Conector Linx
- `ocr-prompt.txt` - Prompt IA para OCR
- `docker-compose.yml` - Infraestrutura local
- `schema.sql` - Criação de banco
- `component-example.tsx` - Componente React

---

## Matriz de Rastreabilidade

| ID Requisito | Especificação | Implementação | Teste |
|--------------|---------------|---------------|-------|
| RF-001 | [03](./03-requisitos-funcionais.md#rf-001) | [11](./11-modulo-qr-acesso.md) | [20](./20-estrategia-testes.md#qr) |
| RF-002 | [03](./03-requisitos-funcionais.md#rf-002) | [12](./12-modulo-catalogo.md) | [20](./20-estrategia-testes.md#catalogo) |
| RF-003 | [03](./03-requisitos-funcionais.md#rf-003) | [13](./13-modulo-roteirizacao.md) | [20](./20-estrategia-testes.md#rota) |
| RF-004 | [03](./03-requisitos-funcionais.md#rf-004) | [14](./14-modulo-retail-media.md) | [20](./20-estrategia-testes.md#retail) |
| RF-005 | [03](./03-requisitos-funcionais.md#rf-005) | [15](./15-modulo-analytics.md) | [20](./20-estrategia-testes.md#analytics) |
| RNF-020 | [04](./04-requisitos-nao-funcionais.md#rnf-020) | [18](./18-infraestrutura.md) | [20](./20-estrategia-testes.md#performance) |
| RNF-028 | [04](./04-requisitos-nao-funcionais.md#rnf-028) | [13](./13-modulo-roteirizacao.md) | [20](./20-estrategia-testes.md#carga) |

---

## Como Usar Esta Documentação

### Para Desenvolvedores:
1. Leia [01-visao-geral.md](./01-visao-geral.md) para contexto
2. Estude [02-arquitetura-sistema.md](./02-arquitetura-sistema.md) para entender decisões
3. Consulte specs de módulos (11-15) ao implementar features
4. Use exemplos em `./exemplos/` como base
5. Execute `schema.sql` para criar banco local

### Para Product Owners:
1. Revise [03-requisitos-funcionais.md](./03-requisitos-funcionais.md)
2. Valide [21-criterios-aceitacao.md](./21-criterios-aceitacao.md)
3. Acompanhe implementação via matriz de rastreabilidade
4. Use [05-regras-negocio.md](./05-regras-negocio.md) para resolver dúvidas

### Para DevOps:
1. Configure infra seguindo [18-infraestrutura.md](./18-infraestrutura.md)
2. Execute processos de [19-processos-implantacao.md](./19-processos-implantacao.md)
3. Use `exemplos/docker-compose.yml` para ambiente local
4. Configure CI/CD conforme [18](./18-infraestrutura.md#cicd)

### Para QA:
1. Aplique estratégia de [20-estrategia-testes.md](./20-estrategia-testes.md)
2. Valide critérios de [21-criterios-aceitacao.md](./21-criterios-aceitacao.md)
3. Execute testes de carga para RNF-028
4. Reporte bugs com referência aos requisitos

### Para Arquitetos:
1. Revise ADRs em [02-arquitetura-sistema.md](./02-arquitetura-sistema.md)
2. Valide modelo de dados [06-modelo-dados.md](./06-modelo-dados.md)
3. Aprove contratos de API [08-api-rest.md](./08-api-rest.md)
4. Garanta conformidade com [16-seguranca.md](./16-seguranca.md)

---

## Convenções de Documentação

- **[DEVE]** = Requisito obrigatório
- **[RECOMENDA]** = Boa prática sugerida
- **[PODE]** = Opcional
- **⚠️** = Atenção especial
- **💡** = Dica de implementação
- **🔒** = Consideração de segurança
- **🚀** = Oportunidade de otimização

---

## Controle de Versão

| Versão | Data | Mudanças | Autor |
|--------|------|----------|-------|
| 1.0 | 2026-01 | Versão inicial completa | Equipe Ach.ai |
| 1.1 | TBD | Revisão pós-piloto | TBD |

---

## Aprovações

- [ ] Product Owner
- [ ] Arquiteto de Software
- [ ] Tech Lead
- [ ] Security Lead
- [ ] Orientador Acadêmico (Prof. Leonardo Lugoboni)
- [ ] Supermercado Piloto (após seleção)

---

## Contato e Suporte

**Equipe Técnica:**
- Ettore Tarsis Angelo Marigo Grecco
- Leonardo Ferreira da Silva
- Luis Felipe Torelli Sparrapan
- Rafaella Morelli Ezequiel

**Orientador:** Prof. Leonardo Lugoboni  
**Instituição:** Centro Universitário FECAP  
**Ano:** 2026
