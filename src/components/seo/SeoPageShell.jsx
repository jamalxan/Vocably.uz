import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

// Shared frame for public content pages: header, visible breadcrumbs (the
// same trail as the BreadcrumbList JSON-LD), content, a sign-up CTA, footer.
export default function SeoPageShell({ crumbs, jsonLd, children, cta = true }) {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <LandingHeader />
      <main className="flex-1 px-4 sm:px-6 pt-2 pb-12 w-full max-w-3xl mx-auto">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
              {crumbs.map(([name, href], i) => (
                <li key={href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={12} aria-hidden="true" />}
                  {i < crumbs.length - 1 ? (
                    <Link href={href} className="hover:text-accent min-h-8 inline-flex items-center">
                      {name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-ink">
                      {name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {children}
        {cta && (
          <div className="mt-12 bg-primary text-on-primary rounded-3xl p-6 sm:p-8 text-center">
            <Sparkles size={22} className="mx-auto mb-3 text-accent" aria-hidden="true" />
            <p className="font-display text-lg font-bold mb-1.5">IELTS'ga Vocably bilan tayyorlaning</p>
            <p className="text-sm text-on-primary/70 mb-5">Reading, Listening, Writing, Speaking va mock imtihon — bepul boshlang.</p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link href="/demo" className="bg-on-primary/10 hover:bg-on-primary/15 text-on-primary font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Avval sinab ko'rish
              </Link>
              <Link href="/royxat" className="bg-accent hover:bg-accent-hover text-on-accent font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-glow">
                Bepul boshlash
              </Link>
            </div>
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
