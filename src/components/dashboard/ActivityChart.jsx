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
    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
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
    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faollik</p>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[
            ['7d', '7 kun'],
            ['30d', '30 kun'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                range === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              interval={range === '30d' ? 3 : 0}
            />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#EEF2FF' }} />
            <Bar dataKey="reviews" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
