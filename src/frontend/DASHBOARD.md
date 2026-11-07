# Dashboard B2B Ach.ai

## Acesso e arquitetura

Execute `npm ci` e `npm run dev` nesta pasta. A demonstração local abre em `http://127.0.0.1:5173/?demo=1#overview`. O parâmetro `demo=1` só funciona no servidor de desenvolvimento. O build de produção mantém o login administrativo.

- [Dashboard](src/pages/Dashboard.jsx): navegação entre cinco páginas, filtros e relatórios.
- [Componentes de gráficos](src/components/DashboardCharts.jsx): evolução diária, categorias, funil, horários e mapa interativo.
- [Dados e exportação](src/services/dashboard-data.js): simulação determinística, adaptação da API e CSV com proteção contra fórmulas.
- [Estilos](src/styles/dashboard.css): layout responsivo e foco visível para navegação por teclado.
- [Modelo analítico da API](../backend/src/model/analytics-model.js): agregação dos eventos reais.

Não foram adicionadas bibliotecas. São preservados React 19, JavaScript, Vite, CSS, identidade visual do portal e API Node/PostgreSQL. A planta reutiliza os corredores e as gôndolas do [motor indoor existente](../mobile/src/shared/indoor-map-engine.js).

## Funcionalidades

| Aba | Conteúdo e ações |
| --- | --- |
| Visão geral | Indicadores, evolução diária interativa, produtos mais buscados, participação por categoria e mapa resumido |
| Mapa de calor | Camadas de unidades vendidas, valor das vendas e presença nas rotas; seleção de corredor por clique ou teclado; produtos relacionados e comparativo |
| Produtos e buscas | Busca textual, categoria, ordenação, filtro de relatos, detalhes de produto e exportação da tabela filtrada |
| Jornada de compra | Funil de sessões/rotas, conclusão, evolução por data e grade de utilização por horário |
| Relatórios | CSV de evolução diária, corredores e produtos; explicações das métricas |

As páginas têm conteúdo próprio e endereços por fragmento, com suporte a voltar/avançar no navegador. Período e filial são mantidos ao navegar.

## Origem e cálculo

A simulação contém duas filiais e 12 produtos, com registros calculados por data e filial. Todos os resumos de vendas derivam dos mesmos registros. Selecionar Hoje, 7 dias, 30 dias ou outra filial recalcula os indicadores, gráficos e exportações.

- **Conclusão:** rotas concluídas / rotas calculadas. Não representa conversão de vendas.
- **Mapa de vendas:** unidades ou valor de vendas agrupados pelo corredor cadastrado. Está disponível na demonstração; o backend atual não importa vendas do PDV.
- **Mapa de rotas:** número de eventos de cálculo que incluem cada corredor, sem duplicar o corredor dentro do mesmo evento. Não representa circulação física medida.
- **Buscas/relatos sem sucesso:** pesquisas sem resultado e eventos de produto não encontrado. Não confirmam falta de estoque.
- **Tempo e horários:** simulados na demonstração. O adaptador não inventa essas informações no modo real.

No modo real, erros e resultados vazios não acionam dados fictícios. Vendas, categorias e outras métricas sem fonte ficam indisponíveis. O ranking retornado pela API é limitado; não constitui inventário completo.

## Cobertura do documento e limites

- Implementados: filtros, sessões, rotas calculadas/concluídas, rankings, visualização por corredor, navegação independente e exportações.
- Demonstrados com dados fictícios: vendas por produto/corredor, horários e tempo médio da jornada.
- Pendentes de integração: vendas confirmadas ERP/PDV, comparação de ticket médio, campanhas e funil de recomendações. O funil exibido é de utilização, não de recomendações.
- A planta é esquemática e compartilhada com o app; a associação simulada dos produtos aos corredores não altera o catálogo real. A opção Todas as lojas agrega por nome do corredor, não representa uma planta física conjunta.
- A meta de carregamento em até cinco segundos e o processamento assíncrono em escala exigem validação com banco e carga representativos; não foram certificados neste ambiente sem banco local configurado.

## Verificações realizadas

- Build Vite de produção.
- Consistência das somas de produtos, corredores, evolução e horários em nove combinações de filtros.
- Agregação da API com eventos controlados: sessão única, conclusão e corredor sem duplicação.
- Navegação das cinco abas, filtros, seleção de corredor por teclado e detalhes dos produtos no navegador.
- Conteúdo do CSV filtrado: duas linhas de produtos, cabeçalhos e origem simulada. O evento de download não foi confirmado pelo navegador integrado; o Blob gerado foi inspecionado.
- Dimensões responsivas de 1440 px e 390 px sem transbordamento horizontal da página.
