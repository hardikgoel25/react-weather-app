import { isNum } from './format.js';

export const UV_SCALE = [
  { max: 2, label: 'Low', tone: 'good', color: '#22c55e', advice: 'No protection needed. Enjoy being outside.' },
  { max: 5, label: 'Moderate', tone: 'ok', color: '#eab308', advice: 'Wear sunscreen and a hat; seek shade around midday.' },
  { max: 7, label: 'High', tone: 'warn', color: '#f97316', advice: 'Reduce time in the sun between 11 AM and 3 PM. Sunscreen SPF 30+.' },
  { max: 10, label: 'Very high', tone: 'bad', color: '#ef4444', advice: 'Unprotected skin burns quickly. Cover up and stay in the shade.' },
  { max: Infinity, label: 'Extreme', tone: 'danger', color: '#a855f7', advice: 'Avoid sun exposure. Skin can burn in minutes.' },
];

export function uvCategory(value) {
  if (!isNum(value)) return null;
  const rounded = Math.round(value);
  return UV_SCALE.find((c) => rounded <= c.max) ?? UV_SCALE[UV_SCALE.length - 1];
}

/** Returns the [startIndex, endIndex] (inclusive) of the contiguous window where uv >= threshold, or null. */
export function uvWindow(values, threshold = 6) {
  let start = -1;
  let end = -1;
  values.forEach((v, i) => {
    if (isNum(v) && v >= threshold) {
      if (start === -1) start = i;
      end = i;
    }
  });
  return start === -1 ? null : [start, end];
}
