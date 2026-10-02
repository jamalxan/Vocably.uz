import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IELTS_GUIDES, getIeltsGuide } from '@/lib/seo/ieltsGuides';
import { SITE_URL, organizationLd, breadcrumbLd, faqLd, ldGraph } from '@/lib/seo/site';
import SeoPageShell from '@/components/seo/SeoPageShell';
import Prose from '@/components/seo/Prose';

export const dynamicParams = false;

export function generateStaticParams() {
  return IELTS_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props) {
  const params = await props.params;
  const g = getIeltsGuide(params.slug);
  if (!g) return {};
  const url = `/ielts/${g.slug}`;
  return {
    title: `${g.title} | Vocably`,
    description: g.description,
    alternates: { canonical: url },
    openGraph: { title: g.title, description: g.description, url, type: 'article' },
  };
}

export default async function IeltsGuidePage(props) {
  const params = await props.params;
  const g = getIeltsGuide(params.slug);
  if (!g) notFound();
  const path = `/ielts/${g.slug}`;
  const crumbs = [
    ['Bosh sahifa', '/'],
    ['IELTS', '/ielts'],
    [g.short, path],
  ];
  const jsonLd = ldGraph([
    organizationLd,
    {
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      inLanguage: 'uz',
      url: `${SITE_URL}${path}`,
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      about: { '@type': 'Thing', name: `IELTS ${g.skill}` },
      dateModified: '2026-09-29',
    },
    breadcrumbLd(crumbs),
    faqLd(g.faq),
  ]);
  const others = IELTS_GUIDES.filter((o) => o.slug !== g.slug);

  return (
    <SeoPageShell crumbs={crumbs} jsonLd={jsonLd}>
      <article>
        <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-ink leading-tight">{g.title}</h1>
        <p className="text-base text-muted mt-3 leading-7">{g.description}</p>

        {/* Key facts first — answer engines quote short, plain facts. */}
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {g.facts.map(([k, v]) => (
            <div key={k} className="p-4 rounded-2xl bg-surface border border-border">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-accent">{k}</dt>
              <dd className="text-sm text-ink mt-1">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <Prose>{g.body}</Prose>
        </div>

        <section aria-labelledby="faq" className="mt-10">
          <h2 id="faq" className="font-display text-2xl font-bold text-ink mb-4">
            Ko'p so'raladigan savollar
          </h2>
          <div className="space-y-2.5">
            {g.faq.map(([q, a]) => (
              <details key={q} className="group rounded-2xl bg-surface border border-border px-5 py-4">
                <summary className="cursor-pointer font-semibold text-ink list-none flex justify-between gap-3">
                  {q}
                  <span aria-hidden="true" className="text-accent group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-sm text-muted mt-2 leading-6">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <nav aria-label="Boshqa IELTS qo'llanmalari" className="mt-10">
        <p className="text-sm font-semibold text-ink mb-3">Boshqa bo'limlar</p>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.slug} href={`/ielts/${o.slug}`} className="px-3.5 py-2 rounded-xl border border-border bg-surface text-sm text-ink hover:border-accent/50">
              {o.short}
            </Link>
          ))}
          <Link href="/ielts/band-kalkulyator" className="px-3.5 py-2 rounded-xl border border-accent/40 bg-accent-soft text-sm font-semibold text-accent">
            Band kalkulyatori
          </Link>
        </div>
      </nav>
    </SeoPageShell>
  );
}
