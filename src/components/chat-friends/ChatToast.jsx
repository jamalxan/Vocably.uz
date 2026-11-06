'use client';
import { X, AlertCircle } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { useChat } from '@/context/ChatContext';

// Chat ichidagi qisqa xabarnoma (PARITY_PLAN WP8.14) — chat kodidagi barcha `window.alert` o'rnida.
// Holat ChatContext'da (`showChatNotice(text, tone)`, ~3.5 s dan keyin o'zi yopiladi). Mobil'da
// tepada (Composer va klaviaturani yopmaydi), desktop'da suhbat oynasining pastida markazda.
export default function ChatToast() {
  const { t } = useT();
  const { chatNotice, showChatNotice } = useChat();
  if (!chatNotice) return null;
  const error = chatNotice.tone === 'error';
  return (
    <div
      key={chatNotice.id}
      role="status"
      aria-live="polite"
      data-testid="chat-toast"
      data-tone={chatNotice.tone || 'info'}
      className="fixed z-[60] inset-x-3 top-[calc(0.75rem+env(safe-area-inset-top))] md:inset-x-auto md:top-auto md:left-1/2 md:-translate-x-1/2 md:bottom-24 md:max-w-sm flex items-center gap-2 pl-3.5 pr-1 py-1 rounded-xl bg-surface-2 border border-border text-ink text-sm font-medium shadow-card chat-pop-in"
    >
      {error && <AlertCircle size={16} className="flex-shrink-0 text-danger" aria-hidden="true" />}
      <span className="flex-1 min-w-0 py-1.5">{chatNotice.text}</span>
      <button
        type="button"
        onClick={() => showChatNotice(null)}
        aria-label={t('ch.toastClose')}
        className="flex-shrink-0 w-11 h-11 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
