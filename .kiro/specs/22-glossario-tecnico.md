# 22. Glossário Técnico

**Versão:** 1.0  
**Responsável:** Documentação  
**Status:** Draft

---

## A

**ADR (Architecture Decision Record)**  
Documento que registra uma decisão arquitetural importante, contexto e consequências.

**API Gateway**  
Ponto de entrada único para todas as requisições da API, responsável por roteamento, autenticação e rate limiting.

**Aresta**  
Conexão entre dois nós no grafo da loja, representando um caminho possível.

---

## B

**Beacon (BLE)**  
Dispositivo Bluetooth Low Energy para posicionamento indoor (fora do escopo do MVP).

**Blue-Green Deployment**  
Estratégia de deploy onde duas versões rodam em paralelo, permitindo rollback instantâneo.

---

## C

**Canary Release**  
Deploy gradual de nova versão para percentual pequeno de usuários antes de 100%.

**Cache Invalidation**  
Processo de limpar dados desatualizados do Redis.

**C4 Model**  
Modelo de diagramação arquitetural em 4 níveis: Context, Container, Component, Code.

**CNPJ**  
Cadastro Nacional de Pessoa Jurídica - identificador único de empresa no Brasil.

**CPC (Cost Per Click)**  
Modelo de precificação de Retail Media baseado em cliques.

**CTR (Click-Through Rate)**  
Taxa de cliques: (cliques / impressões) × 100.

---

## D

**DPO (Data Protection Officer)**  
Encarregado de proteção de dados exigido pela LGPD.

**Disaster Recovery**  
Conjunto de procedimentos para restaurar sistema após falha crítica.

---

## E

**EAN (European Article Number)**  
Código de barras padrão de 13 dígitos para identificar produtos.

**ERP (Enterprise Resource Planning)**  
Sistema de gestão integrada do supermercado (ex: Linx, SAP).

**Euclidean Distance**  
Distância em linha reta entre dois pontos: √((x₂-x₁)² + (y₂-y₁)²).

---

## F

**Fallback**  
Comportamento alternativo quando sistema principal falha.

**Full-Text Search**  
Busca textual avançada com suporte a stemming e ranking de relevância.

---

## G

**GTIN (Global Trade Item Number)**  
Padrão global para identificação de produtos (inclui EAN).

**Grafo**  
Estrutura matemática de nós (vértices) conectados por arestas, usada para representar o mapa da loja.

---

## H

**Heurística**  
Algoritmo que encontra solução boa (não necessariamente ótima) de forma rápida.

**Health Check**  
Endpoint que verifica se serviço está funcionando (ex: `/health`).

---

## I

**Idempotência**  
Propriedade de operação que pode ser executada múltiplas vezes sem efeitos colaterais.

**Impression**  
Exibição de uma oferta na tela do usuário (métrica de Retail Media).

---

## J

**JWT (JSON Web Token)**  
Token de autenticação stateless codificado em Base64.

---

## L

**LGPD (Lei Geral de Proteção de Dados)**  
Lei 13.709/2018 que regula tratamento de dados pessoais no Brasil.

**Load Balancer**  
Distribui requisições entre múltiplas instâncias da aplicação.

---

## M

**Multi-AZ (Multi Availability Zone)**  
Deploy em múltiplas zonas de disponibilidade para alta disponibilidade.

**MVP (Minimum Viable Product)**  
Versão mínima do produto com funcionalidades essenciais para validação.

---

## N

**Nó (Node)**  
Ponto no grafo da loja (entrada, checkout, posição de produto).

**Nearest Neighbor**  
Heurística TSP que sempre escolhe o nó mais próximo não visitado.

---

## O

**OCR (Optical Character Recognition)**  
Reconhecimento de texto em imagens via IA.

**OpenAPI**  
Especificação padrão para documentar APIs REST (anteriormente Swagger).

**OWASP Top 10**  
Lista das 10 vulnerabilidades de segurança mais críticas em aplicações web.

---

## P

**Particionamento**  
Divisão de tabela grande em múltiplas subtabelas para melhorar performance.

**PDV (Ponto de Venda)**  
Sistema de caixa/checkout do supermercado.

**PostGIS**  
Extensão do PostgreSQL para dados geoespaciais.

**PWA (Progressive Web App)**  
Aplicação web que funciona como app nativo (offline, instalável, push notifications).

---

## Q

**QR Code**  
Código de barras 2D que armazena URL ou texto, usado para identificar filial.

---

## R

**Rate Limiting**  
Limitação de número de requisições por intervalo de tempo.

**Redis**  
Banco de dados em memória usado para cache e filas.

**Retail Media**  
Publicidade contextual dentro do supermercado (ofertas patrocinadas).

**RNF (Requisito Não-Funcional)**  
Requisito sobre qualidade do sistema (performance, segurança, etc).

**ROI (Return on Investment)**  
Retorno sobre investimento: (Ganho - Custo) / Custo × 100.

**RPO (Recovery Point Objective)**  
Tempo máximo de perda de dados aceitável em desastre.

**RTO (Recovery Time Objective)**  
Tempo máximo para restaurar sistema após falha.

---

## S

**SKU (Stock Keeping Unit)**  
Identificador único de produto no estoque.

**SOAP (Simple Object Access Protocol)**  
Protocolo de comunicação baseado em XML (usado por ERPs legados).

**Service Worker**  
Script JavaScript que roda em background, permitindo funcionalidades offline em PWA.

---

## T

**TSP (Traveling Salesman Problem)**  
Problema de otimização: encontrar menor caminho visitando todos os pontos.

**TTL (Time To Live)**  
Tempo de vida de dado em cache antes de expirar.

---

## U

**UUID (Universally Unique Identifier)**  
Identificador único global de 128 bits (ex: `550e8400-e29b-41d4-a716-446655440000`).

---

## V

**VU (Virtual User)**  
Usuário simulado em teste de carga.

---

## W

**WAF (Web Application Firewall)**  
Firewall que protege aplicação de ataques web (SQL injection, XSS, etc).

**WAL (Write-Ahead Logging)**  
Técnica de backup contínuo do PostgreSQL.

**WCAG (Web Content Accessibility Guidelines)**  
Diretrizes de acessibilidade web (nível AA = conformidade intermediária).

---

## Z

**Zod**  
Biblioteca TypeScript para validação de schemas com type-safety.

---

**Anterior:** [21. Critérios de Aceitação](./21-criterios-aceitacao.md)  
**Índice:** [00-indice.md](./00-indice.md)
