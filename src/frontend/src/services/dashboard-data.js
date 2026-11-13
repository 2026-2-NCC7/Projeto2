// A demonstração é derivada de registros diários, sem gravar no banco real.
export const DEMO_STORES = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Mercado Liberdade' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Supermercado Sakura' },
];

const catalog = [
  ['Pão de forma', 'Padaria', 'Corredor 1', 8.9],
  ['Café tradicional 500 g', 'Mercearia', 'Corredor 1', 19.9],
  ['Arroz integral 1 kg', 'Mercearia', 'Corredor 1', 7.49],
  ['Detergente neutro', 'Limpeza', 'Corredor 2', 2.49],
  ['Sabão em pó 1 kg', 'Limpeza', 'Corredor 2', 14.9],
  ['Leite integral 1 L', 'Laticínios', 'Corredor 3', 5.49],
  ['Iogurte natural', 'Laticínios', 'Corredor 3', 4.79],
  ['Leite sem lactose 1 L', 'Laticínios', 'Corredor 3', 6.99],
  ['Banana prata 1 kg', 'Hortifruti', 'Corredor 4', 6.99],
  ['Tomate 1 kg', 'Hortifruti', 'Corredor 4', 8.49],
  ['Azeite extravirgem 500 ml', 'Mercearia', 'Corredor 5', 32.9],
  ['Suco de uva 1 L', 'Bebidas', 'Corredor 5', 12.49],
];
const demoRecommendationItems = [
  ['Biscoito água e sal 200 g', 'Corredor 1'], ['Lentilha 500 g', 'Corredor 2'],
  ['Desinfetante lavanda 1 L', 'Corredor 3'], ['Requeijão cremoso 200 g', 'Corredor 4'],
  ['Batata palito congelada 400 g', 'Corredor 5'], ['Refrigerante guaraná 2 L', 'Corredor 6'],
  ['Morango 250 g', 'Corredor 7'],
];

