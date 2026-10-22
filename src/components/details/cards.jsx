import clsx from 'clsx';
import {
  Cloud, Droplets, Eye, Gauge, Minus, Snowflake, Sun, Sunrise, Thermometer, TrendingDown, TrendingUp, Umbrella, Wind,
} from 'lucide-react';
import { DetailCard } from './DetailCard.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { uvCategory } from '../../utils/uv.js';
import { beaufort, compassLong, degToCompass } from '../../utils/wind.js';
import { describePressure } from '../../utils/pressure.js';
import {
  formatDistance, formatPrecip, formatPressure, formatSnow, formatTemp, formatWind, toCelsius, windUnitLabel,
} from '../../utils/units.js';
import { formatClock, formatDuration, formatHour, formatSignedMinutes } from '../../utils/time.js';
import { clamp, formatPercent, isNum } from '../../utils/format.js';

/* ------------------------------------------------------------------ UV */
export function UvCard({ model, air }) {
  const { hour12 } = useSettings();
  const nowHour = model.hours[model.nowIndex];
  const uv = isNum(nowHour?.uv) ? nowHour.uv : air?.current?.uv_index;
  const cat = uvCategory(uv);
  const pct = isNum(uv) ? clamp(uv / 11, 0, 1) * 100 : 0;
  const peak = model.uvPeak;
  return (
    <DetailCard
      title="UV index"
      icon={Sun}
      value={isNum(uv) ? Math.round(uv) : '—'}
      caption={
        cat
          ? `${peak && isNum(peak.uv) && peak.uv >= 1 ? `Peak ${Math.round(peak.uv)} at ${formatHour(peak.time, { hour12 })}. ` : ''}${cat.advice}`
          : 'No UV data for this hour.'
      }
    >
      {cat && <p className="mt-1 text-sm font-medium">{cat.label}</p>}
      <div
        className="relative mt-3 h-2 rounded-full"
        style={{ background: 'linear-gradient(90deg,#22c55e 0%,#eab308 30%,#f97316 55%,#ef4444 75%,#a855f7 100%)' }}
        aria-hidden="true"
      >
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-fg shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
    </DetailCard>
  );
}

/* ------------------------------------------------------------ Humidity */
function comfortFromDewPoint(celsius) {
  if (!isNum(celsius)) return '';
  if (celsius < 10) return 'Dry and comfortable.';
  if (celsius < 16) return 'Comfortable.';
  if (celsius < 21) return 'A little humid.';
  if (celsius < 24) return 'Humid and sticky.';
  return 'Oppressively muggy.';
}

export function HumidityCard({ model }) {
  const { settings } = useSettings();
  const humidity = model.current.relative_humidity_2m;
  const dew = model.hours[model.nowIndex]?.dewPoint;
  return (
    <DetailCard
      title="Humidity"
      icon={Droplets}
      value={formatPercent(humidity)}
      caption={`${isNum(dew) ? `The dew point is ${formatTemp(dew)} right now. ` : ''}${comfortFromDewPoint(toCelsius(dew, settings.temperature))}`}
    >
      <div className="mt-3 h-2 rounded-full bg-fg/10" aria-hidden="true">
        <div className="h-full rounded-full bg-sky-400" style={{ width: `${clamp(humidity ?? 0, 0, 100)}%` }} />
      </div>
    </DetailCard>
  );
}

/* ---------------------------------------------------------------- Wind */
export function WindCard({ model }) {
  const { settings } = useSettings();
  const c = model.current;
  const dir = c.wind_direction_10m;
  const bft = beaufort(c.wind_speed_10m, settings.windSpeed);
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <DetailCard
      title="Wind"
      icon={Wind}
      caption={`${isNum(dir) ? `From the ${compassLong(dir).toLowerCase()}. ` : ''}${bft ? `${bft.label} (Beaufort ${bft.number}).` : ''}`}
    >
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="size-24 shrink-0" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.2" />
          {ticks.map((t) => (
            <line
              key={t}
              x1="50"
              y1="4"
              x2="50"
              y2={t % 90 === 0 ? 11 : 8}
              stroke="currentColor"
              strokeOpacity={t % 90 === 0 ? 0.7 : 0.3}
              strokeWidth={t % 90 === 0 ? 2 : 1}
              transform={`rotate(${t} 50 50)`}
            />
          ))}
          <text x="50" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor">N</text>
          <text x="82" y="53.5" textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.7">E</text>
          <text x="50" y="84" textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.7">S</text>
          <text x="18" y="53.5" textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.7">W</text>
          {isNum(dir) && (
            <g transform={`rotate(${dir + 180} 50 50)`}>
              <line x1="50" y1="66" x2="50" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <polygon points="50,26 43,40 57,40" fill="currentColor" />
            </g>
          )}
        </svg>
        <div className="min-w-0">
          <p className="text-3xl font-semibold leading-none tabular">
            {isNum(c.wind_speed_10m) ? Math.round(c.wind_speed_10m) : '—'}
            <span className="ml-1 text-base font-normal text-fg-muted">{windUnitLabel(settings.windSpeed)}</span>
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {isNum(dir) ? `${degToCompass(dir)} · ` : ''}
            {isNum(c.wind_gusts_10m) ? `Gusts ${formatWind(c.wind_gusts_10m, settings.windSpeed)}` : ''}
          </p>
        </div>
      </div>
    </DetailCard>
  );
}

