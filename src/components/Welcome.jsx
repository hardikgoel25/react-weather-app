import { Loader2, LocateFixed } from 'lucide-react';
import { WeatherIcon } from './ui/WeatherIcon.jsx';

/** Empty state shown until a location is known. */
export function Welcome({ geo, onLocate }) {
  const locating = geo.status === 'locating';
  return (
    <section className="glass-strong mx-auto mt-4 max-w-xl p-8 text-center animate-rise sm:mt-10" aria-labelledby="welcome-title">
      <WeatherIcon name="partly-cloudy-day" size={128} className="mx-auto" />
      <h1 id="welcome-title" className="mt-2 text-3xl font-semibold tracking-tight">
        Weather, anywhere.
      </h1>
      <p className="mx-auto mt-2 max-w-md text-fg-muted">
        16-day forecasts, hourly charts, air quality, UV and heads-up notices for any place on Earth. No account,
        no tracking.
      </p>
      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90 disabled:opacity-60"
      >
        {locating ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LocateFixed className="size-4" aria-hidden="true" />
        )}
        {locating ? 'Finding your location…' : 'Use my location'}
      </button>
      {geo.error && (
        <p role="alert" className="mx-auto mt-3 max-w-sm text-sm text-orange-700 dark:text-orange-300">
          {geo.error}
        </p>
      )}
      <p className="mt-4 text-sm text-fg-faint">
        or search for a city above — press{' '}
        <kbd className="rounded-md border border-card-border px-1.5 py-0.5 text-xs">/</kbd> to jump to search.
      </p>
    </section>
  );
}
