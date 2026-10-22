import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { Loader2, LocateFixed, Search, X } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { usePlaceSearch } from '../../hooks/useWeatherQueries.js';
import { useLocation } from '../../hooks/useLocation.js';
import { countryFlag, locationSubtitle, MAX_NAME_LENGTH } from '../../utils/geo.js';
import { describeError } from '../../api/client.js';
import { IconButton } from '../ui/IconButton.jsx';

function compact(n) {
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    return String(n);
  }
}

/** Debounced autocomplete search (ARIA combobox) + "use my location" button. */
export function SearchBox({ onLocate, locating = false, inputRef }) {
  const { setLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebouncedValue(query, 300);
  const search = usePlaceSearch(debounced);
  const listId = useId();
  const fallbackRef = useRef(null);
  const ref = inputRef ?? fallbackRef;
  const wrapperRef = useRef(null);

  const results = search.data ?? [];
  const typing = query.trim() !== debounced.trim();
  const showList = open && query.trim().length >= 2;
  const resultKey = results.map((r) => r.id).join('|');

  // Reset the highlighted row whenever the result set changes.
  const [lastKey, setLastKey] = useState(resultKey);
  if (lastKey !== resultKey) {
    setLastKey(resultKey);
    setActive(-1);
  }

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const select = (place) => {
    if (!place) return;
    setLocation(place);
    setQuery('');
    setOpen(false);
    ref.current?.blur();
  };

  const onKeyDown = (event) => {
    if (!showList) {
      if (event.key === 'Escape') {
        setQuery('');
        ref.current?.blur();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActive((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        select(results[active] ?? results[0]);
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      default:
    }
  };

  let status = null;
  if (typing || search.isFetching) status = 'Searching…';
  else if (search.isError) status = describeError(search.error);
  else if (search.isFetched && results.length === 0) status = 'No places found. Try a different spelling.';

  return (
    <div ref={wrapperRef} className="relative">
      <form
        role="search"
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          select(results[active] ?? results[0]);
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
          <input
            ref={ref}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            role="combobox"
            aria-label="Search for a city or place"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Search city or place"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="focus-ring h-11 w-full rounded-full border border-card-border bg-input pl-10 pr-10 text-sm text-fg placeholder:text-fg-faint backdrop-blur-xl"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                ref.current?.focus();
              }}
              className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-fg-muted hover:text-fg"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-card-border px-1.5 py-0.5 text-[10px] font-medium text-fg-faint sm:block"
            >
              /
            </kbd>
          )}
        </div>
        <IconButton
          label={locating ? 'Finding your location…' : 'Use my location'}
          onClick={onLocate}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="size-5" aria-hidden="true" />
          )}
        </IconButton>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Place suggestions"
          className="glass-strong absolute inset-x-0 top-full z-40 mt-2 max-h-80 overflow-y-auto p-1.5 animate-fade-in"
        >
          {status && (
            <li role="presentation" className="flex items-center gap-2 px-3 py-2 text-sm text-fg-muted">
              {status === 'Searching…' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {status}
            </li>
          )}
          {results.map((place, index) => (
            <li key={place.placeId ?? place.id} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => select(place)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                  index === active ? 'bg-card-strong' : 'hover:bg-card',
                )}
              >
                <span className="w-7 text-center text-xl leading-none" aria-hidden="true">
                  {countryFlag(place.countryCode) || '📍'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{place.name}</span>
                  <span className="block truncate text-xs text-fg-muted">{locationSubtitle(place)}</span>
                </span>
                {place.population > 0 && (
                  <span className="shrink-0 text-xs text-fg-faint tabular">{compact(place.population)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
