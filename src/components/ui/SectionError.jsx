import { AlertTriangle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { describeError } from '../../api/client.js';

/** Inline, per-section error with retry so one failing API never blanks the page. */
export function SectionError({ title = 'Could not load this section', error, onRetry, retrying = false, className }) {
  return (
    <div className={clsx('glass flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center', className)} role="alert">
      <AlertTriangle className="size-5 shrink-0 text-orange-500 dark:text-orange-300" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-fg-muted">{describeError(error)}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-card-strong disabled:opacity-60"
        >
          <RefreshCw className={clsx('size-4', retrying && 'animate-spin')} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
