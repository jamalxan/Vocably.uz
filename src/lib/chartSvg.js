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

// VOCABLY-TZ.md §2.3 auditi — Y o'qi ILGARI xom `maxVal`ning 0/50/100%
// nuqtalarida turardi (masalan "0% / 48% / 96%" kabi g'alati qadamlar),
// haqiqiy IELTS grafiklarida esa doim 0-20-40-60-80-100 kabi "chiroyli"
// qadamlar bo'ladi. `niceAxisMax` — klassik "nice numbers" algoritmi: berilgan
// qiymatdan katta yoki teng, 1/2/5×10^n ko'rinishidagi eng kichik sonni topadi
// (masalan 87 → 100, 34 → 40, 6 → 10) — shundan keyin 0/20/40/60/80/100%
// nuqtalari HAM doim butun son bo'ladi.
function niceAxisMax(rawMax) {
  if (rawMax <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  const normalized = rawMax / magnitude; // 1..10 oralig'ida
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

const Y_TICK_FRACTIONS = [0, 0.2, 0.4, 0.6, 0.8, 1];

function renderYAxisTicks({ niceMax, unit, chartH, padding }) {
  return Y_TICK_FRACTIONS.map((f) => {
    const val = Math.round(niceMax * f);
    const y = padding.top + chartH - chartH * f;
    return `<line x1="${padding.left}" y1="${y}" x2="${padding.left + WIDTH - padding.left - padding.right}" y2="${y}" stroke="#e5e5e5" />
<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#555">${val}${unit ? unit : ''}</text>`;
  }).join('');
}

// VOCABLY-TZ.md §2.3 auditi — "O'q nomlari (Age group, % of people) yo'q."
// Haqiqiy IELTS Task 1 grafiklarida ikkala o'q ham nomlanadi. `xAxisLabel`/
// `yAxisLabel` ixtiyoriy (eski chart ma'lumotlarida yo'q bo'lishi mumkin) —
// berilsa X o'qi labellaridan pastroqda markazda, Y o'qi esa -90° aylantirib
// chap chetda chiziladi.
function renderAxisLabels({ xAxisLabel, yAxisLabel, chartH, chartW, padding }) {
  let out = '';
  if (xAxisLabel) {
    const x = padding.left + chartW / 2;
    const y = padding.top + chartH + 34;
    out += `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" font-weight="bold" fill="#444">${escapeXml(xAxisLabel)}</text>`;
  }
  if (yAxisLabel) {
    const x = 14;
    const y = padding.top + chartH / 2;
    out += `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" font-weight="bold" fill="#444" transform="rotate(-90 ${x} ${y})">${escapeXml(yAxisLabel)}</text>`;
  }
  return out;
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

function renderBarChart({ title, unit, categories, series, xAxisLabel, yAxisLabel }) {
  const padding = { ...PADDING, bottom: PADDING.bottom + (xAxisLabel ? 14 : 0), left: PADDING.left + (yAxisLabel ? 12 : 0) };
  const chartH = HEIGHT - padding.top - padding.bottom;
  const chartW = WIDTH - padding.left - padding.right;
  const rawMax = Math.max(1, ...series.flatMap((s) => s.data));
  const niceMax = niceAxisMax(rawMax);
  const groupW = chartW / categories.length;
  const barW = Math.min(36, (groupW * 0.7) / series.length);

  const axis = `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#666" />
<line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="#666" />`;

  const yTicks = [renderYAxisTicks({ niceMax, unit, chartH, padding })];

  const bars = categories
    .map((cat, ci) => {
      const groupX = padding.left + ci * groupW + (groupW - barW * series.length) / 2;
      const barsForGroup = series
        .map((s, si) => {
          const val = s.data[ci] || 0;
          const h = (val / niceMax) * chartH;
          const x = groupX + si * barW;
          const y = padding.top + chartH - h;
          return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barW - 2).toFixed(1)}" height="${h.toFixed(1)}" fill="${GRAYS[si % GRAYS.length]}" />`;
        })
        .join('');
      const labelX = padding.left + ci * groupW + groupW / 2;
      return `${barsForGroup}<text x="${labelX}" y="${padding.top + chartH + 16}" text-anchor="middle" font-size="10" fill="#333">${escapeXml(cat)}</text>`;
    })
    .join('\n');

  const axisLabels = renderAxisLabels({ xAxisLabel, yAxisLabel, chartH, chartW, padding });

  return svgWrap(`${renderTitle(title, unit)}${yTicks.join('')}${axis}${bars}${axisLabels}${renderLegend(series)}`);
}

function renderLineChart({ title, unit, categories, series, xAxisLabel, yAxisLabel }) {
  const padding = { ...PADDING, bottom: PADDING.bottom + (xAxisLabel ? 14 : 0), left: PADDING.left + (yAxisLabel ? 12 : 0) };
  const chartH = HEIGHT - padding.top - padding.bottom;
  const chartW = WIDTH - padding.left - padding.right;
  const rawMax = Math.max(1, ...series.flatMap((s) => s.data));
  const niceMax = niceAxisMax(rawMax);
  const maxVal = niceMax;
  const stepX = categories.length > 1 ? chartW / (categories.length - 1) : chartW;

  const axis = `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#666" />
<line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="#666" />`;

  const yTicks = [renderYAxisTicks({ niceMax, unit, chartH, padding })];

  const xLabels = categories
    .map((cat, i) => `<text x="${padding.left + i * stepX}" y="${padding.top + chartH + 16}" text-anchor="middle" font-size="10" fill="#333">${escapeXml(cat)}</text>`)
    .join('');

  const lines = series
    .map((s, si) => {
      const points = s.data
        .map((val, i) => {
          const x = padding.left + i * stepX;
          const y = padding.top + chartH - (val / maxVal) * chartH;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
      const dots = s.data
        .map((val, i) => {
          const x = padding.left + i * stepX;
          const y = padding.top + chartH - (val / maxVal) * chartH;
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${GRAYS[si % GRAYS.length]}" />`;
        })
        .join('');
      return `<polyline points="${points}" fill="none" stroke="${GRAYS[si % GRAYS.length]}" stroke-width="2" />${dots}`;
    })
    .join('\n');

  const axisLabels = renderAxisLabels({ xAxisLabel, yAxisLabel, chartH, chartW, padding });

  return svgWrap(`${renderTitle(title, unit)}${yTicks.join('')}${axis}${xLabels}${lines}${axisLabels}${renderLegend(series)}`);
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
