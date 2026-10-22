import { describe, expect, it } from 'vitest';
import { deriveInsights } from './insights.js';
import { buildAirModel, buildWeatherModel } from './forecast.js';
import { DEFAULT_SETTINGS } from './units.js';
import { makeAirQuality, makeForecast, NOW_KEY } from '../test/fixtures.js';

const NOW_INDEX = 24 + 14;

function modelWith(overrides) {
  return buildWeatherModel(makeForecast(overrides), NOW_KEY);
}

function column(base, patches) {
  const col = Array(408).fill(base);
  for (const [index, value] of Object.entries(patches)) col[Number(index)] = value;
  return col;
}

describe('deriveInsights', () => {
  it('returns a pleasant-conditions note when nothing is notable', () => {
    const model = modelWith({
      current: { apparent_temperature: 24, weather_code: 1 },
      dailyOverrides: { uv_index_max: Array(17).fill(3), apparent_temperature_max: Array(17).fill(26) },
    });
    const items = deriveInsights(model, null, DEFAULT_SETTINGS);
    expect(items.map((i) => i.id)).toEqual(['pleasant']);
  });

  it('flags upcoming rain with the hour', () => {
    const model = modelWith({
      hourlyOverrides: { precipitation_probability: column(0, { [NOW_INDEX + 3]: 80 }) },
    });
    const rain = deriveInsights(model, null, DEFAULT_SETTINGS).find((i) => i.id === 'precip-soon');
    expect(rain).toBeDefined();
    expect(rain.title).toMatch(/Rain likely around 5/);
    expect(rain.severity).toBe('warn');
  });

  it('flags high UV, strong wind and poor air, sorted by severity', () => {
    const model = modelWith({
      dailyOverrides: { uv_index_max: Array(17).fill(9) },
      hourlyOverrides: { wind_gusts_10m: column(18, { [NOW_INDEX + 5]: 75 }) },
    });
    const air = buildAirModel(makeAirQuality(), NOW_KEY);
    const items = deriveInsights(model, air, DEFAULT_SETTINGS);
    const ids = items.map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(['uv', 'wind', 'air']));
    expect(items[0].severity).toBe('danger');
    expect(items.find((i) => i.id === 'uv').title).toContain('Very high');
    expect(items.find((i) => i.id === 'wind').detail).toContain('75 km/h');
    expect(items.at(-1).severity).not.toBe('danger');
  });

  it('evaluates thresholds in canonical units', () => {
    // 95 °F feels-like should trigger heat even when the display unit is Fahrenheit.
    const model = modelWith({ dailyOverrides: { apparent_temperature_max: Array(17).fill(95) } });
    const items = deriveInsights(model, null, { ...DEFAULT_SETTINGS, temperature: 'fahrenheit' });
    expect(items.find((i) => i.id === 'heat')).toBeDefined();
    // ...but 95 in Celsius display is extreme heat.
    const celsius = deriveInsights(model, null, DEFAULT_SETTINGS);
    expect(celsius.find((i) => i.id === 'heat').severity).toBe('danger');
  });

  it('flags frost and thunderstorms', () => {
    const model = modelWith({
      dailyOverrides: { temperature_2m_min: Array(17).fill(1) },
      hourlyOverrides: { weather_code: column(1, { [NOW_INDEX + 30]: 95 }) },
    });
    const ids = deriveInsights(model, null, DEFAULT_SETTINGS).map((i) => i.id);
    expect(ids).toContain('frost');
    expect(ids).toContain('thunder');
  });

  it('handles a missing model', () => {
    expect(deriveInsights(null, null, DEFAULT_SETTINGS)).toEqual([]);
  });
});
