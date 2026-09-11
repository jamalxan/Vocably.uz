'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchAttemptHistory } from '../state/attemptsApi';
import { QUESTION_TYPE_LABEL, weakestType } from '@/lib/exam/analytics';
import type { AttemptResult, AttemptHistoryEntry } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 3 item 17 — "Natija analitikasi: zaif savol
// turlari, progress chart". SectionResult.tsx va MockResult.tsx ikkalasi ham
// shu bitta komponentni ishlatadi — faqat `metric` farq qiladi (bo'lim
// natijasi bo'lsa o'sha bo'limning bandi, mock bo'lsa umumiy band).
const METRIC_LABEL: Record<'overall' | 'listening' | 'reading' | 'writing', string> = {
  overall: 'Umumiy',
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
};

export interface ResultAnalyticsProps {
  perQuestion: AttemptResult['perQuestion'];
  metric: 'overall' | 'listening' | 'reading' | 'writing';
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: AttemptHistoryEntry & { label: string; value: number | null } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-primary text-on-primary text-xs rounded-lg px-3 py-2 shadow-card">
      <p className="font-semibold mb-0.5">{p.testTitle || 'Urinish'}</p>
      <p>{p.value != null ? p.value.toFixed(1) : '—'}</p>
    </div>
  );
}

export default function ResultAnalytics({ perQuestion, metric }: ResultAnalyticsProps) {
  const [history, setHistory] = useState<AttemptHistoryEntry[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchAttemptHistory()
      .then(({ history }) => {
        if (active) setHistory(history);
      })
      .catch(() => {
        if (active) setHistory([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const weakest = weakestType(perQuestion);
  const chartData = (history || [])
    .filter((h) => h[metric] != null)
    .map((h) => ({ ...h, label: formatDate(h.submittedAt), value: h[metric] }));

  if (!weakest && chartData.length < 2) return null;

  return (
    <div className="mt-6 space-y-4 text-left">
      {weakest && weakest.total >= 2 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Eng zaif savol turi</p>
          <p className="text-sm font-semibold text-ink">{QUESTION_TYPE_LABEL[weakest.type]}</p>
          <p className="text-xs text-muted mt-0.5 tabular-nums">
            {weakest.correct} / {weakest.total} to&apos;g&apos;ri ({Math.round(weakest.accuracy * 100)}%)
          </p>
        </div>
      )}

      {chartData.length >= 2 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
            {METRIC_LABEL[metric]} — oldingi urinishlar
          </p>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgb(var(--color-border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgb(var(--color-muted))' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: 'rgb(var(--color-muted))' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 9]}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgb(var(--color-accent) / 0.3)' }} />
                <Line type="monotone" dataKey="value" stroke="rgb(var(--color-accent))" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
