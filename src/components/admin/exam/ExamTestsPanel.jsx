'use client';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, BookOpen, Trash2, Eye, EyeOff, BarChart3, Copy } from 'lucide-react';
import NewTestForm from './NewTestForm';
import TestStats from './TestStats';

function SectionBadges({ test }) {
  return (
    <div className="flex gap-1">
      {test.hasReading && <span className="px-1.5 py-0.5 rounded bg-bg text-[10px] font-semibold text-muted">R</span>}
      {test.hasListening && <span className="px-1.5 py-0.5 rounded bg-bg text-[10px] font-semibold text-muted">L</span>}
      {test.hasWriting && <span className="px-1.5 py-0.5 rounded bg-bg text-[10px] font-semibold text-muted">W</span>}
    </div>
  );
}

export default function ExamTestsPanel({ token }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [statsFor, setStatsFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/exam-tests', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTests(data.tests || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublish = async (test) => {
    setBusyId(test.id);
    try {
      const res = await fetch(`/api/admin/exam-tests/${test.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isPublished: !test.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error + (data.issues ? '\n' + data.issues.map((i) => `- ${i.path}: ${i.message}`).join('\n') : ''));
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
      await fetch(`/api/admin/exam-tests/${test.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
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
    try {
      const res = await fetch(`/api/admin/exam-tests/${test.id}/duplicate`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Nusxalab bo'lmadi");
        return;
      }
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <NewTestForm token={token} onCreated={load} />

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
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{test.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted">{test.slug}</span>
                    <SectionBadges test={test} />
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        test.isPublished ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                      }`}
                    >
                      {test.isPublished ? 'Nashr qilingan' : 'Draft'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStatsFor(statsFor === test.id ? null : test.id)}
                  title="Statistika"
                  className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors"
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => togglePublish(test)}
                  disabled={busyId === test.id}
                  title={test.isPublished ? 'Draftga qaytarish' : 'Nashr qilish'}
                  className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors disabled:opacity-50"
                >
                  {test.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => duplicate(test)}
                  disabled={busyId === test.id}
                  title="Nusxalash"
                  className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors disabled:opacity-50"
                >
                  <Copy size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(test)}
                  disabled={busyId === test.id}
                  title="O'chirish"
                  className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {statsFor === test.id && (
                <div className="px-5 pb-4">
                  <TestStats token={token} testId={test.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
