'use client';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { validateTest, hasBlockingErrors } from '@/lib/exam/contentValidator';
import ValidationIssuesList from './ValidationIssuesList';

// N-04 (Sprint 2, VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — "Speaking
// bo'limi + admin qo'shish/tahrirlash imkoni." Har ikkalasi ham (attempt
// olish pipeline'i, validatsiya) ALLAQACHON mavjud — yagona yetishmayotgan
// narsa shu yerda: mavjud (nashr qilingan bo'lishi mumkin!) testga
// `sections.speaking`ni qo'shish/tahrirlash uchun admin UI. `NewTestForm.jsx`
// faqat test YARATISHDA (Reading uchun) JSON import qiladi — bu yerda xuddi
// shu uslub (JSON-paste, sxema-shakl emas) mavjud testni PATCH qilish uchun
// takrorlanadi, chunki bu kodning o'rnatilgan konvensiyasi.
//
// `PATCH /api/admin/exam-tests/[id]` `sections`ni BUTUNLAY ALMASHTIRADI
// (deep-merge emas) — shuning uchun bu komponent HAR DOIM avval haqiqiy
// joriy `sections`ni (mount'da) GET qiladi va faqat `speaking`ni shu ustiga
// qo'yib PATCH qiladi, aks holda Reading/Listening/Writing kontenti
// tasodifan bo'sh bilan almashtirilib qo'yilishi mumkin edi.
const EXAMPLE_JSON = `{
  "durationSec": 780,
  "part1Questions": ["Question 1?", "Question 2?"],
  "part2CueCard": { "topic": "Describe a...", "bulletPoints": ["point 1", "point 2"], "prepSec": 60, "speakSec": 120 },
  "part3Questions": ["Question 1?", "Question 2?"]
}`;

export default function SpeakingSectionEditor({ testId, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [testMeta, setTestMeta] = useState(null); // { title, slug, sections }
  const [jsonText, setJsonText] = useState('');
  const [validated, setValidated] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveIssues, setSaveIssues] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    fetch(`/api/admin/exam-tests/${testId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (!data.test) {
          setLoadError(data.error || "Test topilmadi");
          return;
        }
        setTestMeta({ title: data.test.title, slug: data.test.slug, sections: data.test.sections || {} });
        const current = data.test.sections?.speaking;
        setJsonText(current ? JSON.stringify(current, null, 2) : EXAMPLE_JSON);
      })
      .catch((err) => {
        if (active) setLoadError(err.message || 'Yuklashda xatolik');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [testId]);

  const { parsedSpeaking, jsonParseError } = useMemo(() => {
    if (!jsonText.trim()) return { parsedSpeaking: null, jsonParseError: '' };
    try {
      return { parsedSpeaking: JSON.parse(jsonText), jsonParseError: '' };
    } catch (err) {
      return { parsedSpeaking: null, jsonParseError: err.message };
    }
  }, [jsonText]);

  const validationIssues = useMemo(() => {
    if (!validated || !testMeta || !parsedSpeaking) return [];
    const draft = {
      title: testMeta.title,
      slug: testMeta.slug,
      sections: { ...testMeta.sections, speaking: parsedSpeaking },
    };
    return validateTest(draft);
  }, [validated, testMeta, parsedSpeaking]);

  const runValidate = () => setValidated(true);

  // `validated` shart — aks holda foydalanuvchi "Tekshirish"ni bosmasdan
  // to'g'ridan-to'g'ri "Saqlash"ni bossa, `validationIssues` hali hisoblanmagan
  // ([] bo'lib qoladi) va tugma noto'g'ri yoqilib qolardi. Server (PATCH
  // /api/admin/exam-tests/[id]) ham mustaqil ravishda qayta tekshiradi —
  // bu shart faqat qulay UX oqimi uchun, yagona himoya emas.
  const canSave = validated && !!testMeta && !!parsedSpeaking && !jsonParseError && !hasBlockingErrors(validationIssues);

  const handleSave = async () => {
    if (!testMeta || !parsedSpeaking) return;
    setSaving(true);
    setSaveError('');
    setSaveIssues([]);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/exam-tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: { ...testMeta.sections, speaking: parsedSpeaking } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Xatolik');
        setSaveIssues(Array.isArray(data.issues) ? data.issues : []);
        return;
      }
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setSaveError(err.message || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-muted">
        <Loader2 size={14} className="animate-spin" /> Yuklanmoqda...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-1.5 py-2 text-xs text-danger">
        <AlertCircle size={13} /> {loadError}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg p-3 space-y-2">
      <p className="text-xs font-bold text-ink">Speaking bo&apos;limi (JSON)</p>
      <textarea
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setValidated(false);
          setSaved(false);
        }}
        placeholder={EXAMPLE_JSON}
        rows={12}
        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-base md:text-xs font-mono text-ink outline-none focus:border-accent resize-y"
      />
      {jsonParseError && <p className="text-xs text-danger">JSON xato: {jsonParseError}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runValidate}
          disabled={!parsedSpeaking}
          className="px-3 py-1.5 bg-surface hover:bg-primary-soft disabled:opacity-50 border border-border rounded-lg text-xs font-semibold text-ink transition-colors"
        >
          Tekshirish
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-lg text-xs font-semibold transition-colors"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Saqlash
        </button>
        {saved && <span className="text-xs font-semibold text-success">Saqlandi</span>}
      </div>

      {validated && (
        <div className="border-t border-border pt-2">
          <ValidationIssuesList issues={validationIssues} />
        </div>
      )}

      {saveError && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-danger break-words">{saveError}</p>
          {saveIssues.length > 0 && <ValidationIssuesList issues={saveIssues} />}
        </div>
      )}
    </div>
  );
}
