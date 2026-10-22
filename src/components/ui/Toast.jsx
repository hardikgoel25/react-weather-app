import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { tone } from '../../utils/tones.js';

const ICONS = { info: Info, success: CheckCircle2, warn: AlertTriangle, error: XCircle };
const TONE_FOR = { info: 'info', success: 'good', warn: 'warn', error: 'bad' };

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.tone] ?? Info;
        const palette = tone(TONE_FOR[t.tone] ?? 'info');
        return (
          <div
            key={t.id}
            className="glass-strong pointer-events-auto flex w-full max-w-md items-start gap-3 p-3 pr-2 text-sm animate-rise"
          >
            <Icon className={clsx('mt-0.5 size-5 shrink-0', palette.text)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {t.title && <p className="font-semibold leading-tight">{t.title}</p>}
              {t.description && <p className="mt-0.5 text-fg-muted">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="focus-ring rounded-full p-1 text-fg-muted hover:text-fg"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
