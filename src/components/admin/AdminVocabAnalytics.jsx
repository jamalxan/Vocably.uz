'use client';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, Gamepad2 } from 'lucide-react';

const GAME_LABEL = {
  word_match: "So'z juftligi",
  memory: 'Xotira kartalari',
  multiple_choice: 'Ko\'p variantli test',
  listen_choose: 'Eshiting va tanlang',
  listen_type: 'Eshiting va yozing',
  word_drop: "So'z yomg'iri",
  fill_gap: "Bo'sh joyni to'ldiring",
  sentence_builder: 'Jumla quruvchi',
  definition_challenge: "Ta'rif → so'z",
  synonym_antonym: 'Sinonim / Antonim',
  speed_challenge: 'Tezlik sinovi',
  image_to_word: "Rasm → so'z",
  word_to_image: "So'z → rasm",
  vocabulary_boss: 'Vocabulary Boss',
};

function Stat({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <p className="text-2xl font-bold text-ink font-display tabular-nums">{value ?? '—'}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted/80 mt-0.5">{sub}</p>}
    </div>
  );
}

const pct = (v) => (v == null ? '—' : `${v}%`);

// TZ §34 — Admin: eng qiyin/eng ko'p xato qilingan so'zlar, o'yinlar bo'yicha tugatish/tark etish, aniqlik,
// DAU/WAU, kvest va streak retention, AI ishlatilishi. Barchasi yig'ma (anonim) — shaxsiy ma'lumot yo'q (TZ §36).
export default function AdminVocabAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/admin/vocab-analytics?days=${days}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Xatolik');
        if (!cancelled) {
          setData(json);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }
  if (error && !data) {
    return (
      <div role="alert" className="flex items-center gap-2 text-danger bg-danger-soft border border-danger/30 rounded-xl px-4 py-3 text-sm">
        <AlertTriangle size={16} /> {error}
      </div>
    );
  }

  const g = data.games;
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink font-display flex items-center gap-2">
          <Gamepad2 size={20} className="text-accent" /> Lug'at o'yinlari analitikasi
        </h1>
        <div role="group" aria-label="Davr" className="inline-flex rounded-xl border border-border overflow-hidden">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${days === d ? 'bg-accent-soft text-accent-hover' : 'bg-surface text-muted hover:bg-bg-sunken'}`}
            >
              {d} kun
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="DAU (bugun)" value={data.users.dau} sub={`WAU: ${data.users.wau}`} />
        <Stat label="Boshlangan o'yinlar" value={g.started} sub={`Yakunlangan: ${g.completed}`} />
        <Stat label="Tugatish ulushi" value={pct(g.completionRate)} />
        <Stat label="O'rtacha aniqlik" value={pct(g.avgAccuracy)} sub={g.avgResponseMs ? `O'rtacha javob: ${(g.avgResponseMs / 1000).toFixed(1)} s` : null} />
      </div>

      {data.funnel && (
        <section aria-label="Ro'yxatdan o'tish voronkasi">
          <h2 className="text-sm font-semibold text-ink mb-2">Yangi foydalanuvchilar voronkasi ({data.range} kun)</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Ro'yxatdan o'tganlar" value={data.funnel.signups} />
            <Stat label="24 soatda birinchi o'yin" value={pct(data.funnel.firstGame24hRate)} sub={`${data.funnel.firstGame24h} / ${data.funnel.signups}`} />
            <Stat label="1-kun qaytish (D1)" value={pct(data.funnel.d1.rate)} sub={`${data.funnel.d1.retained} / ${data.funnel.d1.eligible}`} />
            <Stat label="7-kun qaytish (D7)" value={pct(data.funnel.d7.rate)} sub={`${data.funnel.d7.retained} / ${data.funnel.d7.eligible}`} />
          </div>
          <p className="text-[11px] text-muted mt-1.5">Qaytish — ro&apos;yxatdan o&apos;tgandan N·24 soat o&apos;tib, keyingi 24 soat ichida o&apos;yin yoki takrorlash. Oynasi tugamagan foydalanuvchilar hisobga olinmaydi.</p>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-ink mb-2">O'yinlar bo'yicha</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="px-4 py-2 font-medium">O'yin</th>
                <th className="px-4 py-2 font-medium text-right">Boshlangan</th>
                <th className="px-4 py-2 font-medium text-right">Tugatgan</th>
                <th className="px-4 py-2 font-medium text-right">Tark etilgan</th>
              </tr>
            </thead>
            <tbody>
              {g.byGame.map((r) => (
                <tr key={r.key} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-ink">{GAME_LABEL[r.key] || r.key}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.started}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {r.completed} <span className="text-muted">({pct(r.completionRate)})</span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {r.abandoned + r.active} <span className="text-muted">({pct(r.abandonRate)})</span>
                  </td>
                </tr>
              ))}
              {g.byGame.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    Bu davrda o'yin yo'q.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-ink mb-2">Eng ko'p xato qilingan so'zlar</h2>
          {data.words.mostFailed.length ? (
            <ol className="grid gap-1.5 text-sm">
              {data.words.mostFailed.map((w) => (
                <li key={w.word} className="flex items-center justify-between gap-2">
                  <span className="text-ink truncate">{w.word}</span>
                  <span className="text-xs text-muted tabular-nums whitespace-nowrap">
                    {w.failRate}% xato · {w.attempts} urinish
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">Hali yetarli ma'lumot yo'q (kamida 5 ta urinish kerak).</p>
          )}
        </section>

        <section className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-ink mb-2">Vazifalar, seriya va yaxlitlik</h2>
          <dl className="grid gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Kunlik vazifa bajarilishi</dt>
              <dd className="tabular-nums text-ink">{pct(data.quests.daily?.rate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Haftalik vazifa bajarilishi</dt>
              <dd className="tabular-nums text-ink">{pct(data.quests.weekly?.rate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Faol foydalanuvchilar (7 kun)</dt>
              <dd className="tabular-nums text-ink">{data.streakRetention.active}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Seriya ≥ 3 / ≥ 7 / ≥ 30 kun</dt>
              <dd className="tabular-nums text-ink">
                {data.streakRetention.ge3} / {data.streakRetention.ge7} / {data.streakRetention.ge30}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shubhali sessiyalar</dt>
              <dd className="tabular-nums text-ink">{data.integrity.flaggedSessions}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Kunlik XP chegarasiga yaqin</dt>
              <dd className="tabular-nums text-ink">{data.integrity.usersNearDailyXpCap}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">AI chaqiruvlari</dt>
              <dd className="tabular-nums text-ink">{data.ai.calls ?? '—'}</dd>
            </div>
          </dl>
        </section>
      </div>

      {(g.mostSuccessful.length > 0 || g.mostAbandoned.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <section className="bg-surface border border-border rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-ink mb-2">Eng muvaffaqiyatli o'yinlar</h2>
            <ul className="grid gap-1">
              {g.mostSuccessful.map((r) => (
                <li key={r.key} className="flex justify-between">
                  <span>{GAME_LABEL[r.key] || r.key}</span>
                  <span className="tabular-nums text-muted">{pct(r.completionRate)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-surface border border-border rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-ink mb-2">Eng ko'p tark etilgan o'yinlar</h2>
            <ul className="grid gap-1">
              {g.mostAbandoned.map((r) => (
                <li key={r.key} className="flex justify-between">
                  <span>{GAME_LABEL[r.key] || r.key}</span>
                  <span className="tabular-nums text-muted">{pct(r.abandonRate)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
