'use client';
import type { WritingTask } from '@/lib/exam/types';

// TZ-vocably-v2.md §8.1/§8.2 — chap panel: topshiriq matni + grafik (Task 1
// Academic'da). "Task promptidan nusxa olish bloklanadi" — shuning uchun
// `onCopy={e => e.preventDefault()}` shu panelning ILDIZ elementida.
export interface TaskPaneProps {
  task: WritingTask;
}

export default function TaskPane({ task }: TaskPaneProps) {
  return (
    <div onCopy={(e) => e.preventDefault()} className="leading-[1.7]" style={{ color: 'var(--exam-text)' }}>
      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--exam-muted)' }}>
        Writing Task {task.order}
      </p>
      {/* eslint-disable-next-line react/no-danger */}
      <div
        className="overflow-x-auto break-words [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_pre]:whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: task.promptHtml }}
      />

      {task.imageUrl && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={task.imageUrl}
            alt={task.imageAlt || ''}
            className="max-w-full h-auto"
            style={{ border: '1px solid var(--exam-chrome-border)' }}
          />
        </div>
      )}

      <p className="mt-4 text-sm" style={{ color: 'var(--exam-muted)' }}>
        Write at least {task.minWords} words.
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--exam-muted)' }}>
        Recommended time: {task.recommendedMin} minutes.
      </p>
    </div>
  );
}
