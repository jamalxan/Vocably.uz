'use client';
import { AlertCircle } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { useCall } from '@/context/CallContext';
import { mediaErrorMessage } from '@/lib/mediaError';
import ActionSheet from '@/components/chat-friends/ActionSheet';

const PERMISSION_ERRORS = new Set(['NotAllowedError', 'PermissionDeniedError']);

// Qo'ng'iroqdagi xato (ruxsat yo'q, kamera band...) — alert() o'rniga pastki varaq (CALLS_SPEC §10.7).
export default function CallErrorSheet() {
  const { t, ts, locale } = useT();
  const { call, clearError, retryAfterError } = useCall();
  const err = call.error;
  if (!err) return null;
  const kind = err.retry?.kind || call.kind;
  const message =
    err.kind === 'media'
      ? mediaErrorMessage({ name: err.name || err.code, message: err.message }, kind === 'video' ? 'Kamera/mikrofon' : 'Mikrofon', locale)
      : (err.message && ts(err.message)) || t('call.endedFailed');
  const canRetry = !!err.retry && PERMISSION_ERRORS.has(err.name || err.code);
  const btn = 'min-h-11 px-4 rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
  return (
    <ActionSheet open title={t('call.endedFailed')} onClose={clearError} testid="call-error-sheet" role="dialog" layerClass="z-[80]">
      <div className="flex items-start gap-3 px-4 py-2">
        <AlertCircle size={20} className="flex-shrink-0 text-danger mt-0.5" aria-hidden="true" />
        <p className="text-sm text-ink" role="alert">
          {message}
        </p>
      </div>
      <div className="flex justify-end gap-2 px-2 pt-2">
        <button type="button" onClick={clearError} className={`${btn} text-ink hover:bg-bg-sunken`}>
          {t('ch.close')}
        </button>
        {canRetry && (
          <button type="button" data-testid="call-retry" onClick={retryAfterError} className={`${btn} bg-accent text-on-accent hover:bg-accent-hover`}>
            {t('call.retry')}
          </button>
        )}
      </div>
    </ActionSheet>
  );
}
