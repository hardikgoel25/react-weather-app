import { weatherGroup } from './weatherCodes.js';

/**
 * Background gradient stops per weather group × day/night × theme.
 * Dark theme: deep, saturated; light theme: pastel with dark text.
 */
const PALETTES = {
  clear: {
    day: { dark: ['#1d4ed8', '#0ea5e9'], light: ['#93c5fd', '#fef3c7'] },
    night: { dark: ['#070b1f', '#1e1b4b'], light: ['#c7d2fe', '#e0e7ff'] },
  },
  partly: {
    day: { dark: ['#1e40af', '#38bdf8'], light: ['#93c5fd', '#e0f2fe'] },
    night: { dark: ['#0f172a', '#312e81'], light: ['#cbd5e1', '#ddd6fe'] },
  },
  cloudy: {
    day: { dark: ['#334155', '#64748b'], light: ['#cbd5e1', '#e2e8f0'] },
    night: { dark: ['#0f172a', '#334155'], light: ['#cbd5e1', '#e2e8f0'] },
  },
  fog: {
    day: { dark: ['#475569', '#94a3b8'], light: ['#d1d5db', '#f1f5f9'] },
    night: { dark: ['#1e293b', '#475569'], light: ['#cbd5e1', '#e5e7eb'] },
  },
  drizzle: {
    day: { dark: ['#1e3a8a', '#475569'], light: ['#a5b4fc', '#cbd5e1'] },
    night: { dark: ['#0f172a', '#1e3a8a'], light: ['#a5b4fc', '#cbd5e1'] },
  },
  rain: {
    day: { dark: ['#172554', '#334155'], light: ['#93c5fd', '#94a3b8'] },
    night: { dark: ['#020617', '#1e293b'], light: ['#a5b4fc', '#cbd5e1'] },
  },
  sleet: {
    day: { dark: ['#1e3a8a', '#0e7490'], light: ['#bae6fd', '#cbd5e1'] },
    night: { dark: ['#0f172a', '#164e63'], light: ['#bae6fd', '#cbd5e1'] },
  },
  snow: {
    day: { dark: ['#0e7490', '#67e8f9'], light: ['#cffafe', '#f8fafc'] },
    night: { dark: ['#0f172a', '#155e75'], light: ['#bae6fd', '#e0f2fe'] },
  },
  thunder: {
    day: { dark: ['#1e1b4b', '#1f2937'], light: ['#a5b4fc', '#9ca3af'] },
    night: { dark: ['#030712', '#1e1b4b'], light: ['#a5b4fc', '#9ca3af'] },
  },
};

export function gradientFor(code, isDay = true, theme = 'dark') {
  const group = PALETTES[weatherGroup(code)] ?? PALETTES.clear;
  const stops = group[isDay ? 'day' : 'night'][theme === 'light' ? 'light' : 'dark'];
  return `linear-gradient(180deg, ${stops[0]} 0%, ${stops[1]} 100%)`;
}

/** Which decorative particle layer (if any) suits the weather. */
export function effectFor(code, isDay = true) {
  const group = weatherGroup(code);
  if (group === 'rain' || group === 'drizzle' || group === 'thunder' || group === 'sleet') return 'rain';
  if (group === 'snow') return 'snow';
  if (group === 'fog') return 'fog';
  if (group === 'clear' && !isDay) return 'stars';
  return null;
}

/** Temperature (°C) → colour for range bars. */
export function tempColor(celsius) {
  if (celsius == null || Number.isNaN(celsius)) return '#94a3b8';
  const stops = [
    [-20, [129, 140, 248]],
    [0, [96, 165, 250]],
    [10, [56, 189, 248]],
    [18, [52, 211, 153]],
    [24, [250, 204, 21]],
    [30, [249, 115, 22]],
    [38, [239, 68, 68]],
  ];
  if (celsius <= stops[0][0]) return rgb(stops[0][1]);
  if (celsius >= stops[stops.length - 1][0]) return rgb(stops[stops.length - 1][1]);
  for (let i = 0; i < stops.length - 1; i += 1) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (celsius >= t0 && celsius <= t1) {
      const k = (celsius - t0) / (t1 - t0);
      return rgb(c0.map((v, j) => Math.round(v + (c1[j] - v) * k)));
    }
  }
  return '#94a3b8';
}

function rgb([r, g, b]) {
  return `rgb(${r} ${g} ${b})`;
}
