import { z } from 'zod';
import { buildUrl, fetchJson } from './client.js';
import { makeLocation, sanitizeName } from '../utils/geo.js';

export const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

const PlaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  timezone: z.string().optional(),
  population: z.number().optional(),
  feature_code: z.string().optional(),
});

const SearchSchema = z.object({ results: z.array(PlaceSchema).optional() });

function preferredLanguage() {
  try {
    const lang = (navigator.language || 'en').toLowerCase().split('-')[0];
    return /^[a-z]{2}$/.test(lang) ? lang : 'en';
  } catch {
    return 'en';
  }
}

/**
 * Search places by name (keyless Open-Meteo geocoder).
 * Returns canonical location objects plus `placeId` and `population`.
 */
export async function searchPlaces(query, { signal, count = 8 } = {}) {
  const name = sanitizeName(query);
  if (name.length < 2) return [];
  const url = buildUrl(GEOCODING_ENDPOINT, {
    name,
    count,
    language: preferredLanguage(),
    format: 'json',
  });
  const data = await fetchJson(url, { signal, schema: SearchSchema, timeoutMs: 8_000 });
  return (data.results ?? [])
    .map((r) => {
      const loc = makeLocation({
        lat: r.latitude,
        lon: r.longitude,
        name: r.name,
        admin1: r.admin1,
        country: r.country,
        countryCode: r.country_code,
        timezone: r.timezone,
        source: 'search',
      });
      return loc ? { ...loc, placeId: r.id, population: r.population, featureCode: r.feature_code } : null;
    })
    .filter(Boolean);
}
