import { useState } from 'react';
import { INDOOR_CORRIDORS, INDOOR_SHELVES } from '../../../mobile/src/shared/indoor-map-engine';
import { currency, number, percent, shortDate } from '../services/dashboard-data';

export function Panel({ title, description, action, children, className = '' }) {
  return <section className={`analytics-panel ${className}`}><header><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>{children}</section>;
}

export function Empty({ children }) {
  return <div className="analytics-empty"><span aria-hidden="true">○</span><p>{children}</p></div>;
}

export function TrendChart({ rows }) {
  const [selected, setSelected] = useState(null);
  if (!rows.length) return <Empty>Nenhuma sessão registrada neste período.</Empty>;
  const max = Math.max(...rows.flatMap((row) => [row.sessions, row.completed]), 1);
  const active = rows.find((row) => row.date === selected) || rows.at(-1);
  return <div className="analytics-trend">
    <div className="chart-legend"><span><i className="orange"/>Sessões</span><span><i className="green"/>Rotas concluídas</span></div>
    <div className="chart-plot"><div className="chart-axis"><span>{number(max)}</span><span>{number(Math.round(max / 2))}</span><span>0</span></div>
      <div className="chart-columns">{rows.map((row, index) => <button key={row.date} className={`chart-column ${active.date === row.date ? 'is-selected' : ''}`} onClick={() => setSelected(row.date)} onFocus={() => setSelected(row.date)} aria-label={`${shortDate(row.date)}: ${row.sessions} sessões e ${row.completed} rotas concluídas`}>
        <span className="chart-column-bars"><i style={{ height: `${row.sessions / max * 100}%` }}/><i style={{ height: `${row.completed / max * 100}%` }}/></span>
        <small>{rows.length <= 7 || index % 5 === 0 || index === rows.length - 1 ? shortDate(row.date) : '·'}</small>
      </button>)}</div>
    </div><div className="chart-readout"><b>{shortDate(active.date)}</b><span>{number(active.sessions)} sessões</span><span>{number(active.completed)} rotas concluídas</span></div>
  </div>;
}

const colors = ['#f17932', '#3c9376', '#7b8fcc', '#d5a648', '#9d78ad', '#79a6ad'];
export function CategoryChart({ products }) {
  const groups = Object.entries(products.reduce((result, item) => { result[item.category] = (result[item.category] || 0) + item.units; return result; }, {})).sort((a, b) => b[1] - a[1]);
  const total = groups.reduce((sum, item) => sum + item[1], 0);
  let start = 0;
  const stops = groups.map(([, value], index) => { const from = start; start += value / (total || 1) * 100; return `${colors[index % colors.length]} ${from}% ${start}%`; }).join(',');
  if (!total) return <Empty>Vendas por categoria disponíveis após integração com o PDV.</Empty>;
  return <div className="category-chart"><div className="category-donut" style={{ background: `conic-gradient(${stops})` }} role="img" aria-label={`${number(total)} unidades vendidas por categoria`}><div><strong>{number(total)}</strong><small>unidades</small></div></div><ul>{groups.map(([name, value], index) => <li key={name}><i style={{ background: colors[index % colors.length] }}/><span>{name}</span><b>{percent(value, total)}%</b><small>{number(value)} un.</small></li>)}</ul></div>;
}

export function Funnel({ data }) {
  const steps = [['Sessões iniciadas', data.sessions], ['Rotas calculadas', data.routesCalculated || 0], ['Rotas concluídas', data.completedRoutes]];
  const max = Math.max(...steps.map(([, count]) => count), 1);
  return <div className="journey-funnel">{steps.map(([label, count], index) => <div key={label}><div className="funnel-label"><span><i>{index + 1}</i>{label}</span><strong>{number(count)}</strong></div><div className="funnel-track"><span style={{ width: `${count / max * 100}%`, background: ['#f17932', '#ecad71', '#3c9376'][index] }}/></div>{index > 0 && <small>{percent(count, steps[index - 1][1])}% em relação à etapa anterior</small>}</div>)}</div>;
}

