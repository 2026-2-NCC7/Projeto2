import { useEffect, useMemo, useState } from 'react';
import Brand from '../components/Brand.jsx';
import { getAnalytics, getStores } from '../services/auth-api.js';
import { adaptLiveData, buildDemoData, currency, DEMO_STORES, exportCsv, number, percent } from '../services/dashboard-data';
import { CategoryChart, Empty, Funnel, HourChart, Panel, StoreHeatmap, TrendChart } from '../components/DashboardCharts';
import '../styles/dashboard.css';

const pages = [
  { id: 'overview', icon: '▦', title: 'Visão geral', description: 'Uma visão clara do que acontece na sua loja.' },
  { id: 'heatmap', icon: '⌖', title: 'Mapa de calor', description: 'Entenda onde as compras e recomendações se concentram.' },
  { id: 'products', icon: '≡', title: 'Produtos e buscas', description: 'Conecte o interesse dos clientes à disponibilidade dos produtos.' },
  { id: 'journey', icon: '↝', title: 'Jornada de compra', description: 'Acompanhe as rotas e os horários de maior utilização.' },
  { id: 'reports', icon: '↧', title: 'Relatórios', description: 'Leve os indicadores da loja para suas análises e decisões.' },
];
const periods = [{ id: 'day', label: 'Hoje' }, { id: 'week', label: '7 dias' }, { id: 'month', label: '30 dias' }];
const initialPage = () => pages.some((page) => `#${page.id}` === window.location.hash) ? window.location.hash.slice(1) : 'overview';

function Metric({ title, value, note, symbol, color = 'orange' }) {
  return <article className="analytics-metric"><div><span>{title}</span><i className={color}>{symbol}</i></div><strong>{value}</strong><small>{note}</small></article>;
}

