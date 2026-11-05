import DuelHub from '@/components/duel/DuelHub';

export const metadata = { title: "So'z dueli — Vocably", robots: { index: false } };

export default function DuelPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto">
      <DuelHub />
    </div>
  );
}
