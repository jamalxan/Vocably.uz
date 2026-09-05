'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Recharts shu yerda import qilinadi — AdminActivity uni next/dynamic(ssr:false) orqali
// yuklaydi, ActivityChart.jsx (foydalanuvchi dashboard'i)dagi kabi.
function formatDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const reviews = payload.find((p) => p.dataKey === 'reviews')?.value ?? 0;
  const messages = payload.find((p) => p.dataKey === 'messages')?.value ?? 0;
  return (
    <div className="bg-primary text-on-primary text-xs rounded-lg px-3 py-2 shadow-card">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{reviews} so'z takrori</p>
      <p>{messages} xabar</p>
    </div>
  );
}

export default function ActivityTrendChart({ data }) {
  const chartData = data.map((d) => ({ ...d, label: formatDay(d.date) }));

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#D6CFCC" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B5B54' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#6B5B54' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(184,57,74,0.08)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === 'reviews' ? "So'z takrori" : 'Xabarlar')} />
          <Bar dataKey="reviews" stackId="a" fill="#B8394A" radius={[0, 0, 0, 0]} />
          <Bar dataKey="messages" stackId="a" fill="#D9A441" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