export default function Dashboard({ onLogout, demoPreview = false }) {
  const [tab, setTab] = useState(initialPage);
  const [period, setPeriod] = useState('week');
  const [storeId, setStoreId] = useState(demoPreview ? DEMO_STORES[0].id : '');
  const [stores, setStores] = useState(demoPreview ? DEMO_STORES : []);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(!demoPreview);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [metric, setMetric] = useState(demoPreview ? 'units' : 'visits');
  const [corridor, setCorridor] = useState('Corredor 3');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('searches');
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [productId, setProductId] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const update = () => setTab(initialPage());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => { document.title = `Ach.ai | ${pages.find((page) => page.id === tab).title}`; }, [tab]);
  useEffect(() => {
    if (demoPreview) return undefined;
    let active = true;
    getStores().then((result) => { if (active) setStores(result); }).catch(() => { if (active) setError('Não foi possível carregar as filiais. Tente atualizar.'); });
    return () => { active = false; };
  }, [demoPreview, refresh]);
  useEffect(() => {
    if (demoPreview) return undefined;
    let active = true;
    setLoading(true); setError(''); setLiveData(null);
    getAnalytics(period, storeId).then((result) => { if (active) setLiveData(adaptLiveData(result)); })
      .catch((reason) => { if (active) setError(reason.message || 'Não foi possível consultar os indicadores.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period, storeId, refresh, demoPreview]);

  const demoData = useMemo(() => demoPreview ? buildDemoData(period, storeId) : null, [period, storeId, demoPreview]);
  const data = demoPreview ? demoData : liveData;
  const page = pages.find((item) => item.id === tab);
  const selectedStore = stores.find((item) => item.id === storeId)?.name || 'Todas as lojas';
  const navigate = (id) => { window.location.hash = id; setTab(id); setNotice(''); };
  const products = useMemo(() => (data?.products || []).filter((item) => item.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (!category || item.category === category) && (!alertsOnly || item.missed > 0)).sort((a, b) => (b[sort] || 0) - (a[sort] || 0) || a.name.localeCompare(b.name)), [data, query, category, alertsOnly, sort]);
  const selectedProduct = data?.products.find((item) => item.id === productId);
  const selectedCorridor = data?.corridors.find((item) => item.aisle === corridor);
  const topProducts = [...(data?.products || [])].sort((a, b) => b.searches - a.searches).slice(0, 5);
  const corridorProducts = (data?.products || []).filter((item) => item.aisle === corridor).sort((a, b) => (b.units || b.searches) - (a.units || a.searches));
  const metricLabel = { units: 'Unidades vendidas', revenue: 'Valor das vendas', visits: 'Presença nas rotas' }[metric];
  const openProduct = (id) => { setProductId(id); setQuery(''); setCategory(''); setAlertsOnly(false); navigate('products'); };

  function download(kind) {
    if (!data) return;
    const context = [demoPreview ? 'Simulado' : 'Real', selectedStore, periods.find((item) => item.id === period).label];
    const reports = {
      products: [['Produto', 'Categoria', 'Corredor', 'Buscas', 'Sem sucesso', 'Unidades vendidas', 'Vendas (BRL)'], products.map((item) => [item.name, item.category, item.aisle, item.searches, item.missed, item.units, item.revenue?.toFixed(2)])],
      corridors: [['Corredor', 'Presença nas rotas', 'Unidades vendidas', 'Vendas (BRL)'], data.corridors.map((item) => [item.aisle, item.visits, item.units, item.revenue?.toFixed(2)])],
      timeline: [['Data', 'Sessões', 'Rotas calculadas', 'Rotas concluídas', 'Unidades vendidas', 'Vendas (BRL)'], data.timeline.map((item) => [item.date, item.sessions, item.calculated, item.completed, item.units, item.revenue?.toFixed(2)])],
    };
    const [headers, rows] = reports[kind];
    exportCsv(`achai-${kind}-${period}-${demoPreview ? 'simulado' : 'real'}.csv`, ['Origem', 'Filial', 'Período', ...headers], rows.map((row) => [...context, ...row]));
    setNotice(`Relatório exportado: ${rows.length} registros. Origem ${demoPreview ? 'simulada' : 'real'} identificada no arquivo.`);
  }

  const heatmapPanel = data && <Panel title="Onde as compras acontecem" description={`${selectedStore} · ${metricLabel.toLowerCase()}`} action={<span className="analytics-tag">{demoPreview ? 'Simulação' : 'Eventos reais'}</span>}>
    <div className="analytics-segment" aria-label="Camada do mapa">{[['units', 'Unidades'], ['revenue', 'Valor das vendas'], ['visits', 'Rotas']].map(([id, label]) => <button key={id} aria-pressed={metric === id} disabled={id !== 'visits' && !data.salesAvailable} className={metric === id ? 'active' : ''} onClick={() => setMetric(id)}>{label}</button>)}</div>
    <StoreHeatmap corridors={data.corridors} metric={metric} selected={corridor} onSelect={(value) => { setCorridor(value); if (tab === 'overview') navigate('heatmap'); }}/><p className="chart-note">Interações por corredor combinam rotas e exibições ou inclusões de recomendações/ofertas. Não representam rastreamento físico contínuo.</p>
    <p className="chart-note">{metric === 'visits' ? 'Rotas calculadas que incluem o corredor; não mede circulação física nem vendas.' : 'Compras simuladas por corredor para demonstrar a futura integração ERP/PDV.'}</p>
  </Panel>;

  return <div className="analytics-app">
    <aside className="analytics-sidebar"><Brand/><div className="analytics-eyebrow">PORTAL DO PARCEIRO</div><nav aria-label="Seções do dashboard">{pages.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><span aria-hidden="true">{item.icon}</span>{item.title}{tab === item.id && <i/>}</button>)}</nav><div className="sidebar-footer"><div className="sidebar-store"><span>M</span><div><b>{selectedStore}</b><small>{demoPreview ? 'Ambiente demonstrativo' : 'Portal administrativo'}</small></div></div><button onClick={onLogout}>Sair do portal <span>↗</span></button></div></aside>
    <main className="analytics-main"><header className="analytics-topbar"><span>Seu supermercado <i>/</i> <b>{page.title}</b></span><span className={`analytics-status ${demoPreview ? 'demo' : ''}`}><i/>{demoPreview ? 'Demonstração' : loading ? 'Atualizando' : error ? 'Conexão pendente' : 'Dados da API'}</span></header>
      <div className="analytics-content"><div className="analytics-heading"><div><span className="analytics-eyebrow">INTELIGÊNCIA PARA SUA LOJA</span><h1>{page.title}</h1><p>{page.description}</p></div><button className="analytics-button" disabled={tab === 'reports' && !data} onClick={() => tab === 'reports' ? download('timeline') : navigate('reports')}>↓ Exportar relatório</button></div>
        <div className="analytics-filterbar"><label>Filial<select value={storeId} onChange={(event) => { setStoreId(event.target.value); setProductId(null); }}><option value="">Todas as lojas</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name || store.nome}</option>)}</select></label><div className="analytics-segment" aria-label="Período">{periods.map((item) => <button key={item.id} className={period === item.id ? 'active' : ''} aria-pressed={period === item.id} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div><span className="filter-date">{data?.periodLabel || ({ day: 'Últimas 24 horas', week: 'Últimos 7 dias', month: 'Últimos 30 dias' }[period])}</span>{!demoPreview && <button className="analytics-button" onClick={() => setRefresh((value) => value + 1)}>Atualizar</button>}</div>
        {demoPreview && <div className="analytics-banner"><b>Dados simulados</b><span>Explore as abas, os filtros e os corredores. Nenhuma venda real está sendo apresentada.</span></div>}
        {notice && <p className="analytics-notice" role="status">{notice}</p>}
        {loading && <Empty>Carregando indicadores…</Empty>}
        {error && <div className="analytics-error" role="alert"><p>{error}</p><button className="analytics-button" onClick={() => setRefresh((value) => value + 1)}>Tentar novamente</button></div>}
        {data && <>
          {tab === 'overview' && <>
            <div className="analytics-kpis"><Metric title="Sessões iniciadas" value={number(data.sessions)} note="Acessos no período selecionado" symbol="↗"/><Metric title="Conclusão de rotas" value={`${data.completionRate}%`} note={`${number(data.completedRoutes)} de ${number(data.routesCalculated)} rotas`} symbol="✓" color="green"/><Metric title="Buscas realizadas" value={number(data.searches)} note={`${number(data.searchesWithoutResult)} buscas ou relatos sem sucesso`} symbol="⌕" color="blue"/><Metric title="Unidades vendidas" value={data.salesAvailable ? number(data.units) : '—'} note={data.salesAvailable ? `${currency(data.revenue)} em vendas simuladas` : 'Aguardando integração com o PDV'} symbol="▤" color="purple"/></div>
            <div className="analytics-kpis three"><Metric title="Recomendações exibidas" value={number(data.recommendations?.impressions)} note={`${number(data.recommendations?.additions)} adicionadas à lista`} symbol="✦" color="orange"/><Metric title="Conversão de recomendações" value={`${data.recommendations?.conversionRate || 0}%`} note="Inclusões ÷ exibições registradas" symbol="↗" color="green"/><Metric title="Ofertas adicionadas" value={number(data.promotions?.additions)} note={`${number(data.promotions?.impressions)} popups exibidos · ${data.promotions?.conversionRate || 0}% de conversão`} symbol="⚡" color="blue"/></div>
            <div className="analytics-grid"><Panel title="A jornada em números" description="Selecione uma data para explorar os valores." action={<button className="analytics-text-button" onClick={() => navigate('journey')}>Ver jornada ↗</button>}><TrendChart rows={data.timeline}/></Panel>{heatmapPanel}</div>
            <div className="analytics-grid"><Panel title="Produtos mais buscados" description="O que os clientes procuram na loja." action={<button className="analytics-text-button" onClick={() => navigate('products')}>Explorar produtos ↗</button>}><div className="product-ranking">{topProducts.map((product, index) => <button key={product.id} onClick={() => openProduct(product.id)}><span className="rank-position">{String(index + 1).padStart(2, '0')}</span><span>{product.name}<i><b style={{ width: `${percent(product.searches, Math.max(...topProducts.map((row) => row.searches), 1))}%` }}/></i></span><strong>{number(product.searches)}<small>buscas</small></strong></button>)}{!topProducts.length && <Empty>Nenhuma busca no período.</Empty>}</div></Panel><Panel title="Participação nas vendas" description="Distribuição das unidades vendidas por categoria."><CategoryChart products={data.salesAvailable ? data.products : []}/></Panel></div>
          </>}
          {tab === 'heatmap' && <><div className="analytics-grid map-layout">{heatmapPanel}<Panel title={corridor} description="Detalhamento do corredor selecionado."><div className="corridor-stats"><strong>{metric === 'revenue' ? currency(selectedCorridor?.[metric]) : number(selectedCorridor?.[metric])}</strong><span>{metricLabel.toLowerCase()}</span><small>{percent(selectedCorridor?.[metric] || 0, data.corridors.reduce((sum, item) => sum + (item[metric] || 0), 0))}% do total registrado</small></div><h3 className="section-mini-title">Produtos neste corredor</h3>{corridorProducts.map((product) => <button className="corridor-product" key={product.id} onClick={() => openProduct(product.id)}><span>{product.name}<small>{product.category}</small></span><b>{data.salesAvailable ? `${number(product.units)} un.` : `${number(product.searches)} buscas`}<small>{data.salesAvailable ? currency(product.revenue) : 'Ver detalhes →'}</small></b></button>)}{!corridorProducts.length && <Empty>Não há produtos localizados neste corredor nos dados disponíveis.</Empty>}<p className="chart-note">A intensidade indica concentração de vendas ou inclusão em rotas. Não comprova o trajeto físico do cliente.</p></Panel></div><Panel title="Comparativo dos corredores" description="Compare a distribuição usando a camada selecionada."><div className="corridor-comparison">{[...data.corridors].sort((a, b) => (b[metric] || 0) - (a[metric] || 0)).map((item) => <button key={item.aisle} onClick={() => setCorridor(item.aisle)}><span>{item.aisle}</span><i><b style={{ width: `${percent(item[metric] || 0, Math.max(...data.corridors.map((row) => row[metric] || 0), 1))}%` }}/></i><strong>{metric === 'revenue' ? currency(item[metric]) : number(item[metric])}</strong></button>)}</div></Panel></>}
          {tab === 'products' && <>
            <div className="analytics-kpis three"><Metric title="Buscas realizadas" value={number(data.searches)} note="Interesse registrado no período" symbol="⌕"/><Metric title="Buscas e relatos sem sucesso" value={number(data.searchesWithoutResult)} note="Indício para conferir estoque e localização" symbol="!" color="purple"/><Metric title="Produtos no relatório" value={number(data.products.length)} note={demoPreview ? 'Catálogo fictício da demonstração' : 'Itens retornados pela API (ranking limitado)'} symbol="≡" color="green"/></div>
            <Panel title="Explore o catálogo analítico" description="Selecione um produto para ver seus indicadores." action={<button className="analytics-text-button" onClick={() => download('products')}>↓ Exportar tabela</button>}>
              <div className="product-filters"><label className="product-search">Buscar produto<input type="search" placeholder="Ex.: leite, café, banana…" value={query} onChange={(event) => setQuery(event.target.value)}/></label><label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas</option>{[...new Set(data.products.map((item) => item.category))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Ordenar por<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="searches">Mais buscados</option><option value="missed">Mais relatos sem sucesso</option>{data.salesAvailable && <><option value="units">Mais vendidos</option><option value="revenue">Maior valor em vendas</option></>}</select></label><label className="alert-toggle"><input type="checkbox" checked={alertsOnly} onChange={(event) => setAlertsOnly(event.target.checked)}/>Somente com relatos</label></div>
              <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Produto / categoria</th><th>Corredor</th><th>Buscas</th><th>Sem sucesso</th><th>Unidades vendidas</th><th>Vendas</th></tr></thead><tbody>{products.map((product) => <tr key={product.id} className={product.id === productId ? 'selected' : ''}><td><button onClick={() => setProductId(product.id)}>{product.name}</button><small>{product.category}</small></td><td>{product.aisle}</td><td>{number(product.searches)}</td><td><span className={product.missed ? 'alert-pill' : ''}>{number(product.missed)}</span></td><td>{data.salesAvailable ? number(product.units) : '—'}</td><td>{data.salesAvailable ? currency(product.revenue) : '—'}</td></tr>)}</tbody></table></div>{!products.length && <Empty>Nenhum produto corresponde aos filtros.</Empty>}<p className="chart-note">{products.length} produtos exibidos. Relatos sem sucesso pedem conferência; não confirmam ruptura de estoque.</p>
            </Panel>{selectedProduct && <section className="product-details" aria-label="Detalhes do produto"><div><span className="analytics-eyebrow">PRODUTO SELECIONADO</span><h3>{selectedProduct.name}</h3><p>{selectedProduct.category} · {selectedProduct.aisle}</p></div><dl><div><dt>Buscas</dt><dd>{number(selectedProduct.searches)}</dd></div><div><dt>Sem sucesso</dt><dd>{number(selectedProduct.missed)}</dd></div>{data.salesAvailable && <><div><dt>Unidades vendidas</dt><dd>{number(selectedProduct.units)}</dd></div><div><dt>Valor das vendas</dt><dd>{currency(selectedProduct.revenue)}</dd></div></>}</dl><button className="analytics-button" onClick={() => setProductId(null)}>Fechar detalhes</button></section>}
          </>}
          {tab === 'journey' && <>
            <div className="analytics-kpis three"><Metric title="Rotas calculadas" value={number(data.routesCalculated)} note="Solicitações de cálculo registradas" symbol="↝"/><Metric title="Rotas concluídas" value={number(data.completedRoutes)} note={`${data.completionRate}% das rotas calculadas`} symbol="✓" color="green"/><Metric title="Tempo médio de jornada" value={data.averageMinutes === null ? '—' : `${data.averageMinutes.toFixed(1).replace('.', ',')} min`} note={demoPreview ? 'Duração média simulada das jornadas concluídas' : 'Duração ainda não instrumentada'} symbol="◷" color="blue"/></div>
            <div className="analytics-grid"><Panel title="Funil de utilização" description="Contagens de acesso, cálculo e conclusão; não mede vendas."><Funnel data={data}/><p className="chart-note">Uma sessão pode gerar mais de uma rota. A conclusão considera rotas concluídas / calculadas.</p></Panel><Panel title="Evolução no período" description="Sessões iniciadas e rotas concluídas por dia."><TrendChart rows={data.timeline}/></Panel></div>
            <Panel title="Horários de maior utilização" description="Sessões por dia da semana e horário. Passe o cursor ou use Tab para consultar cada célula."><HourChart rows={data.hourly}/><p className="chart-note">Cada célula soma as sessões do dia da semana e da hora no período escolhido.</p></Panel>
            <div className="analytics-banner neutral"><b>Conversão comercial</b><span>Conclusão de rota não significa compra confirmada. Ticket médio e conversão de recomendações dependem de eventos de recomendação e dados do ERP/PDV previstos no documento.</span></div>
          </>}
          {tab === 'reports' && <><Panel title="Relatórios disponíveis" description={`Origem: ${demoPreview ? 'dados simulados' : 'eventos da API'} · ${selectedStore} · ${data.periodLabel || periods.find((item) => item.id === period).label}`}><div className="report-cards">{[['timeline', 'Evolução diária', 'Sessões, rotas calculadas e concluídas por data.', data.timeline.length], ['corridors', 'Desempenho dos corredores', 'Presença nas rotas e vendas, quando disponíveis.', data.corridors.length], ['products', 'Produtos e buscas', 'Produtos com os filtros atuais da aba Produtos e buscas.', products.length]].map(([kind, title, description, count]) => <article key={kind}><span className="report-icon">↧</span><h3>{title}</h3><p>{description}</p><small>{number(count)} registros · CSV UTF-8</small><button className="analytics-button" disabled={!count} onClick={() => download(kind)}>Baixar CSV ↓</button></article>)}</div></Panel><Panel title="Como interpretar os indicadores" description="Critérios de cálculo e disponibilidade das informações."><dl className="metric-definitions"><div><dt>Conclusão de rotas</dt><dd>Rotas concluídas divididas pelas rotas calculadas no período. Não equivale à taxa de vendas.</dd></div><div><dt>Mapa de vendas</dt><dd>Unidades e valor dos produtos, agrupados pelo corredor cadastrado. Na demonstração, os valores vêm dos mesmos registros usados nas tabelas e nos relatórios.</dd></div><div><dt>Mapa de rotas</dt><dd>Quantidade de rotas calculadas que incluem o corredor. Não representa rastreamento físico em tempo real.</dd></div><div><dt>Dados reais e simulados</dt><dd>As fontes são separadas. Erros na API e períodos vazios não são preenchidos com vendas fictícias. As exportações identificam a origem dos dados.</dd></div></dl></Panel></>}
        </>}
        <footer className="analytics-footer"><b>Ach.ai</b><span>Mais clareza para decidir. Mais valor para sua loja.</span><small>{demoPreview ? 'Ambiente de demonstração · dados fictícios' : 'Indicadores operacionais'}</small></footer>
      </div>
    </main>
  </div>;
}
