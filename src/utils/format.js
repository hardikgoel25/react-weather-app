export const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function round(v, digits = 0) {
  if (!isNum(v)) return null;
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

export function formatNumber(v, { digits = 0, locale } = {}) {
  if (!isNum(v)) return '—';
  const safe = Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v; // avoid "-0"
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    }).format(safe);
  } catch {
    return String(round(v, digits));
  }
}

export function formatPercent(v) {
  return isNum(v) ? `${Math.round(v)}%` : '—';
}

/** Map a value in [min, max] to [0, 1]. */
export function normalize(v, min, max) {
  if (!isNum(v) || !isNum(min) || !isNum(max) || max === min) return 0;
  return clamp((v - min) / (max - min), 0, 1);
}

export function average(values) {
  const nums = values.filter(isNum);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function maxOf(values) {
  const nums = values.filter(isNum);
  return nums.length ? Math.max(...nums) : null;
}

export function minOf(values) {
  const nums = values.filter(isNum);
  return nums.length ? Math.min(...nums) : null;
}

export function sumOf(values) {
  const nums = values.filter(isNum);
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}
