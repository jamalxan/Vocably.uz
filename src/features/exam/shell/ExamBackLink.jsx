import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// (exam) marshrutlarida AppShell (sidebar/pastki tab bar) yo'q — test tanlash,
// mashq va natija sahifalaridan ilovaga qaytish uchun yagona chiqish yo'li.
export default function ExamBackLink({ href = '/app/mashq', label = 'Mashq', width = 'max-w-lg' }) {
  return (
    <nav aria-label="Orqaga" className={`${width} mx-auto px-4 sm:px-8 pt-3 sm:pt-5 -mb-3 sm:-mb-6`}>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 min-h-11 px-2 rounded-lg text-sm font-semibold text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {label}
      </Link>
    </nav>
  );
}
