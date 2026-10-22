import { WifiOff } from 'lucide-react';

export function OfflineBanner({ online, stale, updatedAt, hour12 }) {
  if (online && !stale) return null;
  const time =
    updatedAt &&
    new Date(updatedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12 });
  return (
    <div
      role="status"
      className="glass flex items-center gap-3 border-orange-400/40 bg-orange-500/15 px-4 py-2.5 text-sm"
    >
      <WifiOff className="size-4 shrink-0 text-orange-600 dark:text-orange-300" aria-hidden="true" />
      <p>
        {online ? 'Could not refresh.' : 'You are offline.'}{' '}
        {time ? `Showing data saved at ${time}.` : 'Showing the last saved forecast.'}
      </p>
    </div>
  );
}
