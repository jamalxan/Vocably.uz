import { Suspense } from 'react';
import GamePlayer from '@/components/games/GamePlayer';

// `useSearchParams` (GamePlayer ichida, ?mode=weak) Suspense chegarasini talab qiladi.
export default async function OyinPage(props) {
  const params = await props.params;
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-3xl mx-auto">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-border/70" aria-hidden="true" />}>
        <GamePlayer gameKey={params.game} />
      </Suspense>
    </div>
  );
}