/* ------------------------------------------------------------ Pressure */
export function PressureCard({ model }) {
  const { settings } = useSettings();
  const hpa = model.current.pressure_msl;
  const { trend, delta } = model.pressure;
  const Icon = trend === 'rising' ? TrendingUp : trend === 'falling' ? TrendingDown : Minus;
  const text = formatPressure(hpa, settings.pressure);
  const [num, unit] = text === '—' ? ['—', ''] : [text.slice(0, text.lastIndexOf(' ')), text.slice(text.lastIndexOf(' ') + 1)];
  return (
    <DetailCard title="Pressure" icon={Gauge} value={num} unit={unit} caption={describePressure(hpa)}>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
        <Icon className="size-4" aria-hidden="true" />
        {trend === 'steady' ? 'Steady' : `${trend === 'rising' ? 'Rising' : 'Falling'} ${Math.abs(delta).toFixed(1)} hPa over 3 h`}
      </p>
    </DetailCard>
  );
}

/* ---------------------------------------------------------- Visibility */
function describeVisibility(meters) {
  if (!isNum(meters)) return '';
  if (meters >= 20000) return 'Excellent — you can see for miles.';
  if (meters >= 10000) return 'Good visibility.';
  if (meters >= 4000) return 'Moderate — slight haze.';
  if (meters >= 1000) return 'Poor — take care on the road.';
  return 'Very poor — dense fog or heavy precipitation.';
}

export function VisibilityCard({ model }) {
  const { settings } = useSettings();
  const vis = model.hours[model.nowIndex]?.visibility;
  const text = formatDistance(vis, settings.windSpeed);
  const [num, unit] = text === '—' ? ['—', ''] : text.split(' ');
  return <DetailCard title="Visibility" icon={Eye} value={num} unit={unit} caption={describeVisibility(vis)} />;
}

/* --------------------------------------------------------- Cloud cover */
function describeClouds(pct) {
  if (!isNum(pct)) return '';
  if (pct < 10) return 'Clear skies.';
  if (pct < 30) return 'Mostly clear.';
  if (pct < 70) return 'Partly cloudy.';
  if (pct < 90) return 'Mostly cloudy.';
  return 'Overcast.';
}

export function CloudCard({ model }) {
  const pct = model.current.cloud_cover;
  return (
    <DetailCard title="Cloud cover" icon={Cloud} value={formatPercent(pct)} caption={describeClouds(pct)}>
      <div className="mt-3 h-2 rounded-full bg-fg/10" aria-hidden="true">
        <div className="h-full rounded-full bg-slate-300" style={{ width: `${clamp(pct ?? 0, 0, 100)}%` }} />
      </div>
    </DetailCard>
  );
}

/* ------------------------------------------------------- Precipitation */
export function PrecipitationCard({ model }) {
  const { settings } = useSettings();
  const now = model.current.precipitation;
  const next = model.precipNext24;
  const chance = model.precipProbNext24;
  const today = model.today?.precipSum;
  const unitText = formatPrecip(0, settings.precipitation).split(' ')[1];
  return (
    <DetailCard
      title="Precipitation"
      icon={Umbrella}
      value={isNum(now) ? formatPrecip(now, settings.precipitation).split(' ')[0] : '—'}
      unit={`${unitText} now`}
      caption={
        isNum(next)
          ? `${formatPrecip(next, settings.precipitation)} expected in the next 24 h${isNum(chance) ? ` (up to ${Math.round(chance)}% chance)` : ''}.${isNum(today) ? ` ${formatPrecip(today, settings.precipitation)} in total today.` : ''}`
          : 'No precipitation data.'
      }
    />
  );
}

