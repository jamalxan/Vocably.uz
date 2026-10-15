'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useT } from '@/context/LocaleContext';

// Recharts shu yerda import qilinadi — DashboardHome bu komponentni next/dynamic(ssr:false)
// orqali yuklaydi, shunda grafik kutubxonasi faqat dashboard ochilganda yuklanadi (spec §11.3).
function formatDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function ChartTooltip({ active, payload, label }) {
  const { t } = useT();
  if (!active || !payload?.length) return null;
  const { reviews, correct } = payload[0].payload;
  return (
    <div className="bg-primary text-on-primary text-xs rounded-lg px-3 py-2 shadow-premium tabular-nums">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{t('dash.tooltip', { r: reviews, c: correct })}</p>
    </div>
  );
}

export default function ActivityChart({ activity7, activity30 }) {
  const { t } = useT();
  const [range, setRange] = useState('7d');
  const source = range === '7d' ? activity7 : activity30;
  const data = source.map((d) => ({ ...d, label: formatDay(d.date) }));
  const totalReviews = source.reduce((s, d) => s + (d.reviews || 0), 0);
  const totalCorrect = source.reduce((s, d) => s + (d.correct || 0), 0);
  const accuracy = totalReviews ? Math.round((totalCorrect / totalReviews) * 100) : null;
  const activeDays = source.filter((d) => d.reviews > 0).length;
  const lastIndex = data.length - 1;

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">{t('dash.activity')}</p>
          {/* Davr xulosasi — grafik ustunlarini sanamasdan ham "qancha qildim?"ga javob. */}
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs text-muted tabular-nums">
            <span>
              <span className="font-display text-lg font-bold text-ink">{totalReviews}</span> {t('dash.kpiTotal').toLowerCase()}
            </span>
            {accuracy != null && <span>{t('dash.kpiAccuracy', { n: accuracy })}</span>}
            <span>
              <span className="font-semibold text-ink">{activeDays}</span>/{source.length}
            </span>
          </p>
        </div>
        <div className="flex gap-1 bg-bg-sunken/70 border border-border/60 rounded-lg p-0.5 flex-shrink-0" role="group" aria-label={t('dash.period')}>
          {[
            ['7d', t('dash.range7')],
            ['30d', t('dash.range30')],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              aria-pressed={range === key}
              className={`px-3 md:px-2.5 py-1 min-h-9 md:min-h-0 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                range === key ? 'bg-accent text-on-accent shadow-glow' : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap={range === '7d' ? '28%' : '18%'}>
            {/* rgb(var(--color-x)) — globals.css tokenlariga ishora, hardcode-hex emas (§B2).
                CSS custom property bo'lgani uchun tema almashganda avtomatik yangilanadi. */}
            <CartesianGrid vertical={false} stroke="rgb(var(--color-border) / 0.7)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'rgb(var(--color-muted))' }}
              axisLine={false}
              tickLine={false}
              interval={range === '30d' ? 3 : 0}
            />
            <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--color-muted))' }} axisLine={false} tickLine={false} allowDecimals={false} width={44} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(var(--color-accent) / 0.08)', radius: 6 }} />
            <Bar dataKey="reviews" radius={[5, 5, 2, 2]} maxBarSize={38} isAnimationActive={false}>
              {/* Bugungi ustun to'liq accent, o'tganlar biroz yumshoqroq — "bugun" ko'zga tashlanadi. */}
              {data.map((d, i) => (
                <Cell key={d.date} fill={i === lastIndex ? 'rgb(var(--color-accent))' : 'rgb(var(--color-accent) / 0.62)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
