import { z } from 'zod';
import { buildUrl, fetchJson } from './client.js';
import { sanitizeName } from '../utils/geo.js';

/** Keyless reverse geocoder (BigDataCloud client API). Used only to name GPS positions. */
export const REVERSE_GEOCODE_ENDPOINT = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const Schema = z.object({
  city: z.string().optional(),
  locality: z.string().optional(),
  principalSubdivision: z.string().optional(),
  countryName: z.string().optional(),
  countryCode: z.string().optional(),
});

export async function reverseGeocode({ lat, lon, signal }) {
  const url = buildUrl(REVERSE_GEOCODE_ENDPOINT, {
    latitude: lat,
    longitude: lon,
    localityLanguage: 'en',
  });
  const data = await fetchJson(url, { signal, schema: Schema, timeoutMs: 8_000 });
  const name = sanitizeName(data.city || data.locality || data.principalSubdivision || '');
  if (!name) return null;
  const admin1 = sanitizeName(data.principalSubdivision || '');
  return {
    name,
    admin1: admin1 && admin1 !== name ? admin1 : undefined,
    country: sanitizeName(data.countryName || '') || undefined,
    countryCode: data.countryCode,
  };
}
