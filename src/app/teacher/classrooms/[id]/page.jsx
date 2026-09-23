'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, UserPlus, X, Plus } from 'lucide-react';

const SECTION_LABELS = {
  listening: 'Tinglash',
  reading: 'Oqish',
  writing: 'Yozish',
  speaking: 'Gapirish',
  mock: "To'liq mock",
};

const STATUS_META = {
  not_started: { label: 'Boshlanmagan', className: 'bg-bg border border-border text-muted' },
  in_progress: { label: 'Jarayonda', className: 'bg-accent-soft border border-accent/25 text-accent' },
  graded: { label: 'Baholangan', className: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600' },
};

export default function TeacherClassroomPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentError, setStudentError] = useState('');

  const [testId, setTestId] = useState('');
  const [sectionKey, setSectionKey] = useState('mock');
  const [dueAt, setDueAt] = useState('');
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');

  const loadClassroom = useCallback(async () => {
    const res = await fetch(`/api/teacher/classrooms/${id}`);
    const data = await res.json();
    if (res.ok) setClassroom(data.classroom);
  }, [id]);

  const loadAssignments = useCallback(async () => {
    const res = await fetch(`/api/teacher/classrooms/${id}/assignments`);
    const data = await res.json();
    if (res.ok) setAssignments(data.assignments || []);
  }, [id]);

  const loadTests = useCallback(async () => {
    // TCH-01/02 — mavjud admin endpoint qayta ishlatiladi (teacher uchun
    // faqat nashr qilingan testlar qaytadi, src/app/api/admin/exam-tests
    // GET'dagi izohga q.).
    const res = await fetch('/api/admin/exam-tests');
    const data = await res.json();
    if (res.ok) setTests(data.tests || []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadClassroom(), loadAssignments(), loadTests()]);
      setLoading(false);
    })();
  }, [loadClassroom, loadAssignments, loadTests]);

  const addStudent = async (e) => {
    e.preventDefault();
    const uname = username.trim().toLowerCase();
    if (!uname) return;
    setAddingStudent(true);
    setStudentError('');
    try {
      const res = await fetch(`/api/teacher/classrooms/${id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStudentError(data.error || 'Xatolik');
        return;
      }
      setUsername('');
      await Promise.all([loadClassroom(), loadAssignments()]);
    } finally {
      setAddingStudent(false);
    }
  };

  const removeStudent = async (studentId) => {
    if (!confirm("O'quvchini sinfdan olib tashlaysizmi?")) return;
    await fetch(`/api/teacher/classrooms/${id}/students/${studentId}`, { method: 'DELETE' });
    await Promise.all([loadClassroom(), loadAssignments()]);
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    if (!testId) {
      setAssignmentError('Test tanlang');
      return;
    }
    setCreatingAssignment(true);
    setAssignmentError('');
    try {
      const res = await fetch(`/api/teacher/classrooms/${id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, sectionKey, dueAt: dueAt || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssignmentError(data.error || 'Xatolik');
        return;
      }
      setTestId('');
      setDueAt('');
      await loadAssignments();
    } finally {
      setCreatingAssignment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (!classroom) {
    return <p className="text-center text-sm text-muted py-10">Sinf topilmadi</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-luxury text-2xl text-ink mb-1">{classroom.name}</h2>
        <p className="text-sm text-muted">{classroom.students.length} o'quvchi</p>
      </div>

      {/* O'quvchilar */}
      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4">
        <h3 className="font-semibold text-ink">O'quvchilar</h3>
        <form onSubmit={addStudent} className="flex flex-col sm:flex-row gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username orqali qo'shish"
            aria-label="O'quvchi username'i"
            className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-xl text-base md:text-sm text-ink placeholder:text-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          />
          <button
            type="submit"
            disabled={addingStudent || !username.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 bg-accent text-on-accent rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {addingStudent ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            Qo'shish
          </button>
        </form>
        {studentError && <p className="text-sm text-red-500">{studentError}</p>}

        {classroom.students.length === 0 ? (
          <p className="text-sm text-muted">Hali o'quvchi yo'q</p>
        ) : (
          <ul className="divide-y divide-border">
            {classroom.students.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{s.name || s.username}</p>
                  <p className="text-xs text-muted">@{s.username}</p>
                </div>
                <button
                  onClick={() => removeStudent(s.id)}
                  aria-label={`${s.username}ni sinfdan olib tashlash`}
                  className="p-2 min-w-11 min-h-11 flex items-center justify-center text-muted hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Topshiriqlar */}
      <section className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4">
        <h3 className="font-semibold text-ink">Topshiriqlar</h3>
        <form onSubmit={createAssignment} className="grid gap-3 sm:grid-cols-3">
          <select
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            aria-label="Test tanlash"
            className="px-3 py-2.5 min-h-11 bg-bg border border-border rounded-xl text-sm text-ink outline-none focus:border-accent transition-colors"
          >
            <option value="">Test tanlang...</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <select
            value={sectionKey}
            onChange={(e) => setSectionKey(e.target.value)}
            aria-label="Bo'lim tanlash"
            className="px-3 py-2.5 min-h-11 bg-bg border border-border rounded-xl text-sm text-ink outline-none focus:border-accent transition-colors"
          >
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              aria-label="Muddat (ixtiyoriy)"
              className="flex-1 px-3 py-2.5 min-h-11 bg-bg border border-border rounded-xl text-sm text-ink outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={creatingAssignment || !testId}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-11 bg-accent text-on-accent rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {creatingAssignment ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            </button>
          </div>
        </form>
        {assignmentError && <p className="text-sm text-red-500">{assignmentError}</p>}
        {tests.length === 0 && <p className="text-xs text-muted">Hozircha nashr qilingan test yo'q</p>}

        {assignments.length === 0 ? (
          <p className="text-sm text-muted">Hali topshiriq yo'q</p>
        ) : (
          <div className="space-y-5">
            {assignments.map((a) => (
              <div key={a.id} className="rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-bg/60">
                  <p className="text-sm font-medium text-ink">{a.testTitle || 'Test'}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {SECTION_LABELS[a.sectionKey]}
                    {a.dueAt ? ` · muddat: ${new Date(a.dueAt).toLocaleDateString('uz-UZ')}` : ''}
                  </p>
                </div>
                {a.students.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-muted">Sinfda o'quvchi yo'q</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] text-accent uppercase tracking-[0.1em] border-t border-border">
                          <th className="px-4 py-2 font-semibold">O'quvchi</th>
                          <th className="px-4 py-2 font-semibold">Holat</th>
                          <th className="px-4 py-2 font-semibold">Band</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.students.map((s) => (
                          <tr key={s.id} className="border-t border-border">
                            <td className="px-4 py-2.5 text-ink">{s.name || s.username}</td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  STATUS_META[s.status]?.className || ''
                                }`}
                              >
                                {STATUS_META[s.status]?.label || s.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-ink">{s.band ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
