'use client';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Pause, Play, Save, Sparkles } from 'lucide-react';

const LEVELS = [
  { value: 'manual', label: "Qo'lda", hint: 'Hammasi admin tasdig‘i bilan (v1.0 asl xatti-harakat).' },
  { value: 'assisted', label: 'Yordamchi', hint: "AI o'zi bajaradi, nashrdan oldin admin'ga bildirishnoma yuboradi (tavsiya).", recommended: true },
  { value: 'autopilot', label: "To'liq avtopilot", hint: "Hammasi (nashr ham) odam aralashuvisiz — faqat blocker yoki xarajat chegarasi to'xtatadi." },
];

const ACTION_LABELS = {
  auto_accept: "Savol o'zi qabul qilindi",
  self_heal: "O'zi tuzatildi",
  auto_publish: "Test o'zi nashr qilindi",
  auto_mock_create: "Mock o'zi yaratildi",
  content_gap_detected: 'Kontent bo‘shlig‘i topildi',
  autopilot_paused_cost_cap: 'Xarajat chegarasi sababli to‘xtatildi',
  audio_boundary_auto_confirmed: 'Audio chegarasi avtomatik tasdiqlandi',
};

// docs/ai-content-agent-tz-avtopilot.md §7.1 — "AI sozlamalari" sahifasining
// uchinchi tabi. `agent_actions`/`AutomationPolicy` hali bo'sh bo'lishi
// mumkin (orchestrator qurilmagan — M2-M6 kutmoqda), shuning uchun bo'sh
// holat ("hali hech narsa yo'q") aniq ko'rsatiladi, xato sifatida emas.
export default function AutopilotPanel({ token }) {
  const [policy, setPolicy] = useState(null);
  const [draft, setDraft] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pausing, setPausing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [policyRes, summaryRes] = await Promise.all([
        fetch('/api/admin/automation/policy', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/agent-actions/summary', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const policyData = await policyRes.json();
      const summaryData = await summaryRes.json();
      if (policyRes.ok) {
        setPolicy(policyData.global);
        setDraft(policyData.global);
      }
      if (summaryRes.ok) setSummary(summaryData);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/automation/policy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          scope: 'global',
          level: draft.level,
          autoAcceptConfidence: Number(draft.autoAcceptConfidence),
          autoPublishMinQaScore: Number(draft.autoPublishMinQaScore),
          autoSelfHealMaxAttempts: Number(draft.autoSelfHealMaxAttempts),
          autoMockGeneration: !!draft.autoMockGeneration,
          autoContentGapScan: !!draft.autoContentGapScan,
          maxAutonomousCostUsdPerDay: Number(draft.maxAutonomousCostUsdPerDay),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPolicy(data.policy);
        setDraft(data.policy);
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePause = async () => {
    setPausing(true);
    try {
      const url = policy?.paused ? '/api/admin/automation/resume' : '/api/admin/automation/pause';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: 'admin_manual' }),
      });
      const data = await res.json();
      if (res.ok) {
        setPolicy(data.policy);
        setDraft(data.policy);
      }
    } finally {
      setPausing(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
        <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {policy?.paused && (
        <div className="flex items-start gap-2 px-4 py-3 bg-danger/10 border border-danger/30 rounded-xl text-sm text-danger">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Avtopilot to'xtatilgan</p>
            <p className="text-xs mt-0.5 opacity-90">
              Sabab: {policy.pausedReason || "admin_manual"}
              {policy.pausedAt && ` — ${new Date(policy.pausedAt).toLocaleString('uz-UZ')}`}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 py-3.5 bg-surface border border-border rounded-xl">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2.5">Avtomatlashtirish darajasi</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, level: lvl.value }))}
              className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
                draft.level === lvl.value ? 'border-accent bg-accent-soft' : 'border-border hover:border-accent/40'
              }`}
            >
              <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                {lvl.label}
                {lvl.recommended && <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-on-accent">tavsiya</span>}
              </p>
              <p className="text-[11px] text-muted mt-1 leading-snug">{lvl.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3.5 bg-surface border border-border rounded-xl">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2.5">Chegaralar</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumberField label="Avto-qabul ishonchi" value={draft.autoAcceptConfidence} onChange={(v) => setDraft((d) => ({ ...d, autoAcceptConfidence: v }))} step={0.01} min={0} max={1} />
          <NumberField label="Avto-nashr QA bali" value={draft.autoPublishMinQaScore} onChange={(v) => setDraft((d) => ({ ...d, autoPublishMinQaScore: v }))} step={0.01} min={0} max={1} />
          <NumberField label="Self-heal urinishlar" value={draft.autoSelfHealMaxAttempts} onChange={(v) => setDraft((d) => ({ ...d, autoSelfHealMaxAttempts: v }))} step={1} min={0} max={10} />
          <NumberField label="Kunlik xarajat $ chegarasi" value={draft.maxAutonomousCostUsdPerDay} onChange={(v) => setDraft((d) => ({ ...d, maxAutonomousCostUsdPerDay: v }))} step={1} min={0} />
        </div>
        <div className="flex items-center justify-end mt-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-lg text-xs font-semibold transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Saqlash
          </button>
        </div>
      </div>

      <div className="px-4 py-3.5 bg-surface border border-border rounded-xl">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
          <Sparkles size={12} className="text-accent" /> Bugungi AI faoliyati
        </p>
        {summary && summary.totalActions > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.byAction).map(([action, count]) => (
              <span key={action} className="px-2.5 py-1 rounded-lg bg-bg text-xs text-ink">
                <span className="font-semibold">{count}</span> {ACTION_LABELS[action] || action}
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-lg bg-bg text-xs text-muted font-mono">${summary.costUsdToday.toFixed(4)}</span>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Hali hech narsa yo'q — orchestrator (pipeline avtomatik bosqichlari) hali qurilmagan, shuning uchun bu yerda ko'rsatiladigan real harakat yo'q.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={togglePause}
        disabled={pausing}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
          policy?.paused ? 'bg-success text-on-accent hover:opacity-90' : 'bg-danger text-on-accent hover:opacity-90'
        }`}
      >
        {pausing ? <Loader2 size={16} className="animate-spin" /> : policy?.paused ? <Play size={16} /> : <Pause size={16} />}
        {policy?.paused ? 'Avtopilotni davom ettirish' : "Avtopilotni to'xtatish"}
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange, step, min, max }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted">{label}</span>
      <input
        type="number"
        value={value ?? ''}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-2.5 py-1.5 bg-bg rounded-lg text-xs text-ink outline-none focus:ring-2 ring-accent/40"
      />
    </label>
  );
}
