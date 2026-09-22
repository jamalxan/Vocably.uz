'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchAttemptHistory } from '../state/attemptsApi';
import { QUESTION_TYPE_LABEL, meaningfulTypeAccuracy } from '@/lib/exam/analytics';
import type { TypeAccuracy } from '@/lib/exam/analytics';
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

// Chegaralar shunchaki namoyish uchun — "kuchli"/"zaif" deb belgilashdan oldin
// tur haqiqatan ham shu ikki tomondan biriga tegishli bo'lishi kerak (o'rtacha
// turlar hech qaysi ro'yxatga tushmaydi, bu ataylab shunday — hammasini
// "kuchli" yoki "zaif" deb majburlash yolg'on aniqlik beradi).
const STRONG_THRESHOLD = 0.7;
const WEAK_THRESHOLD = 0.5;
const MAX_LISTED = 3;

function accuracyBarColor(accuracy: number): string {
  if (accuracy >= STRONG_THRESHOLD) return 'bg-success';
  if (accuracy < WEAK_THRESHOLD) return 'bg-danger';
  return 'bg-accent';
}

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

function TypeRow({ type }: { type: TypeAccuracy }) {
  const pct = Math.round(type.accuracy * 100);
  return (
    <li>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-sm text-ink">{QUESTION_TYPE_LABEL[type.type]}</span>
        <span className="text-xs text-muted tabular-nums shrink-0">
          {type.correct}/{type.total} ({pct}%)
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full ${accuracyBarColor(type.accuracy)}`} style={{ width: `${pct}%` }} />
      </div>
    </li>
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

  const breakdown = meaningfulTypeAccuracy(perQuestion);
  const strong = breakdown.filter((t) => t.accuracy >= STRONG_THRESHOLD).slice(-MAX_LISTED).reverse();
  const weak = breakdown.filter((t) => t.accuracy < WEAK_THRESHOLD).slice(0, MAX_LISTED);
  const chartData = (history || [])
    .filter((h) => h[metric] != null)
    .map((h) => ({ ...h, label: formatDate(h.submittedAt), value: h[metric] }));

  if (breakdown.length === 0 && chartData.length < 2) return null;

  return (
    <div className="mt-6 space-y-4 text-left">
      {(strong.length > 0 || weak.length > 0) && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">Kuchli va zaif tomonlar</p>
          {weak.length > 0 && (
            <div>
              <p className="text-xs font-medium text-danger mb-1">Zaif tomonlar</p>
              <ul className="space-y-0.5">
                {weak.map((t) => (
                  <li key={t.type} className="text-sm text-ink flex items-baseline justify-between gap-2">
                    <span>{QUESTION_TYPE_LABEL[t.type]}</span>
                    <span className="text-xs text-muted tabular-nums shrink-0">
                      {t.correct}/{t.total} ({Math.round(t.accuracy * 100)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strong.length > 0 && (
            <div>
              <p className="text-xs font-medium text-success mb-1">Kuchli tomonlar</p>
              <ul className="space-y-0.5">
                {strong.map((t) => (
                  <li key={t.type} className="text-sm text-ink flex items-baseline justify-between gap-2">
                    <span>{QUESTION_TYPE_LABEL[t.type]}</span>
                    <span className="text-xs text-muted tabular-nums shrink-0">
                      {t.correct}/{t.total} ({Math.round(t.accuracy * 100)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {breakdown.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
            Savol turi bo&apos;yicha natija
          </p>
          <ul className="space-y-2.5">
            {breakdown.map((t) => (
              <TypeRow key={t.type} type={t} />
            ))}
          </ul>
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
