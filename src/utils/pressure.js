import { isNum } from './format.js';

/**
 * Pressure trend from an hourly pressure series (hPa).
 * Compares the value at `index` with the value `hoursBack` earlier.
 */
export function pressureTrend(values, index, hoursBack = 3) {
  if (!Array.isArray(values) || !isNum(values[index])) return { trend: 'steady', delta: 0 };
  const prevIndex = index - hoursBack;
  if (prevIndex < 0 || !isNum(values[prevIndex])) return { trend: 'steady', delta: 0 };
  const delta = values[index] - values[prevIndex];
  if (delta >= 1) return { trend: 'rising', delta };
  if (delta <= -1) return { trend: 'falling', delta };
  return { trend: 'steady', delta };
}

export function describePressure(hpa) {
  if (!isNum(hpa)) return '';
  if (hpa >= 1030) return 'High pressure — usually settled, dry weather.';
  if (hpa >= 1013) return 'Slightly above average — fair conditions likely.';
  if (hpa >= 1000) return 'Slightly below average — changeable weather.';
  return 'Low pressure — unsettled, wet or windy weather is likely.';
}
