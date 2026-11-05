import DuelGame from '@/components/duel/DuelGame';

export const metadata = { title: "So'z dueli — Vocably", robots: { index: false } };

export default async function DuelCodePage({ params }) {
  const { code } = await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto">
      <DuelGame key={code} code={code} />
    </div>
  );
}
