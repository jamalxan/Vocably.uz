'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { getCoach } from './api';

// Shaxsiy murabbiy (TZ §27.4): real o'quv ma'lumotiga asoslangan qisqa xabar + bitta aniq keyingi qadam.
export default function CoachCard() {
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCoach()
      .then((c) => !cancelled && setCoach(c))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!coach) return null;
  return (
    <section className="bg-surface border border-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center gap-4" aria-label="Murabbiy">
      <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
        <MessageCircle size={20} aria-hidden="true" />
      </div>
      <p className="text-sm text-ink flex-1">{coach.message}</p>
      <Link href={coach.action.href} className={buttonClasses({ variant: 'primary', size: 'md' })}>
        {coach.action.label}
      </Link>
    </section>
  );
}