export function HourChart({ rows }) {
  if (!rows) return <Empty>Distribuição por horário ainda não disponível para eventos reais.</Empty>;
  const max = Math.max(...rows.flat(), 1);
  return <div className="hour-scroll"><div className="hour-grid"><span/>{Array.from({ length: 14 }, (_, index) => <small key={index}>{index + 8}h</small>)}{rows.map((row, day) => <div className="hour-weekday" key={day}><b>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][day]}</b>{row.map((value, hour) => <span key={hour} tabIndex={0} title={`${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][day]}, ${hour + 8}h: ${value} sessões`} aria-label={`${day + 1}º dia, ${hour + 8} horas: ${value} sessões`} style={{ background: `rgba(237, 115, 43, ${0.05 + value / max * 0.9})` }}>{value || '–'}</span>)}</div>)}</div></div>;
}

export function StoreHeatmap({ corridors, metric, selected, onSelect }) {
  const max = Math.max(...corridors.map((row) => row[metric] || 0), 1);
  const fmt = metric === 'revenue' ? currency : number;
  const unmapped = corridors.filter((row) => !INDOOR_CORRIDORS.some((corridor) => corridor.name.toLowerCase() === row.aisle.toLowerCase()));
  return <div className="store-heatmap">
    <svg viewBox="-10 -5 370 260" aria-label="Mapa esquemático dos cinco corredores da loja">
      <rect x="-9" y="-4" width="368" height="258" rx="14" fill="#f7f8f4" stroke="#dfe6dc"/>
      <text x="175" y="22" textAnchor="middle" className="map-caption">CIRCULAÇÃO</text>
      {INDOOR_CORRIDORS.map((corridor) => {
        const row = corridors.find((item) => item.aisle.toLowerCase() === corridor.name.toLowerCase());
        const value = row?.[metric] || 0;
        const width = corridor.maxX - corridor.minX - 8;
        return <g key={corridor.id} role="button" tabIndex={0} aria-label={`${corridor.name}: ${fmt(value)}. Abrir detalhes`} aria-pressed={selected === corridor.name} onClick={() => onSelect(corridor.name)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(corridor.name); } }} className="map-corridor">
          <title>{corridor.name}: {fmt(value)}</title><rect x={corridor.minX + 4} y="45" width={width} height="153" rx="10" fill={value ? `hsl(${45 - value / max * 30}, 87%, ${92 - value / max * 35}%)` : '#e8ece6'} stroke={selected === corridor.name ? '#263d32' : 'transparent'} strokeWidth="2"/>
          <text x={corridor.minX + 4 + width / 2} y="63" textAnchor="middle" className="map-code">{corridor.label}</text>
          <text transform={`translate(${corridor.minX + 4 + width / 2},125) rotate(-90)`} textAnchor="middle" className="map-value">{fmt(value)}</text>
        </g>;
      })}
      {INDOOR_SHELVES.map((shelf) => <g key={shelf.id}><rect x={shelf.left} y={shelf.top + 10} width={shelf.width} height={shelf.height - 15} rx="4" fill="#fff" stroke="#d7ded4"/><text x={shelf.left + shelf.width / 2} y="133" textAnchor="middle" className="map-shelf">{shelf.label}</text></g>)}
      <text x="22" y="230" className="map-caption">↑ ENTRADA</text><rect x="218" y="215" width="115" height="25" rx="5" fill="#e1e9de"/><text x="275" y="231" textAnchor="middle" className="map-caption">CAIXAS →</text>
    </svg>
    <div className="heat-legend"><span>0</span><i/><span>{fmt(max === 1 && !corridors.some((row) => row[metric]) ? 0 : max)}</span><small>Menor → maior intensidade</small></div>
    <p className="chart-note">Planta esquemática compartilhada com o app. Selecione um corredor para ver os detalhes.</p>
    {unmapped.length > 0 && <p className="chart-note">Fora desta planta: {unmapped.map((row) => `${row.aisle} (${fmt(row[metric])})`).join(', ')}.</p>}
  </div>;
}
