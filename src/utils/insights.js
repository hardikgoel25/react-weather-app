/**
 * Rule-based "heads-up" notices derived from the forecast and air quality.
 * Open-Meteo has no official alerts feed, so these are computed client-side.
 * Thresholds are evaluated in canonical units (°C, km/h, mm) regardless of the
 * user's display units.
 */
import { formatHour, formatClock } from './time.js';
import { toCelsius, toKmh, toMm, formatTemp, formatWind, formatPrecip, formatSnow } from './units.js';
import { usAqiCategory } from './aqi.js';
import { uvWindow } from './uv.js';
import { isNum } from './format.js';
import { THUNDER_CODES, FOG_CODES, isPrecipitating } from './weatherCodes.js';

const SEVERITY_RANK = { danger: 0, warn: 1, info: 2 };

export function deriveInsights(model, air, settings) {
  if (!model) return [];
  const out = [];
  const t = settings.temperature;
  const w = settings.windSpeed;
  const p = settings.precipitation;
  const hour12 = settings.timeFormat !== '24h';
  const fmtHour = (time) => formatHour(time, { hour12 });
  const { current, next24, next48, today, tonightMin } = withDerived(model);

  /* ---- precipitation ---- */
  const rainingNow = isNum(current.precipitation) && current.precipitation > 0 && isPrecipitating(current.weather_code);
  const firstWet = next24.findIndex(
    (h, i) => i > 0 && ((isNum(h.precipProb) && h.precipProb >= 50) || (toMm(h.precip, p) ?? 0) >= 0.3),
  );
  if (rainingNow) {
    const clears = next24.findIndex((h, i) => i > 0 && (h.precipProb ?? 0) < 30 && (toMm(h.precip, p) ?? 0) < 0.1);
    out.push({
      id: 'precip-now',
      severity: 'info',
      icon: 'rain',
      title: 'Precipitation now',
      detail: clears > 0 ? `Expected to ease around ${fmtHour(next24[clears].time)}.` : 'Expected to continue for the next several hours.',
    });
  } else if (firstWet > 0) {
    const h = next24[firstWet];
    out.push({
      id: 'precip-soon',
      severity: firstWet <= 3 ? 'warn' : 'info',
      icon: 'rain',
      title: firstWet <= 1 ? 'Rain starting soon' : `Rain likely around ${fmtHour(h.time)}`,
      detail: `${Math.round(h.precipProb ?? 0)}% chance${isNum(h.precip) && h.precip > 0 ? `, about ${formatPrecip(h.precip, p)}` : ''}.`,
    });
  }

  const heavyHour = next24.find((h) => (toMm(h.precip, p) ?? 0) >= 5);
  const heavyDay = (toMm(today?.precipSum, p) ?? 0) >= 20;
  if (heavyHour || heavyDay) {
    out.push({
      id: 'precip-heavy',
      severity: 'warn',
      icon: 'rain',
      title: 'Heavy rain expected',
      detail: heavyHour
        ? `Up to ${formatPrecip(heavyHour.precip, p)}/h around ${fmtHour(heavyHour.time)}.`
        : `About ${formatPrecip(today.precipSum, p)} in total today.`,
    });
  }

  const snowSum = toMm(today?.snowSum, p);
  if (isNum(today?.snowSum) && today.snowSum > 0 && snowSum > 0) {
    out.push({
      id: 'snow',
      severity: today.snowSum >= 5 ? 'warn' : 'info',
      icon: 'snow',
      title: 'Snow expected today',
      detail: `Around ${formatSnow(today.snowSum, p)} of fresh snow.`,
    });
  }

  const thunder = next48.find((h) => THUNDER_CODES.has(h.code));
  if (thunder) {
    out.push({
      id: 'thunder',
      severity: 'warn',
      icon: 'thunder',
      title: 'Thunderstorms possible',
      detail: `Around ${fmtHour(thunder.time)}${thunder.time.slice(0, 10) !== model.todayDate ? ' tomorrow' : ''}. Avoid open ground and tall trees.`,
    });
  }

  /* ---- UV ---- */
  if (isNum(today?.uvMax) && today.uvMax >= 6) {
    const window = uvWindow(model.todayHours.map((h) => h.uv), 6);
    const range = window
      ? `${fmtHour(model.todayHours[window[0]].time)} – ${fmtHour(model.todayHours[window[1]].time)}`
      : 'around midday';
    out.push({
      id: 'uv',
      severity: today.uvMax >= 8 ? 'danger' : 'warn',
      icon: 'uv',
      title: `${today.uvMax >= 8 ? 'Very high' : 'High'} UV index (${Math.round(today.uvMax)})`,
      detail: `Protect your skin ${range}.`,
    });
  }

  /* ---- wind ---- */
  const gustKmh = Math.max(...next24.map((h) => toKmh(h.gusts, w) ?? 0), 0);
  if (gustKmh >= 40) {
    const peak = next24.reduce((best, h) => ((h.gusts ?? 0) > (best?.gusts ?? 0) ? h : best), null);
    out.push({
      id: 'wind',
      severity: gustKmh >= 70 ? 'danger' : 'warn',
      icon: 'wind',
      title: gustKmh >= 70 ? 'Damaging gusts possible' : 'Windy conditions',
      detail: `Gusts up to ${formatWind(peak?.gusts, w)} around ${fmtHour(peak?.time)}.`,
    });
  }

  /* ---- temperature stress ---- */
  const feelsMaxC = toCelsius(today?.feelsMax, t);
  const feelsMinC = toCelsius(tonightMin, t);
  if (isNum(feelsMaxC) && feelsMaxC >= 30) {
    out.push({
      id: 'heat',
      severity: feelsMaxC >= 38 ? 'danger' : 'warn',
      icon: 'heat',
      title: feelsMaxC >= 38 ? 'Extreme heat' : 'Hot day ahead',
      detail: `Feels like up to ${formatTemp(today.feelsMax)}. Stay hydrated and avoid midday exertion.`,
    });
  }
  if (isNum(feelsMinC) && feelsMinC <= 0) {
    out.push({
      id: 'cold',
      severity: feelsMinC <= -12 ? 'danger' : 'warn',
      icon: 'cold',
      title: feelsMinC <= -12 ? 'Dangerous cold' : 'Freezing conditions',
      detail: `Feels like ${formatTemp(tonightMin)} at the coldest. Dress in layers and watch for ice.`,
    });
  } else if (isNum(toCelsius(today?.tMin, t)) && toCelsius(today.tMin, t) <= 2) {
    out.push({
      id: 'frost',
      severity: 'info',
      icon: 'cold',
      title: 'Frost possible overnight',
      detail: `Low of ${formatTemp(today.tMin)}. Cover sensitive plants.`,
    });
  }

  /* ---- fog / visibility ---- */
  const fogHour = next24.slice(0, 8).find((h) => FOG_CODES.has(h.code) || (isNum(h.visibility) && h.visibility < 1000));
  if (fogHour) {
    out.push({
      id: 'fog',
      severity: 'warn',
      icon: 'fog',
      title: 'Low visibility',
      detail: `Fog or haze ${fogHour === next24[0] ? 'now' : `around ${fmtHour(fogHour.time)}`}. Take care when driving.`,
    });
  }

  /* ---- air quality ---- */
  const aqi = air?.current?.us_aqi;
  const aqiCat = usAqiCategory(aqi);
  if (aqiCat && aqi >= 101) {
    out.push({
      id: 'air',
      severity: aqi >= 151 ? 'danger' : 'warn',
      icon: 'air',
      title: `Air quality: ${aqiCat.label.toLowerCase()}`,
      detail: `US AQI ${Math.round(aqi)}. ${aqiCat.advice}`,
    });
  }

  /* ---- temperature swing ---- */
  const swingC = isNum(today?.tMax) && isNum(today?.tMin) ? toCelsius(today.tMax, t) - toCelsius(today.tMin, t) : null;
  if (isNum(swingC) && swingC >= 15) {
    out.push({
      id: 'swing',
      severity: 'info',
      icon: 'swing',
      title: 'Big temperature swing',
      detail: `From ${formatTemp(today.tMin)} to ${formatTemp(today.tMax)} today. Bring a layer.`,
    });
  }

  /* ---- sunrise / sunset coming up ---- */
  if (model.sun && !model.sun.isDaytime && model.sun.minutesToSunrise > 0 && model.sun.minutesToSunrise <= 90) {
    out.push({
      id: 'sunrise',
      severity: 'info',
      icon: 'sunrise',
      title: 'Sunrise soon',
      detail: `At ${formatClock(today.sunrise, { hour12 })}.`,
    });
  } else if (model.sun && model.sun.isDaytime && model.sun.minutesToSunset > 0 && model.sun.minutesToSunset <= 90) {
    out.push({
      id: 'sunset',
      severity: 'info',
      icon: 'sunset',
      title: 'Sunset soon',
      detail: `At ${formatClock(today.sunset, { hour12 })}.`,
    });
  }

  if (out.length === 0 && isNum(current.weather_code) && current.weather_code <= 2) {
    const feelsC = toCelsius(current.apparent_temperature, t);
    if (isNum(feelsC) && feelsC >= 16 && feelsC <= 28) {
      out.push({
        id: 'pleasant',
        severity: 'info',
        icon: 'sun',
        title: 'Pleasant conditions',
        detail: 'Comfortable temperatures and mostly clear skies. A good time to be outside.',
      });
    }
  }

  return out.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

function withDerived(model) {
  const next24 = model.next24 ?? [];
  const next48 = model.next48 ?? [];
  const tonightMin = next24.length
    ? Math.min(...next24.map((h) => (isNum(h.feels) ? h.feels : Infinity)))
    : null;
  return {
    current: model.current ?? {},
    next24,
    next48,
    today: model.today,
    tonightMin: Number.isFinite(tonightMin) ? tonightMin : null,
  };
}
