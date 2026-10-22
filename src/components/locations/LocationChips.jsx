import clsx from 'clsx';
import { Clock, Star, X } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation.js';
import { countryFlag } from '../../utils/geo.js';

/** Saved (★) and recent locations as a scrollable chip row. */
export function LocationChips() {
  const { location, saved, recents, setLocation, removeRecent, toggleSaved } = useLocation();
  const items = [
    ...saved.map((s) => ({ ...s, kind: 'saved' })),
    ...recents.filter((r) => !saved.some((s) => s.id === r.id)).map((r) => ({ ...r, kind: 'recent' })),
  ];
  if (items.length === 0) return null;

  return (
    <nav aria-label="Saved and recent locations" className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 py-0.5">
        {items.map((item) => {
          const current = location?.id === item.id;
          const Icon = item.kind === 'saved' ? Star : Clock;
          return (
            <li key={item.id} className="flex items-center">
              <div
                className={clsx(
                  'flex h-9 items-center rounded-full border border-card-border pl-1 text-sm transition-colors',
                  current ? 'bg-card-strong' : 'bg-card hover:bg-card-strong',
                )}
              >
                <button
                  type="button"
                  onClick={() => setLocation(item, { remember: item.kind === 'recent' })}
                  aria-current={current ? 'location' : undefined}
                  className="focus-ring flex h-full items-center gap-1.5 rounded-full pl-2 pr-1"
                >
                  <Icon
                    className={clsx('size-3.5', item.kind === 'saved' ? 'fill-current text-yellow-500 dark:text-yellow-300' : 'text-fg-muted')}
                    aria-hidden="true"
                  />
                  <span className="max-w-[10rem] truncate font-medium">
                    {countryFlag(item.countryCode)} {item.name}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={item.kind === 'saved' ? `Remove ${item.name} from saved` : `Remove ${item.name} from recents`}
                  onClick={() => (item.kind === 'saved' ? toggleSaved(item) : removeRecent(item.id))}
                  className="focus-ring mr-0.5 flex size-7 items-center justify-center rounded-full text-fg-faint hover:bg-fg/10 hover:text-fg"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
