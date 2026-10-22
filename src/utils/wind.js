import { isNum } from './format.js';
import { toKmh } from './units.js';

const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** Degrees → 16-point compass abbreviation. */
export function degToCompass(deg) {
  if (!isNum(deg)) return '—';
  const index = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return COMPASS[index];
}

const COMPASS_LONG = {
  N: 'North', NNE: 'North-northeast', NE: 'Northeast', ENE: 'East-northeast',
  E: 'East', ESE: 'East-southeast', SE: 'Southeast', SSE: 'South-southeast',
  S: 'South', SSW: 'South-southwest', SW: 'Southwest', WSW: 'West-southwest',
  W: 'West', WNW: 'West-northwest', NW: 'Northwest', NNW: 'North-northwest',
};

export function compassLong(deg) {
  return COMPASS_LONG[degToCompass(deg)] ?? '—';
}

const BEAUFORT = [
  { max: 1, label: 'Calm' },
  { max: 5, label: 'Light air' },
  { max: 11, label: 'Light breeze' },
  { max: 19, label: 'Gentle breeze' },
  { max: 28, label: 'Moderate breeze' },
  { max: 38, label: 'Fresh breeze' },
  { max: 49, label: 'Strong breeze' },
  { max: 61, label: 'Near gale' },
  { max: 74, label: 'Gale' },
  { max: 88, label: 'Strong gale' },
  { max: 102, label: 'Storm' },
  { max: 117, label: 'Violent storm' },
  { max: Infinity, label: 'Hurricane' },
];

/** Beaufort number + label from a speed in the given unit. */
export function beaufort(speed, unit = 'kmh') {
  const kmh = toKmh(speed, unit);
  if (!isNum(kmh)) return null;
  const index = BEAUFORT.findIndex((b) => kmh <= b.max);
  const i = index === -1 ? BEAUFORT.length - 1 : index;
  return { number: i, label: BEAUFORT[i].label };
}
