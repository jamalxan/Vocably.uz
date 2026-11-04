'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { ONBOARDING_STORAGE_KEY, normalizeAnswers, isComplete } from '@/lib/onboarding';

// Dashboard companion of the public /start quiz (TZ 2.0 §6.1):
//  1. If the browser holds a finished, not-yet-saved quiz (user took it as a guest, then
//     signed up), post it to /api/onboarding once and refresh the dashboard (onSynced).
//  2. Otherwise, if the account was never onboarded, show a card linking to /start.

const COPY = {
  uz: { title: 'Shaxsiy rejangizni oling', body: "7 ta savol, 2 daqiqa — imtihon sanangiz va kunlik vaqtingizga mos reja.", cta: 'Boshlash' },
  en: { title: 'Get your personal plan', body: '7 questions, 2 minutes — a plan sized to your exam date and daily time.', cta: 'Start' },
};

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export default function OnboardingPrompt({ onSynced }) {
  const c = useCopy(COPY);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = readStored();
      const answers = stored ? normalizeAnswers(stored.answers) : null;
      if (stored && !stored.synced && stored.phase === 'result' && isComplete(answers)) {
        try {
          const r = await fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ answers }),
          });
          if (r.ok) {
            try {
              localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ ...stored, synced: true }));
            } catch { /* ignore */ }
            if (!cancelled) onSynced?.();
            return;
          }
        } catch { /* fall through to the status check */ }
      }
      try {
        const r = await fetch('/api/onboarding', { credentials: 'same-origin' });
        if (!r.ok) return;
        const j = await r.json();
        if (!cancelled && !j.completed) setShow(true);
      } catch { /* offline — no prompt */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per dashboard mount
  }, []);

  if (!show) return null;
  return (
    <Link
      href="/start"
      className="flex items-center gap-4 rounded-2xl border-2 border-accent/40 bg-accent-soft px-5 py-4 hover:border-accent transition-colors"
    >
      <Sparkles className="w-6 h-6 text-accent shrink-0" aria-hidden />
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-ink">{c.title}</span>
        <span className="block text-sm text-muted">{c.body}</span>
      </span>
      <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-accent">
        {c.cta} <ArrowRight className="w-4 h-4" aria-hidden />
      </span>
    </Link>
  );
}
