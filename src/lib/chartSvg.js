// TZ-vocably-v2.md §C3 F-W1 (BUG-014) — IELTS Writing Task 1 talab qiladigan
// grafik/jadvalni server tomonda chizadi. AI faqat STRUKTURALI ma'lumot qaytaradi
// (chartType/title/categories/series — src/app/api/writing/generate-prompt), bu
// modul o'sha ma'lumotdan haqiqiy vizual (SVG yoki jadval) yasaydi.
//
// Uslub ATAYLAB neytral — brend rangi (accent/primary) ISHLATILMAYDI. Haqiqiy IELTS
// imtihonida grafiklar oq fon + qora/kulrang chiziqlar bilan chiqadi, shuning uchun
// bu yerda ham xuddi shunday (TZ: "imtihondagidek"). Hech qanday tashqi charting
// kutubxonasi kerak emas — string-template asosidagi qo'lda chizilgan SVG.
//
// `chartType`: 'bar' | 'line' | 'pie' | 'table' hammasi to'liq chiziladi. 'process' va
// 'map' (jarayon diagrammasi / xarita) uchun to'liq chizma ATAYLAB qurilmagan — bu
// TZ'ning o'zi ham alohida murakkab ish sifatida belgilagan ko'lam (rasm/ikonka
// chizish, joylashuv geometriyasi); shu ikkalasi ham hozircha jadval ko'rinishida
// (labellangan qadamlar ro'yxati) ko'rsatiladi — kelgusi bosqichda haqiqiy diagramma/
// xarita chizuvchisiga almashtiriladi.

const WIDTH = 640;
const HEIGHT = 360;
const PADDING = { top: 32, right: 24, bottom: 56, left: 56 };
// Kulrang palitra — bir nechta seriyani farqlash uchun, hech qanday brend rangisiz.
const GRAYS = ['#3f3f3f', '#8a8a8a', '#b8b8b8', '#5c5c5c', '#a3a3a3'];

function escapeXml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

function svgWrap(inner, { width = WIDTH, height = HEIGHT } = {}) {
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
${inner}
</svg>`;
}

function renderTitle(title, unit) {
  const label = unit ? `${title} (${unit})` : title;
  return `<text x="${WIDTH / 2}" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a1a1a">${escapeXml(label)}</text>`;
}

function renderLegend(series) {
  if (series.length < 2) return '';
  const itemWidth = 120;
  const startX = WIDTH / 2 - (series.length * itemWidth) / 2;
  return series
    .map((s, i) => {
      const x = startX + i * itemWidth;
      const y = HEIGHT - 14;
      return `<rect x="${x}" y="${y - 9}" width="10" height="10" fill="${GRAYS[i % GRAYS.length]}" />
<text x="${x + 14}" y="${y}" font-size="11" fill="#333">${escapeXml(s.name)}</text>`;
    })
    .join('\n');
}

function renderBarChart({ title, unit, categories, series }) {
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const maxVal = Math.max(1, ...series.flatMap((s) => s.data));
  const groupW = chartW / categories.length;
  const barW = Math.min(36, (groupW * 0.7) / series.length);

  const axis = `<line x1="${PADDING.left}" y1="${PADDING.top}" x2="${PADDING.left}" y2="${PADDING.top + chartH}" stroke="#666" />
<line x1="${PADDING.left}" y1="${PADDING.top + chartH}" x2="${PADDING.left + chartW}" y2="${PADDING.top + chartH}" stroke="#666" />`;

  // Y o'qi belgilari (0, yarmi, maksimum) — gridline bilan.
  const yTicks = [0, 0.5, 1].map((f) => {
    const val = Math.round(maxVal * f);
    const y = PADDING.top + chartH - chartH * f;
    return `<line x1="${PADDING.left}" y1="${y}" x2="${PADDING.left + chartW}" y2="${y}" stroke="#e5e5e5" />
<text x="${PADDING.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#555">${val}${unit ? unit : ''}</text>`;
  });

  const bars = categories
    .map((cat, ci) => {
      const groupX = PADDING.left + ci * groupW + (groupW - barW * series.length) / 2;
      const barsForGroup = series
        .map((s, si) => {
          const val = s.data[ci] || 0;
          const h = (val / maxVal) * chartH;
          const x = groupX + si * barW;
          const y = PADDING.top + chartH - h;
          return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barW - 2).toFixed(1)}" height="${h.toFixed(1)}" fill="${GRAYS[si % GRAYS.length]}" />`;
        })
        .join('');
      const labelX = PADDING.left + ci * groupW + groupW / 2;
      return `${barsForGroup}<text x="${labelX}" y="${PADDING.top + chartH + 16}" text-anchor="middle" font-size="10" fill="#333">${escapeXml(cat)}</text>`;
    })
    .join('\n');

  return svgWrap(`${renderTitle(title, unit)}${yTicks.join('')}${axis}${bars}${renderLegend(series)}`);
}

