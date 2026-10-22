import { clamp, isNum } from './format.js';

export const MAX_NAME_LENGTH = 80;

/** Remove control characters, collapse whitespace, cap length. */
export function sanitizeName(value) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

export function isValidCoords(lat, lon) {
  return isNum(lat) && isNum(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

export function roundCoord(v, digits = 4) {
  return Number(v.toFixed(digits));
}

/** Stable identity for a location (3 decimals ≈ 100 m). */
export function locationId(lat, lon) {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

/** Normalise any object with lat/lon/name into our canonical location shape. */
export function makeLocation(input) {
  if (!input) return null;
  const lat = Number(input.lat ?? input.latitude);
  const lon = Number(input.lon ?? input.longitude);
  if (!isValidCoords(lat, lon)) return null;
  const name = sanitizeName(input.name) || formatCoords(lat, lon);
  return {
    id: locationId(lat, lon),
    lat: roundCoord(lat),
    lon: roundCoord(lon),
    name,
    admin1: sanitizeName(input.admin1 ?? '') || undefined,
    country: sanitizeName(input.country ?? '') || undefined,
    countryCode: typeof input.countryCode === 'string' && /^[A-Za-z]{2}$/.test(input.countryCode)
      ? input.countryCode.toUpperCase()
      : undefined,
    timezone: typeof input.timezone === 'string' ? input.timezone.slice(0, 64) : undefined,
    source: input.source ?? 'search',
  };
}

export function formatCoords(lat, lon) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lon).toFixed(2)}° ${ew}`;
}

/** Secondary line for a location: "Delhi, India" / "Illinois, United States". */
export function locationSubtitle(loc) {
  if (!loc) return '';
  return [loc.admin1, loc.country].filter(Boolean).join(', ');
}

/** ISO-3166 alpha-2 → flag emoji (regional indicator pair). */
export function countryFlag(code) {
  if (typeof code !== 'string' || !/^[A-Za-z]{2}$/.test(code)) return '';
  const base = 0x1f1e6;
  const upper = code.toUpperCase();
  return String.fromCodePoint(base + upper.charCodeAt(0) - 65, base + upper.charCodeAt(1) - 65);
}

/** Parse `?lat=&lon=&name=` from a search string. Unknown params are ignored. */
export function locationFromSearch(search) {
  try {
    const params = new URLSearchParams(search);
    const lat = Number.parseFloat(params.get('lat') ?? '');
    const lon = Number.parseFloat(params.get('lon') ?? '');
    if (!isValidCoords(lat, lon)) return null;
    return makeLocation({
      lat: clamp(lat, -90, 90),
      lon: clamp(lon, -180, 180),
      name: params.get('name') ?? '',
      source: 'url',
    });
  } catch {
    return null;
  }
}

/** Build the `?lat=&lon=&name=` query for a location. */
export function searchFromLocation(loc) {
  if (!loc) return '';
  const params = new URLSearchParams();
  params.set('lat', String(loc.lat));
  params.set('lon', String(loc.lon));
  if (loc.name) params.set('name', loc.name);
  return `?${params.toString()}`;
}
