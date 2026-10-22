import { isNum } from './format.js';

/**
 * Category scales. `color` is a CSS colour used for dots/bars; `tone` maps to
 * the severity palette used across the UI (good → danger).
 */
export const US_AQI_SCALE = [
  { max: 50, label: 'Good', tone: 'good', color: '#22c55e', advice: 'Air quality is satisfactory. Enjoy your usual outdoor activities.' },
  { max: 100, label: 'Moderate', tone: 'ok', color: '#eab308', advice: 'Unusually sensitive people should consider limiting prolonged outdoor exertion.' },
  { max: 150, label: 'Unhealthy for sensitive groups', tone: 'warn', color: '#f97316', advice: 'People with heart or lung disease, older adults and children should reduce prolonged exertion outdoors.' },
  { max: 200, label: 'Unhealthy', tone: 'bad', color: '#ef4444', advice: 'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.' },
  { max: 300, label: 'Very unhealthy', tone: 'danger', color: '#a855f7', advice: 'Health alert: avoid outdoor exertion. Keep windows closed and use a purifier if you can.' },
  { max: Infinity, label: 'Hazardous', tone: 'danger', color: '#7f1d1d', advice: 'Emergency conditions. Stay indoors and keep activity low.' },
];

export const EU_AQI_SCALE = [
  { max: 20, label: 'Good', tone: 'good', color: '#50f0e6', advice: 'Air quality is good.' },
  { max: 40, label: 'Fair', tone: 'good', color: '#50ccaa', advice: 'Air quality is fair.' },
  { max: 60, label: 'Moderate', tone: 'ok', color: '#f0e641', advice: 'Sensitive people may want to limit strenuous outdoor activity.' },
  { max: 80, label: 'Poor', tone: 'warn', color: '#ff5050', advice: 'Consider reducing intense outdoor activity, especially if you have symptoms.' },
  { max: 100, label: 'Very poor', tone: 'bad', color: '#960032', advice: 'Reduce physical activity outdoors; sensitive groups should stay indoors.' },
  { max: Infinity, label: 'Extremely poor', tone: 'danger', color: '#7d2181', advice: 'Avoid outdoor activity. Keep windows closed.' },
];

function categorize(value, scale) {
  if (!isNum(value)) return null;
  return scale.find((c) => value <= c.max) ?? scale[scale.length - 1];
}

export function usAqiCategory(value) {
  return categorize(value, US_AQI_SCALE);
}

export function euAqiCategory(value) {
  return categorize(value, EU_AQI_SCALE);
}

/** Pollutant metadata. Thresholds are rough "concern" levels in µg/m³ (CO in mg/m³ after /1000). */
export const POLLUTANTS = [
  { key: 'pm2_5', name: 'PM2.5', description: 'Fine particles (≤2.5 µm)', unit: 'µg/m³', concern: 35 },
  { key: 'pm10', name: 'PM10', description: 'Coarse particles (≤10 µm)', unit: 'µg/m³', concern: 50 },
  { key: 'ozone', name: 'O₃', description: 'Ozone', unit: 'µg/m³', concern: 120 },
  { key: 'nitrogen_dioxide', name: 'NO₂', description: 'Nitrogen dioxide', unit: 'µg/m³', concern: 100 },
  { key: 'sulphur_dioxide', name: 'SO₂', description: 'Sulphur dioxide', unit: 'µg/m³', concern: 125 },
  { key: 'carbon_monoxide', name: 'CO', description: 'Carbon monoxide', unit: 'µg/m³', concern: 10000 },
];

export const POLLEN_TYPES = [
  { key: 'alder_pollen', name: 'Alder' },
  { key: 'birch_pollen', name: 'Birch' },
  { key: 'grass_pollen', name: 'Grass' },
  { key: 'mugwort_pollen', name: 'Mugwort' },
  { key: 'olive_pollen', name: 'Olive' },
  { key: 'ragweed_pollen', name: 'Ragweed' },
];

/** Generic pollen level (grains/m³). */
export function pollenLevel(value) {
  if (!isNum(value)) return null;
  if (value <= 0) return { label: 'None', tone: 'good', level: 0 };
  if (value < 20) return { label: 'Low', tone: 'good', level: 1 };
  if (value < 80) return { label: 'Moderate', tone: 'ok', level: 2 };
  if (value < 200) return { label: 'High', tone: 'warn', level: 3 };
  return { label: 'Very high', tone: 'danger', level: 4 };
}
