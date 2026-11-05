import { Suspense } from 'react';
import GamePlayer from '@/components/games/GamePlayer';
import VocablyRun from '@/components/flagship/VocablyRun';

// `useSearchParams` (GamePlayer ichida, ?mode=weak) Suspense chegarasini talab qiladi.
// Flagship o'yinlarning o'z ekrani bor (sessiya API'si bir xil).
export default async function OyinPage(props) {
  const params = await props.params;
  if (params.game === 'vocably_run') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full">
        <VocablyRun />
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-3xl mx-auto">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-border/70" aria-hidden="true" />}>
        <GamePlayer gameKey={params.game} />
      </Suspense>
    </div>
  );
}
