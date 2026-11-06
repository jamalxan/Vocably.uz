'use client';
import { useT } from '@/context/LocaleContext';
import { groupReactions } from '@/lib/chat/reactions';

// Pufakcha ichidagi reaksiya chiplari (PARITY_PLAN WP7) — oxirgi qator: `❤️ 2` (son doim
// ko'rinadi). Mening chipim ajratib ko'rsatiladi; bosish — toggle: menikini bossam olib
// tashlanadi, boshqaning emojisini bossam meniki shu emojiga o'tadi (bittadan ortiq emas).
// `tone`: 'outgoing' — accent fonli (mening) pufakcha, 'incoming' — surface fon yoki fonsiz
// (stiker, faqat-emoji, dumaloq video).
export default function ReactionChips({ reactions, myId, onToggle, tone = 'incoming', interactive = true }) {
  const { t } = useT();
  const groups = groupReactions(reactions, myId);
  if (!groups.length) return null;
  const out = tone === 'outgoing';
  return (
    <div role="group" aria-label={t('mb.reactions')} className="mt-1 flex flex-wrap gap-1 not-italic">
      {groups.map(({ emoji, count, mine }) => {
        const cls = out
          ? mine
            ? 'bg-on-accent/25 text-on-accent ring-1 ring-on-accent/60'
            : 'bg-on-accent/10 text-on-accent hover:bg-on-accent/20'
          : mine
            ? 'bg-accent text-on-accent'
            : 'bg-accent-soft text-accent hover:bg-accent-soft/70';
        return (
          <button
            key={emoji}
            type="button"
            data-testid="reaction-chip"
            data-emoji={emoji}
            data-mine={mine ? 'true' : 'false'}
            aria-pressed={mine}
            aria-label={`${t('mb.reactionAria', { emoji, n: count })}${mine ? `. ${t('mb.reactRemove')}` : ''}`}
            // Tanlash rejimida (interactive=false) bosish pufakchaning o'ziga o'tadi (tanlaydi).
            tabIndex={interactive ? undefined : -1}
            onClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              onToggle?.(emoji);
            }}
            // Chipni bosish uzoq bosish/swipe'ni boshlamasin.
            onPointerDown={interactive ? (e) => e.stopPropagation() : undefined}
            className={`inline-flex items-center gap-1 h-6 px-2 rounded-full text-xs font-semibold tabular-nums select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:transition-colors ${cls}`}
          >
            <span aria-hidden="true" className="text-sm leading-none">{emoji}</span>
            <span aria-hidden="true">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
