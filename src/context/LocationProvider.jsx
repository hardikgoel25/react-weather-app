import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { LocationContext } from './contexts.js';
import { readJson, writeJson, STORAGE_KEYS } from '../utils/storage.js';
import { locationFromSearch, makeLocation, searchFromLocation } from '../utils/geo.js';

export const MAX_SAVED = 10;
export const MAX_RECENTS = 5;

const LocationSchema = z.object({
  id: z.string().max(40),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  name: z.string().max(80),
  admin1: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  countryCode: z.string().max(2).optional(),
  timezone: z.string().max(64).optional(),
  source: z.string().max(16).optional(),
});

const ListSchema = z.array(LocationSchema).max(MAX_SAVED + MAX_RECENTS);

function syncUrl(loc, { replace }) {
  if (typeof window === 'undefined' || !window.history) return;
  const search = loc ? searchFromLocation(loc) : '';
  if (window.location.search === search) return;
  const url = `${window.location.pathname}${search}${window.location.hash}`;
  try {
    if (replace) window.history.replaceState({ locationId: loc?.id }, '', url);
    else window.history.pushState({ locationId: loc?.id }, '', url);
  } catch {
    /* ignore (e.g. sandboxed iframe) */
  }
}

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    const fromUrl = typeof window !== 'undefined' ? locationFromSearch(window.location.search) : null;
    return fromUrl ?? readJson(STORAGE_KEYS.location, LocationSchema, null);
  });
  const [saved, setSaved] = useState(() => readJson(STORAGE_KEYS.saved, ListSchema, []).slice(0, MAX_SAVED));
  const [recents, setRecents] = useState(() => readJson(STORAGE_KEYS.recents, ListSchema, []).slice(0, MAX_RECENTS));

  // Make the URL reflect a location restored from storage.
  useEffect(() => {
    if (location) syncUrl(location, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back / forward navigation.
  useEffect(() => {
    const onPop = () => {
      const loc = locationFromSearch(window.location.search);
      if (loc) {
        setLocationState(loc);
        writeJson(STORAGE_KEYS.location, loc);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setLocation = useCallback((input, { remember = true, replace = false } = {}) => {
    const loc = makeLocation(input);
    if (!loc) return null;
    setLocationState(loc);
    writeJson(STORAGE_KEYS.location, loc);
    syncUrl(loc, { replace });
    if (remember && loc.source !== 'gps') {
      setRecents((prev) => {
        const next = [loc, ...prev.filter((r) => r.id !== loc.id)].slice(0, MAX_RECENTS);
        writeJson(STORAGE_KEYS.recents, next);
        return next;
      });
    }
    return loc;
  }, []);

  /** Merge details (e.g. a reverse-geocoded name) into the current location without navigating. */
  const updateLocation = useCallback((patch) => {
    setLocationState((prev) => {
      if (!prev) return prev;
      const next = makeLocation({ ...prev, ...patch });
      if (!next) return prev;
      writeJson(STORAGE_KEYS.location, next);
      syncUrl(next, { replace: true });
      return next;
    });
  }, []);

  const isSaved = useCallback((id) => saved.some((s) => s.id === id), [saved]);

  const toggleSaved = useCallback((loc) => {
    if (!loc) return;
    setSaved((prev) => {
      const exists = prev.some((s) => s.id === loc.id);
      const next = exists ? prev.filter((s) => s.id !== loc.id) : [...prev, makeLocation(loc)].slice(-MAX_SAVED);
      writeJson(STORAGE_KEYS.saved, next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((id) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeJson(STORAGE_KEYS.recents, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ location, saved, recents, setLocation, updateLocation, isSaved, toggleSaved, removeRecent }),
    [location, saved, recents, setLocation, updateLocation, isSaved, toggleSaved, removeRecent],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
