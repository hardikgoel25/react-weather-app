import { z } from 'zod';
import { buildUrl, fetchJson } from './client.js';

export const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
export const FORECAST_DAYS = 16;
export const PAST_DAYS = 1;

export const CURRENT_VARS = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day',
  'precipitation', 'rain', 'showers', 'snowfall', 'weather_code', 'cloud_cover',
  'pressure_msl', 'surface_pressure', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
];

export const HOURLY_VARS = [
  'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature',
  'precipitation_probability', 'precipitation', 'rain', 'showers', 'snowfall', 'weather_code',
  'pressure_msl', 'cloud_cover', 'visibility', 'wind_speed_10m', 'wind_direction_10m',
  'wind_gusts_10m', 'uv_index', 'is_day',
];

export const DAILY_VARS = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'apparent_temperature_max',
  'apparent_temperature_min', 'sunrise', 'sunset', 'daylight_duration', 'sunshine_duration',
  'uv_index_max', 'precipitation_sum', 'rain_sum', 'showers_sum', 'snowfall_sum',
  'precipitation_hours', 'precipitation_probability_max', 'wind_speed_10m_max',
  'wind_gusts_10m_max', 'wind_direction_10m_dominant',
];

const field = z.number().nullable().optional();
const numbers = z.array(z.number().nullable()).optional();
const strings = z.array(z.string().nullable()).optional();
const unitMap = z.record(z.string(), z.string()).optional();

const currentShape = Object.fromEntries(CURRENT_VARS.map((k) => [k, field]));
const hourlyShape = Object.fromEntries(HOURLY_VARS.map((k) => [k, numbers]));
const dailyShape = Object.fromEntries(
  DAILY_VARS.map((k) => [k, k === 'sunrise' || k === 'sunset' ? strings : numbers]),
);

export const ForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string().optional(),
  utc_offset_seconds: z.number(),
  elevation: z.number().optional(),
  current_units: unitMap,
  hourly_units: unitMap,
  daily_units: unitMap,
  current: z.object({ time: z.string(), interval: z.number().optional(), ...currentShape }),
  hourly: z.object({ time: z.array(z.string()), ...hourlyShape }),
  daily: z.object({ time: z.array(z.string()), ...dailyShape }),
});

/**
 * Fetch the full forecast for a point. Units are applied server-side so the
 * client never converts temperatures/speeds itself.
 */
export function fetchForecast({ lat, lon, units, signal }) {
  const url = buildUrl(FORECAST_ENDPOINT, {
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    past_days: PAST_DAYS,
    forecast_days: FORECAST_DAYS,
    current: CURRENT_VARS,
    hourly: HOURLY_VARS,
    daily: DAILY_VARS,
    temperature_unit: units.temperature,
    wind_speed_unit: units.windSpeed,
    precipitation_unit: units.precipitation,
  });
  return fetchJson(url, { signal, schema: ForecastSchema, timeoutMs: 12_000 });
}
