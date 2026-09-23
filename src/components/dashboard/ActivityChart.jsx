'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Recharts shu yerda import qilinadi — DashboardHome bu komponentni next/dynamic(ssr:false)
// orqali yuklaydi, shunda grafik kutubxonasi faqat dashboard ochilganda yuklanadi (spec §11.3).
function formatDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { reviews, correct } = payload[0].payload;
  return (
    <div className="bg-primary text-on-primary text-xs rounded-lg px-3 py-2 shadow-card">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>
        {reviews} takror, {correct} to'g'ri
      </p>
    </div>
  );
}

export default function ActivityChart({ activity7, activity30 }) {
  const [range, setRange] = useState('7d');
  const data = (range === '7d' ? activity7 : activity30).map((d) => ({ ...d, label: formatDay(d.date) }));

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider">Faollik</p>
        <div className="flex gap-1 bg-bg rounded-lg p-0.5" role="group" aria-label="Davr">
          {[
            ['7d', '7 kun'],
            ['30d', '30 kun'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              aria-pressed={range === key}
              className={`px-3 md:px-2.5 py-1 min-h-9 md:min-h-0 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                range === key ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            {/* rgb(var(--color-x)) — globals.css tokenlariga ishora, hardcode-hex emas (§B2).
                CSS custom property bo'lgani uchun tema almashganda avtomatik yangilanadi. */}
            <CartesianGrid vertical={false} stroke="rgb(var(--color-border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'rgb(var(--color-muted))' }}
              axisLine={false}
              tickLine={false}
              interval={range === '30d' ? 3 : 0}
            />
            <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--color-muted))' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(var(--color-accent) / 0.08)' }} />
            <Bar dataKey="reviews" fill="rgb(var(--color-accent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
