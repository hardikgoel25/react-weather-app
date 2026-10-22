/**
 * Safe localStorage helpers. Every read is wrapped, parsed and validated with a
 * zod schema so corrupted or tampered values can never crash the app.
 */
const MAX_BYTES = 600_000;

function getStore() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readJson(key, schema, fallback) {
  const store = getStore();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw == null || raw.length > MAX_BYTES) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  const store = getStore();
  if (!store) return false;
  try {
    const raw = JSON.stringify(value);
    if (raw.length > MAX_BYTES) return false;
    store.setItem(key, raw);
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  const store = getStore();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = Object.freeze({
  settings: 'wx.settings.v2',
  location: 'wx.location.v2',
  saved: 'wx.saved.v2',
  recents: 'wx.recents.v2',
  forecastCache: 'wx.cache.forecast.v2',
  airCache: 'wx.cache.air.v2',
});