export const number = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);
export const currency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
export const percent = (part, total) => total ? Math.round(part / total * 100) : 0;
export const shortDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function buildDemoData(period, storeId, now = new Date()) {
  const days = { day: 1, week: 7, month: 30 }[period] || 7;
  const stores = DEMO_STORES.filter((store) => !storeId || store.id === storeId);
  const products = catalog.map(([name, category, aisle, price], index) => ({ id: index + 1, name, category, aisle, price, units: 0, revenue: 0, searches: 0, missed: 0 }));
  const corridors = Array.from({ length: 5 }, (_, index) => ({ aisle: `Corredor ${index + 1}`, visits: 0, units: 0, revenue: 0 }));
  const timeline = [];
  const hourly = Array.from({ length: 7 }, () => Array(14).fill(0));
  let minutes = 0;
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const seed = Math.floor(date.getTime() / 86400000);
    const weekday = (date.getDay() + 6) % 7;
    const day = { date: dateKey(date), sessions: 0, calculated: 0, completed: 0, units: 0, revenue: 0 };
    stores.forEach((store) => {
      const branch = DEMO_STORES.findIndex((item) => item.id === store.id);
      const sessions = 85 + (seed * 13 + branch * 29) % 67 + (weekday >= 5 ? 48 : 0);
      const calculated = Math.floor(sessions * (0.72 + (seed % 5) / 100));
      const completed = Math.floor(calculated * (0.78 + (seed % 7) / 100));
      day.sessions += sessions; day.calculated += calculated; day.completed += completed;
      minutes += completed * (14 + (seed + branch) % 9);
      // Cada sessão recebe uma hora de início; a grade soma o total de sessões.
      const hours = [8, 9, 10, 10, 11, 11, 12, 12, 13, 14, 15, 16, 17, 17, 18, 18, 18, 19, 19, 20, 21];
      for (let i = 0; i < sessions; i += 1) hourly[weekday][hours[(i + seed + branch) % hours.length] - 8] += 1;
      products.forEach((product, index) => {
        const missed = (seed + index * 3 + branch) % 8 + (index === 10 ? 7 : 0);
        const units = 6 + (seed * (index + 3) + branch * 19) % 35 + (index === 5 ? 22 : 0);
        const searches = units + missed + 8 + (seed + index) % 13;
        product.units += units; product.revenue += units * product.price;
        product.searches += searches; product.missed += missed;
        day.units += units; day.revenue += units * product.price;
      });
      corridors.forEach((corridor, index) => { corridor.visits += Math.floor(calculated * (0.4 + ((seed + index * 7 + branch) % 45) / 100)); });
    });
    timeline.push(day);
  }
  for (const product of products) {
    const corridor = corridors.find((item) => item.aisle === product.aisle);
    corridor.units += product.units; corridor.revenue += product.revenue;
  }
  const sum = (key) => timeline.reduce((total, day) => total + day[key], 0);
  const recommendationProducts = demoRecommendationItems.map(([name, aisle], index) => {
    const impressions = Math.round(sum('sessions') * 0.3 * (0.15 + index * 0.012));
    const additions = Math.round(impressions * (0.22 + (index % 3) * 0.05));
    const collected = Math.round(additions * (0.48 + (index % 3) * 0.06));
    const estimatedRevenue = Math.round(collected * (8.5 + index * 2.75) * 100) / 100;
    return { productName: name, aisle, impressions, additions, collected, estimatedRevenue };
  });
  const recommendationImpressions = recommendationProducts.reduce((total, item) => total + item.impressions, 0);
  const recommendationAdds = recommendationProducts.reduce((total, item) => total + item.additions, 0);
  const recommendationCollected = recommendationProducts.reduce((total, item) => total + item.collected, 0);
  const notFoundItems = products.map((item) => ({ productName: item.name, aisle: item.aisle, reports: item.missed, lastReportedAt: dateKey(now) })).filter((item) => item.reports > 0).sort((a, b) => b.reports - a.reports);
  return {
    source: 'demo', salesAvailable: true, products, corridors, timeline, hourly,
    sessions: sum('sessions'), routesCalculated: sum('calculated'), completedRoutes: sum('completed'),
    completionRate: percent(sum('completed'), sum('calculated')),
    units: sum('units'), revenue: sum('revenue'), averageMinutes: sum('completed') ? minutes / sum('completed') : null,
    searches: products.reduce((total, product) => total + product.searches, 0),
    searchesWithoutResult: products.reduce((total, product) => total + product.missed, 0),
    recommendations: { impressions: recommendationImpressions, additions: recommendationAdds, collected: recommendationCollected, estimatedRevenue: recommendationProducts.reduce((total, item) => total + item.estimatedRevenue, 0), conversionRate: recommendationImpressions ? Math.round(recommendationCollected / recommendationImpressions * 100) : 0, products: recommendationProducts },
    promotions: { impressions: sum('sessions'), additions: Math.round(sum('sessions') * 0.18), collected: Math.round(sum('sessions') * 0.11), estimatedRevenue: Math.round(sum('sessions') * 1.35 * 100) / 100, dismissals: Math.round(sum('sessions') * 0.52), conversionRate: 11 },
    notFoundItems,
    periodLabel: `${shortDate(timeline[0].date)} a ${shortDate(timeline.at(-1).date)}`,
  };
}

export function adaptLiveData(data) {
  const products = (data.topSearches || []).map((item, index) => ({ id: index, name: item.name, searches: item.count, category: 'Não informada', aisle: 'Não localizado', units: null, revenue: null, missed: 0 }));
  for (const item of data.unavailableProducts || []) {
    const product = products.find((row) => row.name === item.name);
    if (product) product.missed = item.count;
    else products.push({ id: `alert-${products.length}`, name: item.name, category: 'Não informada', aisle: 'Não localizado', searches: 0, missed: item.count, units: null, revenue: null });
  }
  return {
    ...data, source: 'live', salesAvailable: false, products,
    recommendations: data.recommendations || { impressions: 0, additions: 0, conversionRate: 0 },
    promotions: data.promotions || { impressions: 0, additions: 0, dismissals: 0, conversionRate: 0 },
    notFoundItems: data.notFoundItems || [],
    corridors: (data.heatmap || []).map((row) => ({ ...row, units: null, revenue: null })),
    timeline: (data.timeline || []).map((row) => ({ ...row, calculated: row.calculated ?? 0 })),
    hourly: null, averageMinutes: null, units: null, revenue: null,
  };
}

// Neutraliza fórmulas antes de exportar texto proveniente de eventos de busca.
export function exportCsv(filename, headers, rows) {
  const cell = (value) => {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const blob = new Blob(['\uFEFF', [headers, ...rows].map((row) => row.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
  anchor.hidden = true; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
