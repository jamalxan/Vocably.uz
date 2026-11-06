'use client';
import { forwardRef } from 'react';
import { Plus } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { QUICK_REACTIONS } from '@/lib/chat/reactions';

// Tezkor reaksiyalar qatori (PARITY_PLAN WP7) — xabar amallari oynasining tepasida (uzoq bosish
// sheet'i va "…" menyusi bir xil komponent). `mine` — mening hozirgi reaksiyam: o'sha tugma
// bosilgan holatda (aria-pressed) va qayta bosilsa olib tashlaydi (toggle chaqiruvchida).
// "+" — to'liq EmojiPicker (reaction rejimi).
const ReactionBar = forwardRef(function ReactionBar({ onPick, onMore, mine = null }, firstRef) {
  const { t } = useT();
  const btn =
    'w-11 h-11 md:w-10 md:h-10 grid place-items-center rounded-full flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:transition-transform motion-safe:hover:scale-110 motion-safe:active:scale-95';
  return (
    <div role="group" aria-label={t('mb.react')} data-testid="reaction-bar" className="flex items-center justify-between gap-1 px-2 pt-1 pb-2 mb-1 border-b border-border">
      {QUICK_REACTIONS.map((emoji, i) => {
        const pressed = mine === emoji;
        return (
          <button
            key={emoji}
            ref={i === 0 ? firstRef : undefined}
            type="button"
            data-testid="reaction-option"
            data-emoji={emoji}
            aria-pressed={pressed}
            aria-label={pressed ? t('mb.reactRemove') : t('mb.reactWith', { emoji })}
            title={pressed ? t('mb.reactRemove') : undefined}
            onClick={() => onPick(emoji)}
            className={`${btn} text-2xl leading-none ${pressed ? 'bg-accent-soft ring-1 ring-accent' : 'hover:bg-bg-sunken'}`}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        );
      })}
      <button
        type="button"
        data-testid="reaction-more"
        aria-label={t('mb.reactMore')}
        title={t('mb.reactMore')}
        onClick={onMore}
        className={`${btn} text-muted bg-bg-sunken hover:text-accent`}
      >
        <Plus size={20} />
      </button>
    </div>
  );
});

export default ReactionBar;
