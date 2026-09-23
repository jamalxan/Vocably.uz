'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Users, ChevronRight } from 'lucide-react';

export default function TeacherHomePage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/classrooms');
      const data = await res.json();
      if (res.ok) setClassrooms(data.classrooms || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createClassroom = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Xatolik');
        return;
      }
      setName('');
      await load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-luxury text-2xl text-ink mb-1">Mening sinflarim</h2>
        <p className="text-sm text-muted">Sinf yarating, o'quvchi qo'shing va topshiriq bering.</p>
      </div>

      <form
        onSubmit={createClassroom}
        className="rounded-2xl border border-border bg-surface shadow-card p-5 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="classroom-name" className="block text-xs font-medium text-muted mb-1.5">
            Yangi sinf yaratish
          </label>
          <input
            id="classroom-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: IELTS 7+ guruh"
            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-base md:text-sm text-ink placeholder:text-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 bg-accent text-on-accent rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Yangi sinf yaratish
        </button>
      </form>
      {error && <p className="text-sm text-red-500 -mt-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      ) : classrooms.length === 0 ? (
        <p className="text-center text-sm text-muted py-10">Hali sinf yaratilmagan</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classrooms.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/classrooms/${c.id}`}
              className="rounded-2xl border border-border bg-surface shadow-card p-5 flex items-center justify-between gap-3 hover:border-accent/40 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{c.name}</p>
                <p className="text-xs text-muted mt-1 inline-flex items-center gap-1.5">
                  <Users size={12} /> {c.studentCount} o'quvchi
                </p>
              </div>
              <ChevronRight size={18} className="text-muted flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
