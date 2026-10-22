import { addDays } from '../utils/time.js';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Synthetic Open-Meteo forecast payload: `days` days of hourly data starting at
 * `startDate` 00:00 (the first day plays the role of `past_days=1`).
 */
export function makeForecast({ startDate = '2026-10-21', days = 17, hourlyOverrides = {}, dailyOverrides = {}, current = {} } = {}) {
  const hourly = {
    time: [], temperature_2m: [], relative_humidity_2m: [], dew_point_2m: [], apparent_temperature: [],
    precipitation_probability: [], precipitation: [], rain: [], showers: [], snowfall: [], weather_code: [],
    pressure_msl: [], cloud_cover: [], visibility: [], wind_speed_10m: [], wind_direction_10m: [],
    wind_gusts_10m: [], uv_index: [], is_day: [],
  };
  const daily = {
    time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], apparent_temperature_max: [],
    apparent_temperature_min: [], sunrise: [], sunset: [], daylight_duration: [], sunshine_duration: [],
    uv_index_max: [], precipitation_sum: [], rain_sum: [], showers_sum: [], snowfall_sum: [], precipitation_hours: [],
    precipitation_probability_max: [], wind_speed_10m_max: [], wind_gusts_10m_max: [], wind_direction_10m_dominant: [],
  };

  let date = startDate;
  for (let d = 0; d < days; d += 1) {
    for (let h = 0; h < 24; h += 1) {
      const temp = 22 + 7 * Math.sin(((h - 9) / 24) * Math.PI * 2) + d * 0.3;
      hourly.time.push(`${date}T${pad(h)}:00`);
      hourly.temperature_2m.push(Number(temp.toFixed(1)));
      hourly.relative_humidity_2m.push(50);
      hourly.dew_point_2m.push(12);
      hourly.apparent_temperature.push(Number((temp + 1).toFixed(1)));
      hourly.precipitation_probability.push(0);
      hourly.precipitation.push(0);
      hourly.rain.push(0);
      hourly.showers.push(0);
      hourly.snowfall.push(0);
      hourly.weather_code.push(1);
      hourly.pressure_msl.push(1013 + d * 0.5);
      hourly.cloud_cover.push(20);
      hourly.visibility.push(24140);
      hourly.wind_speed_10m.push(10);
      hourly.wind_direction_10m.push(270);
      hourly.wind_gusts_10m.push(18);
      hourly.uv_index.push(h >= 7 && h <= 17 ? Math.max(0, 7 - Math.abs(12 - h)) : 0);
      hourly.is_day.push(h >= 6 && h < 18 ? 1 : 0);
    }
    daily.time.push(date);
    daily.weather_code.push(1);
    daily.temperature_2m_max.push(29 + d * 0.3);
    daily.temperature_2m_min.push(15 + d * 0.3);
    daily.apparent_temperature_max.push(30 + d * 0.3);
    daily.apparent_temperature_min.push(16 + d * 0.3);
    daily.sunrise.push(`${date}T06:30`);
    daily.sunset.push(`${date}T17:45`);
    daily.daylight_duration.push(40500 - d * 60);
    daily.sunshine_duration.push(36000);
    daily.uv_index_max.push(7);
    daily.precipitation_sum.push(0);
    daily.rain_sum.push(0);
    daily.showers_sum.push(0);
    daily.snowfall_sum.push(0);
    daily.precipitation_hours.push(0);
    daily.precipitation_probability_max.push(0);
    daily.wind_speed_10m_max.push(14);
    daily.wind_gusts_10m_max.push(25);
    daily.wind_direction_10m_dominant.push(270);
    date = addDays(date, 1);
  }

  Object.assign(hourly, hourlyOverrides);
  Object.assign(daily, dailyOverrides);

  return {
    latitude: 28.65,
    longitude: 77.23,
    timezone: 'Asia/Kolkata',
    timezone_abbreviation: 'GMT+5:30',
    utc_offset_seconds: 19800,
    elevation: 227,
    current_units: { temperature_2m: '°C' },
    hourly_units: { temperature_2m: '°C' },
    daily_units: { temperature_2m_max: '°C' },
    current: {
      time: '2026-10-22T14:45',
      interval: 900,
      temperature_2m: 29.7,
      relative_humidity_2m: 49,
      apparent_temperature: 31.6,
      is_day: 1,
      precipitation: 0,
      rain: 0,
      showers: 0,
      snowfall: 0,
      weather_code: 0,
      cloud_cover: 0,
      pressure_msl: 1014.1,
      surface_pressure: 988.5,
      wind_speed_10m: 6,
      wind_direction_10m: 275,
      wind_gusts_10m: 18.4,
      ...current,
    },
    hourly,
    daily,
  };
}

export function makeAirQuality({ current = {} } = {}) {
  const time = [];
  const us = [];
  for (let d = 0; d < 3; d += 1) {
    for (let h = 0; h < 24; h += 1) {
      time.push(`${addDays('2026-10-21', d)}T${pad(h)}:00`);
      us.push(120 + h);
    }
  }
  return {
    latitude: 28.7,
    longitude: 77.2,
    timezone: 'Asia/Kolkata',
    current: {
      time: '2026-10-22T14:00',
      european_aqi: 114,
      us_aqi: 174,
      pm10: 141.6,
      pm2_5: 52.5,
      carbon_monoxide: 504,
      nitrogen_dioxide: 7.7,
      sulphur_dioxide: 21.4,
      ozone: 194,
      dust: 172,
      aerosol_optical_depth: 0.47,
      uv_index: 2.75,
      uv_index_clear_sky: 2.75,
      alder_pollen: null,
      birch_pollen: null,
      grass_pollen: null,
      mugwort_pollen: null,
      olive_pollen: null,
      ragweed_pollen: null,
      ...current,
    },
    hourly: { time, us_aqi: us, european_aqi: us.map((v) => v / 2), pm2_5: us.map(() => 50), pm10: us.map(() => 100) },
  };
}

export const NOW_KEY = '2026-10-22T14:45';
