/**
 * Turns raw Open-Meteo payloads into a convenient, display-oriented model.
 * Everything here is pure so it can be unit-tested without React.
 */
import { hourKey, minutesBetween } from './time.js';
import { pressureTrend } from './pressure.js';
import { clamp, isNum, maxOf, sumOf } from './format.js';

const HOUR_FIELDS = {
  temp: 'temperature_2m',
  feels: 'apparent_temperature',
  humidity: 'relative_humidity_2m',
  dewPoint: 'dew_point_2m',
  precipProb: 'precipitation_probability',
  precip: 'precipitation',
  rain: 'rain',
  showers: 'showers',
  snowfall: 'snowfall',
  code: 'weather_code',
  pressure: 'pressure_msl',
  cloud: 'cloud_cover',
  visibility: 'visibility',
  wind: 'wind_speed_10m',
  windDir: 'wind_direction_10m',
  gusts: 'wind_gusts_10m',
  uv: 'uv_index',
  isDay: 'is_day',
};

const DAY_FIELDS = {
  code: 'weather_code',
  tMax: 'temperature_2m_max',
  tMin: 'temperature_2m_min',
  feelsMax: 'apparent_temperature_max',
  feelsMin: 'apparent_temperature_min',
  sunrise: 'sunrise',
  sunset: 'sunset',
  daylight: 'daylight_duration',
  sunshine: 'sunshine_duration',
  uvMax: 'uv_index_max',
  precipSum: 'precipitation_sum',
  rainSum: 'rain_sum',
  showersSum: 'showers_sum',
  snowSum: 'snowfall_sum',
  precipHours: 'precipitation_hours',
  precipProbMax: 'precipitation_probability_max',
  windMax: 'wind_speed_10m_max',
  gustsMax: 'wind_gusts_10m_max',
  windDirDominant: 'wind_direction_10m_dominant',
};

/** Column-oriented API block → array of row objects. */
export function rowsFrom(columns, fields) {
  const times = Array.isArray(columns?.time) ? columns.time : [];
  return times.map((time, i) => {
    const row = { time };
    for (const [key, source] of Object.entries(fields)) {
      const col = columns[source];
      row[key] = Array.isArray(col) && col[i] != null ? col[i] : null;
    }
    return row;
  });
}

/** Index of the hour bucket that contains `nowKey`. */
export function findNowIndex(times, nowKey) {
  const nowHour = hourKey(nowKey);
  if (!nowHour || times.length === 0) return 0;
  const index = times.findIndex((t) => t >= nowHour);
  if (index === -1) return times.length - 1;
  // `findIndex(t >= nowHour)` lands on the exact bucket when times are hourly
  // and aligned to :00; if the first time is already after now, use it.
  return index;
}

/** Sun arc progress for a day. */
export function sunProgress(day, nowKey) {
  if (!day?.sunrise || !day?.sunset) return null;
  const total = minutesBetween(day.sunrise, day.sunset);
  const elapsed = minutesBetween(day.sunrise, nowKey);
  if (total == null || elapsed == null || total <= 0) return null;
  return {
    progress: clamp(elapsed / total, 0, 1),
    isDaytime: elapsed >= 0 && elapsed <= total,
    minutesToSunrise: -elapsed,
    minutesToSunset: total - elapsed,
    totalMinutes: total,
  };
}

export function buildWeatherModel(raw, nowKey) {
  const hours = rowsFrom(raw.hourly, HOUR_FIELDS);
  const days = rowsFrom(raw.daily, DAY_FIELDS);
  const todayDate = nowKey.slice(0, 10);

  const nowIndex = findNowIndex(hours.map((h) => h.time), nowKey);
  let todayIndex = days.findIndex((d) => d.time === todayDate);
  if (todayIndex === -1) todayIndex = Math.min(1, Math.max(0, days.length - 1));

  const today = days[todayIndex] ?? null;
  const yesterday = todayIndex > 0 ? days[todayIndex - 1] : null;
  const tomorrow = days[todayIndex + 1] ?? null;
  const next48 = hours.slice(nowIndex, nowIndex + 48);
  const next24 = next48.slice(0, 24);
  const yesterdayNow = nowIndex - 24 >= 0 ? hours[nowIndex - 24] : null;
  const todayHours = hours.filter((h) => h.time.startsWith(todayDate));
  const current = raw.current ?? {};

  const uvPeak = todayHours.reduce(
    (best, h) => (isNum(h.uv) && (best == null || h.uv > best.uv) ? h : best),
    null,
  );

  return {
    timezone: raw.timezone,
    timezoneAbbreviation: raw.timezone_abbreviation,
    utcOffsetSeconds: raw.utc_offset_seconds,
    elevation: raw.elevation,
    units: {
      current: raw.current_units ?? {},
      hourly: raw.hourly_units ?? {},
      daily: raw.daily_units ?? {},
    },
    nowKey,
    todayDate,
    nowIndex,
    todayIndex,
    current,
    hours,
    days,
    next48,
    next24,
    todayHours,
    today,
    yesterday,
    tomorrow,
    upcoming: days.slice(todayIndex),
    yesterdayNow,
    uvPeak,
    pressure: pressureTrend(hours.map((h) => h.pressure), nowIndex, 3),
    sun: sunProgress(today, nowKey),
    precipNext24: sumOf(next24.map((h) => h.precip)),
    precipProbNext24: maxOf(next24.map((h) => h.precipProb)),
    tempDeltaVsYesterday:
      isNum(current.temperature_2m) && isNum(yesterdayNow?.temp)
        ? current.temperature_2m - yesterdayNow.temp
        : null,
    daylightDelta:
      isNum(today?.daylight) && isNum(yesterday?.daylight) ? today.daylight - yesterday.daylight : null,
  };
}

const AIR_HOUR_FIELDS = {
  usAqi: 'us_aqi',
  euAqi: 'european_aqi',
  pm2_5: 'pm2_5',
  pm10: 'pm10',
};

export function buildAirModel(raw, nowKey) {
  const hours = rowsFrom(raw.hourly, AIR_HOUR_FIELDS);
  const nowIndex = findNowIndex(hours.map((h) => h.time), nowKey);
  const current = raw.current ?? {};
  return {
    current,
    hours,
    nowIndex,
    last24: hours.slice(Math.max(0, nowIndex - 23), nowIndex + 1),
    next24: hours.slice(nowIndex, nowIndex + 24),
    hasPollen: ['alder_pollen', 'birch_pollen', 'grass_pollen', 'mugwort_pollen', 'olive_pollen', 'ragweed_pollen']
      .some((k) => isNum(current[k])),
  };
}
