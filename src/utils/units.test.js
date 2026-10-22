import { describe, expect, it } from 'vitest';
import {
  formatDistance, formatPrecip, formatPressure, formatTemp, formatWind, toCelsius, toKmh, toMm,
} from './units.js';

describe('conversions', () => {
  it('converts to canonical units', () => {
    expect(toCelsius(50, 'fahrenheit')).toBeCloseTo(10);
    expect(toCelsius(21, 'celsius')).toBe(21);
    expect(toKmh(10, 'ms')).toBeCloseTo(36);
    expect(toKmh(10, 'mph')).toBeCloseTo(16.09, 1);
    expect(toKmh(10, 'kn')).toBeCloseTo(18.52);
    expect(toMm(1, 'inch')).toBeCloseTo(25.4);
  });
  it('returns null for non-numbers', () => {
    expect(toCelsius(null, 'celsius')).toBeNull();
    expect(toKmh(undefined, 'kmh')).toBeNull();
  });
});

describe('formatting', () => {
  it('formats temperatures without negative zero', () => {
    expect(formatTemp(29.6)).toBe('30°');
    expect(formatTemp(-0.4)).toBe('0°');
    expect(formatTemp(-3.6)).toBe('-4°');
    expect(formatTemp(12, { withUnit: true, unit: 'fahrenheit' })).toBe('12°F');
    expect(formatTemp(2, { signed: true })).toBe('+2°');
    expect(formatTemp(null)).toBe('—');
  });
  it('formats wind with sensible precision', () => {
    expect(formatWind(12.4, 'kmh')).toBe('12 km/h');
    expect(formatWind(3.456, 'ms')).toBe('3.5 m/s');
    expect(formatWind(8, 'kn')).toBe('8 kn');
  });
  it('formats precipitation', () => {
    expect(formatPrecip(0.4, 'mm')).toBe('0.4 mm');
    expect(formatPrecip(12.6, 'mm')).toBe('13 mm');
    expect(formatPrecip(0.02, 'inch')).toBe('0.02 in');
  });
  it('formats pressure in all units', () => {
    expect(formatPressure(1013.25, 'hpa')).toBe('1,013 hPa');
    expect(formatPressure(1013.25, 'inhg')).toBe('29.92 inHg');
    expect(formatPressure(1013.25, 'mmhg')).toBe('760 mmHg');
  });
  it('formats distance based on the wind unit', () => {
    expect(formatDistance(24140, 'mph')).toBe('15 mi');
    expect(formatDistance(8500, 'kmh')).toBe('8.5 km');
    expect(formatDistance(null, 'kmh')).toBe('—');
  });
});
