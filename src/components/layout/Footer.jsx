import clsx from 'clsx';
import { RefreshCw } from 'lucide-react';
import { relativeTime } from '../../utils/time.js';
import { useNow } from '../../hooks/useNow.js';

export function Footer({ updatedAt, fetching, onRefresh }) {
  const now = useNow(30_000);
  return (
    <footer className="mt-6 flex flex-col items-center gap-3 text-center text-xs text-fg-faint">
      {onRefresh && (
        <div className="flex items-center gap-2">
          <span aria-live="polite">
            {updatedAt ? `Updated ${relativeTime(updatedAt, now.getTime())}` : 'Not updated yet'}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={fetching}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card px-3 py-1 font-medium text-fg-muted transition hover:bg-card-strong hover:text-fg disabled:opacity-60"
          >
            <RefreshCw className={clsx('size-3.5', fetching && 'animate-spin')} aria-hidden="true" />
            {fetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}
      <p className="max-w-xl leading-relaxed">
        Weather and air-quality data by{' '}
        <a className="underline decoration-fg/30 underline-offset-2 hover:text-fg" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
          Open-Meteo
        </a>{' '}
        (CC BY 4.0). Place names by{' '}
        <a className="underline decoration-fg/30 underline-offset-2 hover:text-fg" href="https://www.bigdatacloud.com/" target="_blank" rel="noopener noreferrer">
          BigDataCloud
        </a>
        . Icons:{' '}
        <a className="underline decoration-fg/30 underline-offset-2 hover:text-fg" href="https://github.com/basmilius/weather-icons" target="_blank" rel="noopener noreferrer">
          Meteocons
        </a>
        . Heads-up notices are computed from the forecast and are not official warnings.
      </p>
      <p>
        <a className="underline decoration-fg/30 underline-offset-2 hover:text-fg" href="https://github.com/hardikgoel25/react-weather-app" target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
        {' · '}No accounts, no tracking. Your location never leaves your device except as coordinates sent to the weather API.
      </p>
    </footer>
  );
}
