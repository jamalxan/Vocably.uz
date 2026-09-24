'use client';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, BarChart3, GraduationCap } from 'lucide-react';

// U-03 — IELTS skill kodlarini o'quv-panel uchun o'zbekcha nomlarga o'giradi
// (U-01 "ichki kalitlarni UI'dan olib tashlash" ruhida — xom `listening` emas).
const SKILL_LABEL = {
  listening: 'Tinglash',
  reading: "O'qish",
  writing: 'Yozish',
  speaking: 'Gapirish',
};

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em]">{children}</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

// UX-02 — `speed` (src/components/SpeedQuiz.jsx) ilgari bu ro'yxatda yo'q edi,
// shuning uchun xom holicha ("speed") chiqib qolardi; endi alohida yorliq bor
// (ilgari "Tezkor" `quiz` bilan bitta yorliqqa birlashtirilgan edi).
//
// U-02 — "Antonim jangi" (antonim/page.jsx), "Jumla quruvchi" (jumla-qurish/page.jsx)
// va "Kollokatsiya" (kollokatsiya/page.jsx) ilgari uchalasi ham `reviewWord(..., { mode: 'quiz' })`
// bilan chaqirilib, haqiqiy "Test" (TestMode.jsx) reviewlari bilan bitta `quiz` bucket'iga
// birlashib ketardi (shuning uchun eski label "Test/Yangi rejimlar" edi). Endi har biri
// o'z mode qiymati bilan yoziladi (navConfig.js'dagi mos menyu nomlari bilan), shu bo'yicha
// har biri alohida qator/bar sifatida ko'rinadi. Eski yozuvlar (bu o'zgarishdan oldingi
// ReviewEvent'lar) hali ham `quiz` ostida qoladi — migratsiya qilinmadi, chunki bu faqat
// yangi yozuvlarga tegishli, tarixiy audit ma'lumotini o'zgartirish shart emas.
const MODE_LABEL = {
  spaced: 'Bugungi takrorlash',
  flashcard: 'Kartochka',
  quiz: 'Test',
  speed: 'Tezkor test',
  typing: 'Yozish testi',
  matching: 'Juftlikni topish',
  listening: 'Tinglab yozish',
  cloze: 'Kontekstda tanish',
  antonim: 'Antonim jangi',
  sentence_builder: 'Jumla quruvchi',
  collocation: 'Kollokatsiya',
};

// VOCABLY-TZ.md §16 "O'quv analitikasi". src/app/api/admin/learning-analytics
// izohidagi kabi — retention egri chizig'i va kontent-sifat foizi FAZA1/3
// arxitektura qarorlari tufayli hozircha yo'q.
export default function AdminLearningAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/learning-analytics');
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Xatolik');
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }
  if (error) return <p className="text-sm text-danger text-center py-12">{error}</p>;

  return (
    <div className="space-y-10">
      <section>
        <SectionLabel>Qiyin so'zlar (eng ko'p leech)</SectionLabel>
        <p className="text-xs text-muted mb-4">
          Ko'p foydalanuvchida "leech" (8+ marta unutilgan) bo'lgan so'zlar — kontentni (misol/mnemonika) tuzatish signali.
        </p>
        {data.leechWords.length === 0 ? (
          <p className="text-sm text-muted">Hali leech so'z yo'q.</p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg text-[11px] font-semibold text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-4">So'z</th>
                    <th className="py-2.5 px-4">Foydalanuvchilar soni</th>
                    <th className="py-2.5 px-4">O'rtacha unutish</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leechWords.map((w) => (
                    <tr key={w.word} className="border-t border-border">
                      <td className="py-2.5 px-4 font-semibold text-ink font-word">{w.word}</td>
                      <td className="py-2.5 px-4 text-muted">{w.userCount}</td>
                      <td className="py-2.5 px-4 text-warning whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <AlertTriangle size={13} /> {w.avgLapses}×
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Rejim samaradorligi</SectionLabel>
        <p className="text-xs text-muted mb-4">Har rejimdagi to'g'ri javob foizi — ReviewEvent audit-logidan.</p>
        {data.modeStats.length === 0 ? (
          <p className="text-sm text-muted">Hali ma'lumot yo'q.</p>
        ) : (
          <div className="space-y-2.5">
            {data.modeStats.map((m) => (
              <div key={m.mode} className="rounded-xl bg-surface border border-border p-4 flex items-center gap-4">
                <BarChart3 size={16} className="text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-ink">{MODE_LABEL[m.mode] || m.mode}</span>
                    <span className="text-xs text-muted">{m.total} urinish</span>
                  </div>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${m.accuracy}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-accent tabular-nums w-14 text-right">{m.accuracy}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionLabel>IELTS bo'limlari bo'yicha natijalar</SectionLabel>
        <p className="text-xs text-muted mb-4">
          Har skill (L/R/W/S) bo'yicha o'rtacha band va baholangan urinishlar soni — barcha foydalanuvchilar.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(data.examSkillStats || []).map((s) => (
            <div key={s.skill} className="rounded-xl bg-surface border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={14} className="text-accent flex-shrink-0" />
                <span className="text-xs font-semibold text-ink">{SKILL_LABEL[s.skill] || s.skill}</span>
              </div>
              {s.count === 0 ? (
                <p className="text-xs text-muted">Ma'lumot yo'q</p>
              ) : (
                <>
                  <p className="text-2xl font-bold text-accent tabular-nums">{s.avgBand}</p>
                  <p className="text-[11px] text-muted mt-0.5">{s.count} baholangan urinish</p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Eng zaif savol turlari (IELTS, platforma-keng)</SectionLabel>
        <p className="text-xs text-muted mb-4">
          Barcha baholangan urinishlar bo'yicha savol turi aniqligi (eng pastidan) — kamida 2 ta savolli turlar.
        </p>
        {(data.examTypeStats || []).length === 0 ? (
          <p className="text-sm text-muted">Hali ma'lumot yo'q.</p>
        ) : (
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg text-[11px] font-semibold text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-4">Savol turi</th>
                    <th className="py-2.5 px-4">Savollar soni</th>
                    <th className="py-2.5 px-4">Aniqlik</th>
                  </tr>
                </thead>
                <tbody>
                  {data.examTypeStats.map((t) => (
                    <tr key={t.type} className="border-t border-border">
                      <td className="py-2.5 px-4 font-medium text-ink">{t.label}</td>
                      <td className="py-2.5 px-4 text-muted">{t.total}</td>
                      <td className="py-2.5 px-4 text-warning font-semibold tabular-nums">{t.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
