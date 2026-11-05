import WeeklyReport from '@/components/report/WeeklyReport';

export const metadata = { title: 'Haftalik hisobot — Vocably', robots: { index: false } };

const WEEK_RE = /^\d{4}-W\d{2}$/;

export default async function ReportPage({ searchParams }) {
  const raw = (await searchParams)?.week;
  const week = typeof raw === 'string' && WEEK_RE.test(raw) ? raw : null;
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto">
      <WeeklyReport key={week || 'default'} week={week} />
    </div>
  );
}
