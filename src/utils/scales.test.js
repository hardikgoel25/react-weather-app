import { describe, expect, it } from 'vitest';
import { euAqiCategory, pollenLevel, usAqiCategory } from './aqi.js';
import { uvCategory, uvWindow } from './uv.js';
import { beaufort, compassLong, degToCompass } from './wind.js';
import { pressureTrend } from './pressure.js';
import { describeWeather, weatherIconName, weatherGroup } from './weatherCodes.js';
import { effectFor, gradientFor, tempColor } from './theme.js';

describe('air quality scales', () => {
  it('categorises US AQI', () => {
    expect(usAqiCategory(12).label).toBe('Good');
    expect(usAqiCategory(174).label).toBe('Unhealthy');
    expect(usAqiCategory(450).label).toBe('Hazardous');
    expect(usAqiCategory(null)).toBeNull();
  });
  it('categorises European AQI', () => {
    expect(euAqiCategory(23).label).toBe('Fair');
    expect(euAqiCategory(114).label).toBe('Extremely poor');
  });
  it('rates pollen', () => {
    expect(pollenLevel(0).label).toBe('None');
    expect(pollenLevel(30).label).toBe('Moderate');
    expect(pollenLevel(500).label).toBe('Very high');
    expect(pollenLevel(null)).toBeNull();
  });
});

describe('uv', () => {
  it('rounds before categorising', () => {
    expect(uvCategory(7.4).label).toBe('High');
    expect(uvCategory(7.6).label).toBe('Very high');
    expect(uvCategory(0).label).toBe('Low');
    expect(uvCategory(12).label).toBe('Extreme');
  });
  it('finds the high-UV window', () => {
    expect(uvWindow([0, 2, 6, 8, 7, 3, 0], 6)).toEqual([2, 4]);
    expect(uvWindow([0, 1, 2], 6)).toBeNull();
  });
});

describe('wind', () => {
  it('converts degrees to compass points', () => {
    expect(degToCompass(0)).toBe('N');
    expect(degToCompass(359)).toBe('N');
    expect(degToCompass(275)).toBe('W');
    expect(degToCompass(45)).toBe('NE');
    expect(degToCompass(null)).toBe('—');
    expect(compassLong(180)).toBe('South');
  });
  it('maps speed to Beaufort regardless of unit', () => {
    expect(beaufort(6, 'kmh')).toEqual({ number: 2, label: 'Light breeze' });
    expect(beaufort(30, 'ms').number).toBe(11);
    expect(beaufort(null, 'kmh')).toBeNull();
  });
});

describe('pressure trend', () => {
  it('detects rising / falling / steady', () => {
    expect(pressureTrend([1010, 1011, 1012, 1013.5], 3).trend).toBe('rising');
    expect(pressureTrend([1015, 1014, 1013, 1012], 3).trend).toBe('falling');
    expect(pressureTrend([1013, 1013.2, 1013.1, 1013.4], 3).trend).toBe('steady');
    expect(pressureTrend([1013], 0).trend).toBe('steady');
  });
});

describe('weather codes', () => {
  it('describes known and unknown codes', () => {
    expect(describeWeather(0)).toBe('Clear sky');
    expect(describeWeather(95)).toBe('Thunderstorm');
    expect(describeWeather(1234)).toBe('Unknown');
  });
  it('picks day/night icons', () => {
    expect(weatherIconName(0, true)).toBe('clear-day');
    expect(weatherIconName(0, false)).toBe('clear-night');
    expect(weatherIconName(63, false)).toBe('rain');
    expect(weatherGroup(82)).toBe('rain');
  });
});

describe('theme', () => {
  it('returns gradients and effects', () => {
    expect(gradientFor(0, true, 'dark')).toMatch(/^linear-gradient/);
    expect(gradientFor(0, true, 'light')).not.toBe(gradientFor(0, true, 'dark'));
    expect(effectFor(63, true)).toBe('rain');
    expect(effectFor(71, true)).toBe('snow');
    expect(effectFor(45, true)).toBe('fog');
    expect(effectFor(0, false)).toBe('stars');
    expect(effectFor(0, true)).toBeNull();
  });
  it('interpolates temperature colours', () => {
    expect(tempColor(-30)).toBe('rgb(129 140 248)');
    expect(tempColor(45)).toBe('rgb(239 68 68)');
    expect(tempColor(14)).toMatch(/^rgb\(/);
    expect(tempColor(null)).toBe('#94a3b8');
  });
});