/* --------------------------------------------------------------- Snow */
export function SnowCard({ model }) {
  const { settings } = useSettings();
  const now = model.current.snowfall;
  const today = model.today?.snowSum;
  return (
    <DetailCard
      title="Snowfall"
      icon={Snowflake}
      value={formatSnow(today, settings.precipitation)}
      caption={isNum(now) && now > 0 ? `Snowing now at ${formatSnow(now, settings.precipitation)} per hour.` : 'Expected total for today.'}
    />
  );
}

/* --------------------------------------------------------- Feels like */
export function FeelsLikeCard({ model }) {
  const { settings } = useSettings();
  const c = model.current;
  const feels = c.apparent_temperature;
  const diffC = isNum(feels) && isNum(c.temperature_2m) ? toCelsius(feels, settings.temperature) - toCelsius(c.temperature_2m, settings.temperature) : null;
  let caption = 'Similar to the actual temperature.';
  if (isNum(diffC) && diffC >= 1.5) caption = (c.relative_humidity_2m ?? 0) >= 60 ? 'Humidity is making it feel warmer.' : 'Sunshine is making it feel warmer.';
  else if (isNum(diffC) && diffC <= -1.5) caption = 'Wind is making it feel colder.';
  return <DetailCard title="Feels like" icon={Thermometer} value={formatTemp(feels)} caption={caption} />;
}

/* ---------------------------------------------------------------- Sun */
export function SunCard({ model }) {
  const { hour12 } = useSettings();
  const today = model.today;
  const sun = model.sun;
  const p = sun?.progress ?? 0;
  const sunX = 100 - 90 * Math.cos(Math.PI * p);
  const sunY = 70 - 90 * Math.sin(Math.PI * p);
  const inDay = sun?.isDaytime;
  let caption = '';
  if (sun) {
    if (inDay) caption = `Sunset in ${formatDuration(sun.minutesToSunset * 60)}.`;
    else if (sun.minutesToSunrise > 0) caption = `Sunrise in ${formatDuration(sun.minutesToSunrise * 60)}.`;
    else caption = 'The sun has set for today.';
  }
  const daylight = isNum(today?.daylight) ? `${formatDuration(today.daylight)} of daylight` : '';
  const delta = isNum(model.daylightDelta) ? formatSignedMinutes(model.daylightDelta) : '';

  return (
    <DetailCard title="Sunrise & sunset" icon={Sunrise} caption={`${daylight}${delta ? ` (${delta})` : ''}. ${caption}`}>
      <svg viewBox="0 0 200 84" className="mt-1 w-full" aria-hidden="true">
        <path d="M10,70 A90,90 0 0 1 190,70" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 4" />
        {inDay && p > 0 && (
          <path d={`M10,70 A90,90 0 0 1 ${sunX.toFixed(1)},${sunY.toFixed(1)}`} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
        )}
        <line x1="0" y1="70" x2="200" y2="70" stroke="currentColor" strokeOpacity="0.3" />
        {inDay && (
          <g>
            <circle cx={sunX} cy={sunY} r="10" fill="#fde047" fillOpacity="0.25" />
            <circle cx={sunX} cy={sunY} r="5.5" fill="#fde047" />
          </g>
        )}
      </svg>
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-fg-faint">Sunrise</p>
          <p className="font-medium tabular">{today?.sunrise ? formatClock(today.sunrise, { hour12 }) : '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-fg-faint">Sunset</p>
          <p className="font-medium tabular">{today?.sunset ? formatClock(today.sunset, { hour12 }) : '—'}</p>
        </div>
      </div>
    </DetailCard>
  );
}

export function DetailsGrid({ model, air, className }) {
  const snowy = (isNum(model.today?.snowSum) && model.today.snowSum > 0) || (isNum(model.current.snowfall) && model.current.snowfall > 0);
  return (
    <div className={clsx('grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3', className)}>
      <FeelsLikeCard model={model} />
      <UvCard model={model} air={air} />
      <WindCard model={model} />
      <HumidityCard model={model} />
      <PrecipitationCard model={model} />
      {snowy && <SnowCard model={model} />}
      <PressureCard model={model} />
      <VisibilityCard model={model} />
      <CloudCard model={model} />
      <SunCard model={model} />
    </div>
  );
}
