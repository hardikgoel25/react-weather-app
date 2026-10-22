import { isNum, formatNumber } from './format.js';

export const TEMPERATURE_UNITS = [
  { value: 'celsius', label: '°C' },
  { value: 'fahrenheit', label: '°F' },
];

export const WIND_UNITS = [
  { value: 'kmh', label: 'km/h' },
  { value: 'mph', label: 'mph' },
  { value: 'ms', label: 'm/s' },
  { value: 'kn', label: 'kn' },
];

export const PRECIP_UNITS = [
  { value: 'mm', label: 'mm' },
  { value: 'inch', label: 'in' },
];

export const PRESSURE_UNITS = [
  { value: 'hpa', label: 'hPa' },
  { value: 'inhg', label: 'inHg' },
  { value: 'mmhg', label: 'mmHg' },
];

export const TIME_FORMATS = [
  { value: '12h', label: '12-hour' },
  { value: '24h', label: '24-hour' },
];

export const THEMES = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const DEFAULT_SETTINGS = Object.freeze({
  temperature: 'celsius',
  windSpeed: 'kmh',
  precipitation: 'mm',
  pressure: 'hpa',
  timeFormat: '12h',
  theme: 'auto',
});

/* ---------- conversions to canonical units (for thresholds/rules) ---------- */

export function toCelsius(v, unit) {
  if (!isNum(v)) return null;
  return unit === 'fahrenheit' ? ((v - 32) * 5) / 9 : v;
}

const KMH_FACTOR = { kmh: 1, mph: 1.609344, ms: 3.6, kn: 1.852 };

export function toKmh(v, unit) {
  if (!isNum(v)) return null;
  return v * (KMH_FACTOR[unit] ?? 1);
}

export function toMm(v, unit) {
  if (!isNum(v)) return null;
  return unit === 'inch' ? v * 25.4 : v;
}

/* ---------- formatting ---------- */

export function tempUnitLabel(unit) {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function windUnitLabel(unit) {
  return WIND_UNITS.find((u) => u.value === unit)?.label ?? 'km/h';
}

export function precipUnitLabel(unit) {
  return unit === 'inch' ? 'in' : 'mm';
}

export function pressureUnitLabel(unit) {
  return PRESSURE_UNITS.find((u) => u.value === unit)?.label ?? 'hPa';
}

export function distanceUnitFor(windUnit) {
  return windUnit === 'mph' ? 'mi' : 'km';
}

export function formatTemp(v, { digits = 0, withUnit = false, unit = 'celsius', signed = false } = {}) {
  if (!isNum(v)) return '—';
  const rounded = Number(v.toFixed(digits)) || 0; // avoid "-0"
  const sign = signed && rounded > 0 ? '+' : '';
  const text = `${sign}${formatNumber(rounded, { digits })}°`;
  return withUnit ? `${text}${unit === 'fahrenheit' ? 'F' : 'C'}` : text;
}

export function formatWind(v, unit = 'kmh', { digits } = {}) {
  if (!isNum(v)) return '—';
  const d = digits ?? (unit === 'ms' ? 1 : 0);
  return `${formatNumber(v, { digits: d })} ${windUnitLabel(unit)}`;
}

export function formatPrecip(v, unit = 'mm') {
  if (!isNum(v)) return '—';
  if (unit === 'inch') return `${formatNumber(v, { digits: 2 })} in`;
  return `${formatNumber(v, { digits: v < 10 ? 1 : 0 })} mm`;
}

export function formatSnow(v, unit = 'mm') {
  // Open-Meteo reports snowfall in cm when precipitation_unit=mm, in inches otherwise.
  if (!isNum(v)) return '—';
  if (unit === 'inch') return `${formatNumber(v, { digits: 1 })} in`;
  return `${formatNumber(v, { digits: 1 })} cm`;
}

export function convertPressure(hpa, unit = 'hpa') {
  if (!isNum(hpa)) return null;
  if (unit === 'inhg') return hpa * 0.02953;
  if (unit === 'mmhg') return hpa * 0.750062;
  return hpa;
}

export function formatPressure(hpa, unit = 'hpa') {
  const v = convertPressure(hpa, unit);
  if (!isNum(v)) return '—';
  const digits = unit === 'inhg' ? 2 : 0;
  return `${formatNumber(v, { digits })} ${pressureUnitLabel(unit)}`;
}

export function formatDistance(meters, windUnit = 'kmh') {
  if (!isNum(meters)) return '—';
  if (distanceUnitFor(windUnit) === 'mi') {
    const mi = meters / 1609.344;
    return `${formatNumber(mi, { digits: mi < 10 ? 1 : 0 })} mi`;
  }
  const km = meters / 1000;
  return `${formatNumber(km, { digits: km < 10 ? 1 : 0 })} km`;
}
