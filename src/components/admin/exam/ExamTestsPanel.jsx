'use client';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, BookOpen, Trash2, Eye, EyeOff, BarChart3, Copy, Mic } from 'lucide-react';
import NewTestForm from './NewTestForm';
import TestStats from './TestStats';
import SpeakingSectionEditor from './SpeakingSectionEditor';
import ValidationIssuesList from './ValidationIssuesList';

function SectionBadges({ test }) {
  return (
    <div className="flex gap-1 flex-shrink-0">
      {test.hasReading && <span className="px-1.5 py-0.5 rounded bg-bg text-[11px] leading-none font-semibold text-muted">R</span>}
      {test.hasListening && <span className="px-1.5 py-0.5 rounded bg-bg text-[11px] leading-none font-semibold text-muted">L</span>}
      {test.hasWriting && <span className="px-1.5 py-0.5 rounded bg-bg text-[11px] leading-none font-semibold text-muted">W</span>}
      {test.hasSpeaking && <span className="px-1.5 py-0.5 rounded bg-bg text-[11px] leading-none font-semibold text-muted">S</span>}
    </div>
  );
}

// AUDIT EX-06/N-06 (Sprint 1) — `isMockEligible` (computed at publish time by
// `contentValidator.ts#checkMockEligibility`) tells admin at a glance whether
// this test can be served by the random-mock picker, or is only good for
// standalone section practice.
function MockEligibilityBadge({ test }) {
  return (
    <span
      className={`flex-shrink-0 text-[11px] leading-none font-semibold px-1.5 py-0.5 rounded ${
        test.isMockEligible ? 'bg-success-soft text-success' : 'bg-bg text-muted'
      }`}
    >
      {test.isMockEligible ? 'Mock' : 'Mini practice'}
    </span>
  );
}

// AUDIT N-12 (Sprint 1) — small secondary badge for `rights.sourceType`, kept
// deliberately low-key: this is informational metadata, not a publish gate
// (the real gate — third_party_copyright + public — is `checkCopyright` in
// contentValidator.ts, unchanged here).
const RIGHTS_SOURCE_LABEL = {
  own: "O'ziniki",
  licensed: 'Litsenziyalangan',
  public_domain: 'Ommaviy domen',
  third_party_copyright: 'Uchinchi tomon',
  ai_generated_original: 'AI generatsiya',
};

function RightsBadge({ test }) {
  const sourceType = test.rights?.sourceType;
  if (!sourceType) return null;
  return (
    <span className="flex-shrink-0 text-[11px] leading-none font-semibold px-1.5 py-0.5 rounded bg-bg text-muted">
      {RIGHTS_SOURCE_LABEL[sourceType] || sourceType}
    </span>
  );
}

export default function ExamTestsPanel() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [statsFor, setStatsFor] = useState(null);
  const [speakingEditorFor, setSpeakingEditorFor] = useState(null);
  // Qator ostida ko'rsatiladigan xato (alert() o'rniga): { id, message, issues }
  const [rowError, setRowError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/exam-tests');
      const data = await res.json();
      if (res.ok) setTests(data.tests || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublish = async (test) => {
    setBusyId(test.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/exam-tests/${test.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !test.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRowError({ id: test.id, message: data.error || 'Xatolik', issues: Array.isArray(data.issues) ? data.issues : [] });
        return;
      }
      load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (test) => {
    if (!confirm(`"${test.title}" testini o'chirishni tasdiqlaysizmi? Bu qaytarib bo'lmaydi.`)) return;
    setBusyId(test.id);
    try {
      await fetch(`/api/admin/exam-tests/${test.id}`, { method: 'DELETE' });
      load();
    } finally {
      setBusyId(null);
    }
  };

  // TZ-vocably-v2.md §12 — "POST /api/admin/exam-tests/:id/duplicate."
  // Nusxa har doim draft — admin uni asos qilib tez yangi variant yasashi
  // uchun (masalan bitta savolni almashtirib, boshqa test sifatida nashr
  // qilish).
  const duplicate = async (test) => {
    setBusyId(test.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/exam-tests/${test.id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setRowError({ id: test.id, message: data.error || "Nusxalab bo'lmadi", issues: [] });
        return;
      }
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <NewTestForm onCreated={load} />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-accent" size={22} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2">
            <BookOpen size={15} className="text-accent" />
            <p className="text-sm font-bold text-ink">Testlar ({tests.length})</p>
          </div>
          {tests.length === 0 && <p className="px-5 py-6 text-sm text-muted text-center">Hali test yo&apos;q.</p>}
          {tests.map((test) => (
            <div key={test.id}>
              <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p title={test.title} className="text-sm font-semibold text-ink truncate">{test.title}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                    <span title={test.slug} className="text-[11px] text-muted truncate min-w-0 max-w-full">{test.slug}</span>
                    <SectionBadges test={test} />
                    <span
                      className={`flex-shrink-0 text-[11px] leading-none font-semibold px-1.5 py-0.5 rounded ${
                        test.isPublished ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                      }`}
                    >
                      {test.isPublished ? 'Nashr qilingan' : 'Draft'}
                    </span>
                    <MockEligibilityBadge test={test} />
                    <RightsBadge test={test} />
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-3 -ml-2 sm:ml-0 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setStatsFor(statsFor === test.id ? null : test.id)}
                    title="Statistika"
                    aria-label="Statistika"
                    aria-expanded={statsFor === test.id}
                    className="p-2 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors"
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeakingEditorFor(speakingEditorFor === test.id ? null : test.id)}
                    title="Speaking bo'limi"
                    aria-label="Speaking bo'limi"
                    aria-expanded={speakingEditorFor === test.id}
                    className="p-2 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors"
                  >
                    <Mic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublish(test)}
                    disabled={busyId === test.id}
                    title={test.isPublished ? 'Draftga qaytarish' : 'Nashr qilish'}
                    aria-label={test.isPublished ? 'Draftga qaytarish' : 'Nashr qilish'}
                    className="p-2 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors disabled:opacity-50"
                  >
                    {test.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicate(test)}
                    disabled={busyId === test.id}
                    title="Nusxalash"
                    aria-label="Nusxalash"
                    className="p-2 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors disabled:opacity-50"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(test)}
                    disabled={busyId === test.id}
                    title="O'chirish"
                    aria-label="O'chirish"
                    className="p-2 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {rowError?.id === test.id && (
                <div role="alert" className="mx-4 sm:mx-5 mb-3 px-3 py-2.5 rounded-lg bg-danger-soft space-y-1.5">
                  <p className="text-xs font-semibold text-danger break-words">{rowError.message}</p>
                  {rowError.issues.length > 0 && <ValidationIssuesList issues={rowError.issues} />}
                </div>
              )}
              {statsFor === test.id && (
                <div className="px-4 sm:px-5 pb-4">
                  <TestStats testId={test.id} />
                </div>
              )}
              {speakingEditorFor === test.id && (
                <div className="px-4 sm:px-5 pb-4">
                  <SpeakingSectionEditor
                    testId={test.id}
                    onSaved={() => {
                      load();
                      setSpeakingEditorFor(null);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