function renderLineChart({ title, unit, categories, series }) {
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const maxVal = Math.max(1, ...series.flatMap((s) => s.data));
  const stepX = categories.length > 1 ? chartW / (categories.length - 1) : chartW;

  const axis = `<line x1="${PADDING.left}" y1="${PADDING.top}" x2="${PADDING.left}" y2="${PADDING.top + chartH}" stroke="#666" />
<line x1="${PADDING.left}" y1="${PADDING.top + chartH}" x2="${PADDING.left + chartW}" y2="${PADDING.top + chartH}" stroke="#666" />`;

  const yTicks = [0, 0.5, 1].map((f) => {
    const val = Math.round(maxVal * f);
    const y = PADDING.top + chartH - chartH * f;
    return `<line x1="${PADDING.left}" y1="${y}" x2="${PADDING.left + chartW}" y2="${y}" stroke="#e5e5e5" />
<text x="${PADDING.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#555">${val}${unit ? unit : ''}</text>`;
  });

  const xLabels = categories
    .map((cat, i) => `<text x="${PADDING.left + i * stepX}" y="${PADDING.top + chartH + 16}" text-anchor="middle" font-size="10" fill="#333">${escapeXml(cat)}</text>`)
    .join('');

  const lines = series
    .map((s, si) => {
      const points = s.data
        .map((val, i) => {
          const x = PADDING.left + i * stepX;
          const y = PADDING.top + chartH - (val / maxVal) * chartH;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
      const dots = s.data
        .map((val, i) => {
          const x = PADDING.left + i * stepX;
          const y = PADDING.top + chartH - (val / maxVal) * chartH;
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${GRAYS[si % GRAYS.length]}" />`;
        })
        .join('');
      return `<polyline points="${points}" fill="none" stroke="${GRAYS[si % GRAYS.length]}" stroke-width="2" />${dots}`;
    })
    .join('\n');

  return svgWrap(`${renderTitle(title, unit)}${yTicks.join('')}${axis}${xLabels}${lines}${renderLegend(series)}`);
}

function renderPieChart({ title, categories, series }) {
  const data = series[0]?.data || [];
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 + 6;
  const r = 110;
  let angle = -Math.PI / 2;

  const slices = data
    .map((val, i) => {
      const frac = val / total;
      const nextAngle = angle + frac * 2 * Math.PI;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(nextAngle);
      const y2 = cy + r * Math.sin(nextAngle);
      const largeArc = frac > 0.5 ? 1 : 0;
      const path = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
      const midAngle = (angle + nextAngle) / 2;
      const labelX = cx + (r + 22) * Math.cos(midAngle);
      const labelY = cy + (r + 22) * Math.sin(midAngle);
      const pct = Math.round(frac * 100);
      angle = nextAngle;
      return `<path d="${path}" fill="${GRAYS[i % GRAYS.length]}" stroke="#fff" stroke-width="1.5" />
<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="10" fill="#333">${escapeXml(categories[i] || '')} (${pct}%)</text>`;
    })
    .join('\n');

  return svgWrap(`${renderTitle(title)}${slices}`);
}

function renderTable({ title, unit, categories, series }) {
  const headerCells = series.map((s) => `<th style="border:1px solid #999;padding:6px 10px;background:#f2f2f2;text-align:right;">${escapeXml(s.name)}${unit ? ` (${escapeXml(unit)})` : ''}</th>`).join('');
  const rows = categories
    .map(
      (cat, ci) =>
        `<tr><td style="border:1px solid #999;padding:6px 10px;font-weight:600;">${escapeXml(cat)}</td>${series
          .map((s) => `<td style="border:1px solid #999;padding:6px 10px;text-align:right;">${s.data[ci] ?? ''}</td>`)
          .join('')}</tr>`
    )
    .join('');
  return `<div style="background:#fff;padding:12px;">
<p style="font-weight:bold;font-size:13px;margin:0 0 8px;color:#1a1a1a;">${escapeXml(title)}</p>
<table style="border-collapse:collapse;font-size:12px;color:#222;width:100%;">
<thead><tr><th style="border:1px solid #999;padding:6px 10px;background:#f2f2f2;"></th>${headerCells}</tr></thead>
<tbody>${rows}</tbody>
</table>
</div>`;
}

/**
 * `chart`: { chartType, title, unit?, categories: string[], series: [{ name, data: number[] }] }
 * Qaytaradi: SVG (bar/line/pie) yoki HTML jadval (table/process/map — pastga q.) satri —
 * ikkalasi ham to'g'ridan-to'g'ri `dangerouslySetInnerHTML` bilan ko'rsatilishi mumkin.
 */
export function renderChartSvg(chart) {
  if (!chart || !Array.isArray(chart.series) || chart.series.length === 0) return '';
  const categories = Array.isArray(chart.categories) ? chart.categories : [];
  const series = chart.series.map((s) => ({ name: s.name || '', data: Array.isArray(s.data) ? s.data.map(Number) : [] }));
  const normalized = { ...chart, categories, series };

  switch (chart.chartType) {
    case 'bar':
      return renderBarChart(normalized);
    case 'line':
      return renderLineChart(normalized);
    case 'pie':
      return renderPieChart(normalized);
    case 'table':
    case 'process':
    case 'map':
      // process/map: to'liq diagramma/xarita chizuvchisi hali qurilmagan (yuqoridagi
      // izohga q.) — hozircha bir xil jadval ko'rinishida.
      return renderTable(normalized);
    default:
      return renderTable(normalized);
  }
}
