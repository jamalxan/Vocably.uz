import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BLOG_POSTS, getBlogPost } from '@/lib/blogPosts';
import LandingHeader from '@/components/landing/LandingHeader';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Vocably`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vocably' }],
    },
  };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Tailwind typography plugin ulanmagan (loyihada yo'q) — shuning uchun har
// markdown elementi uchun ochiq utility klasslar (ChatMessage.jsx'dagi
// `prose` klassidan farqli, u yerda plugin bo'lmagani uchun amalda ta'sirsiz).
// react-markdown `node` propini ham uzatadi — DOM'ga tushmasligi uchun ajratib olinadi.
const md = (Tag, className) => {
  function MdElement({ node, ...props }) {
    return <Tag className={className} {...props} />;
  }
  return MdElement;
};

const MD_COMPONENTS = {
  h2: md('h2', 'font-display text-2xl font-bold text-ink mt-8 mb-3'),
  h3: md('h3', 'font-display text-lg font-bold text-ink mt-6 mb-2'),
  p: md('p', 'text-base text-ink leading-7 mb-4'),
  strong: md('strong', 'font-semibold text-ink'),
  em: md('em'),
  a: md('a', 'text-accent underline underline-offset-2 hover:text-accent-hover'),
  ul: md('ul', 'list-disc pl-6 text-base text-ink leading-7 space-y-1.5 mb-4'),
  ol: md('ol', 'list-decimal pl-6 text-base text-ink leading-7 space-y-1.5 mb-4'),
  li: md('li', 'pl-1'),
  blockquote: md('blockquote', 'border-l-2 border-accent pl-4 text-muted italic mb-4'),
  code: md('code', 'font-mono text-[0.9em] bg-surface-2 px-1 rounded'),
  pre: md('pre', 'overflow-x-auto bg-surface-2 rounded-xl p-4 text-sm mb-4'),
  table: function MdTable({ node, ...props }) {
    return (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm text-ink border-collapse" {...props} />
      </div>
    );
  },
  th: md('th', 'border border-border px-3 py-2 text-left font-semibold'),
  td: md('td', 'border border-border px-3 py-2'),
  hr: function MdHr() {
    return <hr className="border-border my-8" />;
  },
};

export default function BlogPostPage({ params }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Vocably' },
  };

  return (
    <div className="min-h-dvh bg-bg">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <LandingHeader />

      <main className="px-4 sm:px-6 pt-2 pb-6 max-w-2xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-1.5 min-h-11 text-sm text-muted hover:text-accent transition-colors mb-2">
          <ArrowLeft size={15} /> Blogga qaytish
        </Link>
        <article>
          <h1 className="font-luxury text-2xl sm:text-3xl font-bold text-ink mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-[11px] text-muted mb-8">
            <span>{formatDate(post.date)}</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {post.readMinutes} daq o'qish
            </span>
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {post.content}
          </ReactMarkdown>
        </article>

        <div className="mt-10 bg-primary text-on-primary rounded-3xl p-6 sm:p-8 text-center">
          <Sparkles size={22} className="mx-auto mb-3 text-accent" />
          <p className="font-display text-lg font-bold mb-1.5">So'z boyligingizni bugun boshlang</p>
          <p className="text-sm text-on-primary/70 mb-5">Bepul, ro'yxatdan o'tish 1 daqiqa.</p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/demo" className="bg-on-primary/10 hover:bg-on-primary/15 text-on-primary font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Avval sinab ko'rish
            </Link>
            <Link href="/royxat" className="bg-accent hover:bg-accent-hover text-on-accent font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-glow">
              Bepul boshlash
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
