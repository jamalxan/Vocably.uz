import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blogPosts';

export const metadata = {
  title: 'Blog — Vocably',
  description: "Ingliz tili o'rganish, so'z boyligini oshirish va IELTS bo'yicha maslahatlar.",
  alternates: { canonical: '/blog' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogIndexPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
          <ArrowLeft size={15} /> Bosh sahifa
        </Link>
      </header>
      <main className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <h1 className="font-luxury text-2xl sm:text-3xl font-bold text-ink mb-8">Blog</h1>
        <div className="space-y-5">
          {BLOG_POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block p-5 bg-surface border border-border rounded-2xl shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200"
            >
              <h2 className="font-display text-lg font-bold text-ink mb-1.5">{p.title}</h2>
              <p className="text-sm text-muted mb-3 leading-relaxed">{p.excerpt}</p>
              <div className="flex items-center gap-3 text-[11px] text-muted/70">
                <span>{formatDate(p.date)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {p.readMinutes} daq o'qish
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
