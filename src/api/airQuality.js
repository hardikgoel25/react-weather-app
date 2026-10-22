import { z } from 'zod';
import { buildUrl, fetchJson } from './client.js';

export const AIR_QUALITY_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export const AIR_CURRENT_VARS = [
  'european_aqi', 'us_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide',
  'sulphur_dioxide', 'ozone', 'dust', 'aerosol_optical_depth', 'uv_index', 'uv_index_clear_sky',
  'alder_pollen', 'birch_pollen', 'grass_pollen', 'mugwort_pollen', 'olive_pollen', 'ragweed_pollen',
];

export const AIR_HOURLY_VARS = ['us_aqi', 'european_aqi', 'pm2_5', 'pm10'];

const field = z.number().nullable().optional();
const numbers = z.array(z.number().nullable()).optional();

export const AirQualitySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
  current_units: z.record(z.string(), z.string()).optional(),
  current: z.object({
    time: z.string(),
    ...Object.fromEntries(AIR_CURRENT_VARS.map((k) => [k, field])),
  }),
  hourly: z
    .object({
      time: z.array(z.string()),
      ...Object.fromEntries(AIR_HOURLY_VARS.map((k) => [k, numbers])),
    })
    .optional(),
});

export function fetchAirQuality({ lat, lon, signal }) {
  const url = buildUrl(AIR_QUALITY_ENDPOINT, {
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    past_days: 1,
    forecast_days: 2,
    current: AIR_CURRENT_VARS,
    hourly: AIR_HOURLY_VARS,
  });
  return fetchJson(url, { signal, schema: AirQualitySchema, timeoutMs: 12_000 });
}
