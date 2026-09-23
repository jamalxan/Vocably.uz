'use client';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Save, DollarSign } from 'lucide-react';

// TZ-vocably-v2.md §11.5/§12 — "AI sozlamalari" ekrani: har taskKey uchun
// model + fallback + temperature + xarajat chegarasi, oylik xarajat.
//
// `GET /api/admin/ai/models` (OpenRouter'dan model ro'yxati) BU YERDA YO'Q —
// OpenRouter kaliti ulanmagan bu sessiyada, shuning uchun dropdown o'rniga
// oddiy matn maydoni (model ID'ni qo'lda kiritish, masalan
// "google/gemini-2.5-pro") — kalit ulanganda `/models` qo'shilib, matn
// maydoni dropdown'ga almashtirilishi mumkin, boshqa hech narsa
// o'zgarmaydi (worker/router.js allaqachon shu formatdagi model ID kutadi).
// UX-02 — `taskKey` (src/lib/contentAgent/aiRouter.js#DEFAULT_MODEL_MATRIX bilan
// bir xil ro'yxat) ilgari xom holicha ko'rsatilardi (masalan "book.segment"),
// admin uchun tushunarsiz edi. ExamTestsPanel'dagi RIGHTS_SOURCE_LABEL /
// ReviewQueuePanel'dagi REASON_LABEL bilan bir xil naqsh — texnik kalit
// pastda kichik matnda saqlanadi, ustida o'zbekcha izoh ko'rsatiladi.
const TASK_KEY_LABEL = {
  'book.segment': "Kitobni bo'laklash",
  'section.split': "Bo'limlarga ajratish",
  'reading.parse': "Reading savollarini o'qish",
  'listening.parse': 'Listening savollarini o\'qish',
  'writing.parse': 'Writing topshiriqlarini o\'qish',
  'speaking.parse': 'Speaking topshiriqlarini o\'qish',
  'answerkey.parse': "Javoblar kalitini o'qish",
  'image.classify': 'Rasmni tasniflash',
  'qa.validate': 'Sifat tekshiruvi (QA)',
  'writing.grade': 'Writing baholash',
  'speaking.grade': 'Speaking baholash',
};

export default function AiSettingsPanel() {
  const [configs, setConfigs] = useState([]);
  const [costs, setCosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saveErrors, setSaveErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, costsRes] = await Promise.all([
        fetch('/api/admin/ai/config'),
        fetch('/api/admin/ai/costs'),
      ]);
      const configData = await configRes.json();
      const costsData = await costsRes.json();
      if (configRes.ok) {
        setConfigs(configData.configs || []);
        setDrafts(Object.fromEntries((configData.configs || []).map((c) => [c.taskKey, { primary: c.primary, fallback: c.fallback.join(', '), temperature: c.temperature, maxTokens: c.maxTokens, costCapUsd: c.costCapUsd }])));
      }
      if (costsRes.ok) setCosts(costsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateDraft = (taskKey, field, value) => {
    setDrafts((prev) => ({ ...prev, [taskKey]: { ...prev[taskKey], [field]: value } }));
  };

  const save = async (taskKey) => {
    setSavingKey(taskKey);
    setSaveErrors((prev) => ({ ...prev, [taskKey]: '' }));
    try {
      const d = drafts[taskKey];
      const res = await fetch('/api/admin/ai/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskKey,
          primary: d.primary,
          fallback: d.fallback.split(',').map((s) => s.trim()).filter(Boolean),
          temperature: Number(d.temperature),
          maxTokens: Number(d.maxTokens),
          costCapUsd: Number(d.costCapUsd),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveErrors((prev) => ({ ...prev, [taskKey]: data.error || "Saqlab bo'lmadi" }));
        return;
      }
      await load();
    } catch {
      setSaveErrors((prev) => ({ ...prev, [taskKey]: "Tarmoq xatosi — qayta urinib ko'ring" }));
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
        <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink font-display">AI sozlamalari</h2>
        <p className="text-sm text-muted mt-1">Har bosqich uchun model, fallback zanjiri va xarajat chegarasi.</p>
      </div>

      {costs && (
        <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl text-sm">
          <DollarSign size={16} className="text-accent" />
          <span className="text-ink font-semibold">${costs.totalUsd.toFixed(2)}</span>
          <span className="text-muted">so'nggi 30 kunda ({costs.byTask.length} vazifa turi)</span>
        </div>
      )}

      <div className="space-y-2">
        {configs.map((c) => {
          const d = drafts[c.taskKey] || {};
          return (
            <div key={c.taskKey} className="px-4 py-3.5 bg-surface border border-border rounded-xl">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="text-sm font-semibold text-ink">{TASK_KEY_LABEL[c.taskKey] || c.taskKey}</span>
                <span className="text-[11px] text-muted font-mono break-all">{c.taskKey}</span>
                {c.isCustomised && <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-accent-soft text-accent">o'zgartirilgan</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <input
                  value={d.primary || ''}
                  onChange={(e) => updateDraft(c.taskKey, 'primary', e.target.value)}
                  placeholder="asosiy model"
                  aria-label={`${c.taskKey}: asosiy model`}
                  className="col-span-2 min-w-0 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-base md:text-xs text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
                />
                <input
                  value={d.fallback || ''}
                  onChange={(e) => updateDraft(c.taskKey, 'fallback', e.target.value)}
                  placeholder="fallback (vergul bilan)"
                  aria-label={`${c.taskKey}: fallback modellar (vergul bilan)`}
                  className="col-span-2 min-w-0 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-base md:text-xs text-ink outline-none focus:border-accent focus:ring-2 ring-accent/40"
                />
                <button
                  onClick={() => save(c.taskKey)}
                  disabled={savingKey === c.taskKey}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 px-2.5 py-1.5 min-h-11 md:min-h-0 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-lg text-xs font-semibold transition-colors"
                >
                  {savingKey === c.taskKey ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Saqlash
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <label className="text-[11px] text-muted flex flex-col gap-1">
                  temp
                  <input type="number" step="0.1" min="0" max="1" value={d.temperature ?? ''} onChange={(e) => updateDraft(c.taskKey, 'temperature', e.target.value)} className="w-full px-2 py-2.5 md:py-1 bg-bg border border-border rounded text-base md:text-xs text-ink outline-none focus:border-accent" />
                </label>
                <label className="text-[11px] text-muted flex flex-col gap-1">
                  maxTokens
                  <input type="number" value={d.maxTokens ?? ''} onChange={(e) => updateDraft(c.taskKey, 'maxTokens', e.target.value)} className="w-full px-2 py-2.5 md:py-1 bg-bg border border-border rounded text-base md:text-xs text-ink outline-none focus:border-accent" />
                </label>
                <label className="text-[11px] text-muted flex flex-col gap-1">
                  costCap $
                  <input type="number" step="0.05" value={d.costCapUsd ?? ''} onChange={(e) => updateDraft(c.taskKey, 'costCapUsd', e.target.value)} className="w-full px-2 py-2.5 md:py-1 bg-bg border border-border rounded text-base md:text-xs text-ink outline-none focus:border-accent" />
                </label>
              </div>
              {saveErrors[c.taskKey] && (
                <p role="alert" className="mt-2 text-xs text-danger">
                  {saveErrors[c.taskKey]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
