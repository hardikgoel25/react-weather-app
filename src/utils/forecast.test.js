import { describe, expect, it } from 'vitest';
import { buildAirModel, buildWeatherModel, findNowIndex, sunProgress } from './forecast.js';
import { ForecastSchema } from '../api/forecast.js';
import { AirQualitySchema } from '../api/airQuality.js';
import { makeAirQuality, makeForecast, NOW_KEY } from '../test/fixtures.js';

describe('fixtures', () => {
  it('satisfy the API schemas', () => {
    expect(ForecastSchema.safeParse(makeForecast()).success).toBe(true);
    expect(AirQualitySchema.safeParse(makeAirQuality()).success).toBe(true);
  });
});

describe('findNowIndex', () => {
  const times = ['2026-10-22T00:00', '2026-10-22T01:00', '2026-10-22T02:00'];
  it('finds the bucket containing now', () => {
    expect(findNowIndex(times, '2026-10-22T01:30')).toBe(1);
    expect(findNowIndex(times, '2026-10-22T02:00')).toBe(2);
  });
  it('clamps to the ends', () => {
    expect(findNowIndex(times, '2026-10-21T23:00')).toBe(0);
    expect(findNowIndex(times, '2026-10-23T05:00')).toBe(2);
    expect(findNowIndex([], NOW_KEY)).toBe(0);
  });
});

describe('buildWeatherModel', () => {
  const model = buildWeatherModel(makeForecast(), NOW_KEY);

  it('anchors hourly data at the current hour (not midnight)', () => {
    expect(model.nowIndex).toBe(24 + 14);
    expect(model.next48).toHaveLength(48);
    expect(model.next48[0].time).toBe('2026-10-22T14:00');
    expect(model.next24[23].time).toBe('2026-10-23T13:00');
  });

  it('treats the first daily entry as yesterday (past_days=1)', () => {
    expect(model.todayIndex).toBe(1);
    expect(model.today.time).toBe('2026-10-22');
    expect(model.yesterday.time).toBe('2026-10-21');
    expect(model.tomorrow.time).toBe('2026-10-23');
    expect(model.upcoming).toHaveLength(16);
  });

  it('derives comparisons and summaries', () => {
    expect(model.yesterdayNow.time).toBe('2026-10-21T14:00');
    expect(typeof model.tempDeltaVsYesterday).toBe('number');
    expect(model.daylightDelta).toBe(-60);
    expect(model.precipNext24).toBe(0);
    expect(model.uvPeak.time).toBe('2026-10-22T12:00');
    expect(model.sun.isDaytime).toBe(true);
    expect(model.pressure.trend).toBe('steady');
  });

  it('tolerates missing columns and nulls', () => {
    const raw = makeForecast({ hourlyOverrides: { uv_index: undefined, visibility: Array(408).fill(null) } });
    const m = buildWeatherModel(raw, NOW_KEY);
    expect(m.next48[0].uv).toBeNull();
    expect(m.next48[0].visibility).toBeNull();
    expect(m.uvPeak).toBeNull();
  });
});

describe('sunProgress', () => {
  const day = { sunrise: '2026-10-22T06:00', sunset: '2026-10-22T18:00' };
  it('tracks the sun across the day', () => {
    expect(sunProgress(day, '2026-10-22T12:00')).toMatchObject({ progress: 0.5, isDaytime: true, minutesToSunset: 360 });
    expect(sunProgress(day, '2026-10-22T04:00')).toMatchObject({ progress: 0, isDaytime: false, minutesToSunrise: 120 });
    expect(sunProgress(day, '2026-10-22T20:00').progress).toBe(1);
    expect(sunProgress(null, '2026-10-22T20:00')).toBeNull();
  });
});

describe('buildAirModel', () => {
  it('slices history and detects pollen', () => {
    const air = buildAirModel(makeAirQuality(), NOW_KEY);
    expect(air.nowIndex).toBe(24 + 14);
    expect(air.last24).toHaveLength(24);
    expect(air.last24[23].usAqi).toBe(120 + 14);
    expect(air.hasPollen).toBe(false);
    expect(buildAirModel(makeAirQuality({ current: { grass_pollen: 12 } }), NOW_KEY).hasPollen).toBe(true);
  });
});
