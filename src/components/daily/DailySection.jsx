import { useState } from 'react';
import clsx from 'clsx';
import { CalendarDays, ChevronDown, Droplets, Sun, Sunrise, Sunset, Thermometer, Wind } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';
import { WeatherIcon } from '../ui/WeatherIcon.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { dayLabel, formatClock, formatDayMonth, formatDuration } from '../../utils/time.js';
import { formatPrecip, formatSnow, formatTemp, formatWind, toCelsius } from '../../utils/units.js';
import { describeWeather } from '../../utils/weatherCodes.js';
import { degToCompass } from '../../utils/wind.js';
import { uvCategory } from '../../utils/uv.js';
import { tempColor } from '../../utils/theme.js';
import { isNum, maxOf, minOf, normalize } from '../../utils/format.js';

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
];

export function TempRangeBar({ min, max, periodMin, periodMax, marker, tempUnit }) {
  const left = normalize(min, periodMin, periodMax) * 100;
  const right = normalize(max, periodMin, periodMax) * 100;
  const markerPos = isNum(marker) ? normalize(marker, periodMin, periodMax) * 100 : null;
  return (
    <span className="relative block h-1.5 flex-1 rounded-full bg-fg/10" aria-hidden="true">
      <span
        className="absolute inset-y-0 rounded-full"
        style={{
          left: `${left}%`,
          width: `${Math.max(right - left, 4)}%`,
          background: `linear-gradient(90deg, ${tempColor(toCelsius(min, tempUnit))}, ${tempColor(toCelsius(max, tempUnit))})`,
        }}
      />
      {markerPos != null && (
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fg bg-[var(--bg-base)] shadow"
          style={{ left: `${markerPos}%` }}
        />
      )}
    </span>
  );
}

function Stat({ icon: Icon, label, value }) {
  if (value == null || value === '—') return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-fg-faint">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function DailyRow({ day, isToday, currentTemp, periodMin, periodMax, expanded, onToggle, settings, hour12, todayDate }) {
  const label = dayLabel(day.time, todayDate);
  const prob = isNum(day.precipProbMax) && day.precipProbMax >= 10 ? `${Math.round(day.precipProbMax)}%` : '';
  const uv = uvCategory(day.uvMax);
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="focus-ring grid w-full grid-cols-[4.6rem_2.5rem_2.4rem_minmax(0,1fr)_1.25rem] items-center gap-2 rounded-xl py-2 text-left sm:grid-cols-[5.4rem_2.5rem_2.6rem_minmax(0,1fr)_1.25rem]"
        aria-label={`${label}: ${describeWeather(day.code)}, high ${formatTemp(day.tMax)}, low ${formatTemp(day.tMin)}${prob ? `, ${prob} chance of precipitation` : ''}`}
      >
        <span className="truncate">
          <span className={clsx('block font-medium', isToday && 'font-semibold')}>{label}</span>
          <span className="block text-[11px] text-fg-faint">{formatDayMonth(day.time)}</span>
        </span>
        <WeatherIcon code={day.code} size={36} />
        <span className="text-xs font-medium text-sky-700 tabular dark:text-sky-300" aria-hidden="true">
          {prob}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-right text-fg-muted tabular">{formatTemp(day.tMin)}</span>
          <TempRangeBar
            min={day.tMin}
            max={day.tMax}
            periodMin={periodMin}
            periodMax={periodMax}
            marker={isToday ? currentTemp : null}
            tempUnit={settings.temperature}
          />
          <span className="w-9 shrink-0 font-semibold tabular">{formatTemp(day.tMax)}</span>
        </span>
        <ChevronDown className={clsx('size-4 text-fg-faint transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="mb-2 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-card px-3 py-3 text-sm sm:grid-cols-3 animate-fade-in">
          <p className="col-span-full text-fg-muted">{describeWeather(day.code)}</p>
          <Stat icon={Thermometer} label="Feels like" value={`${formatTemp(day.feelsMin)} – ${formatTemp(day.feelsMax)}`} />
          <Stat
            icon={Droplets}
            label="Precipitation"
            value={
              isNum(day.precipSum)
                ? `${formatPrecip(day.precipSum, settings.precipitation)}${isNum(day.precipHours) && day.precipHours > 0 ? ` over ${Math.round(day.precipHours)} h` : ''}`
                : null
            }
          />
          <Stat icon={Droplets} label="Chance" value={isNum(day.precipProbMax) ? `${Math.round(day.precipProbMax)}%` : null} />
          {isNum(day.snowSum) && day.snowSum > 0 && (
            <Stat icon={Droplets} label="Snowfall" value={formatSnow(day.snowSum, settings.precipitation)} />
          )}
          <Stat
            icon={Wind}
            label="Wind"
            value={isNum(day.windMax) ? `${formatWind(day.windMax, settings.windSpeed)} ${degToCompass(day.windDirDominant)}` : null}
          />
          <Stat icon={Wind} label="Gusts" value={isNum(day.gustsMax) ? formatWind(day.gustsMax, settings.windSpeed) : null} />
          <Stat icon={Sun} label="UV max" value={uv ? `${Math.round(day.uvMax)} · ${uv.label}` : null} />
          <Stat icon={Sunrise} label="Sunrise" value={day.sunrise ? formatClock(day.sunrise, { hour12 }) : null} />
          <Stat icon={Sunset} label="Sunset" value={day.sunset ? formatClock(day.sunset, { hour12 }) : null} />
          <Stat icon={Sun} label="Daylight" value={isNum(day.daylight) ? formatDuration(day.daylight) : null} />
          <Stat icon={Sun} label="Sunshine" value={isNum(day.sunshine) ? formatDuration(day.sunshine) : null} />
        </div>
      )}
    </li>
  );
}

export function DailySection({ model }) {
  const { settings, hour12 } = useSettings();
  const [range, setRange] = useState(7);
  const [expanded, setExpanded] = useState(null);
  const days = model.upcoming.slice(0, range);
  const periodMin = minOf(days.map((d) => d.tMin));
  const periodMax = maxOf(days.map((d) => d.tMax));

  return (
    <Card
      title={`${days.length}-day forecast`}
      icon={CalendarDays}
      subtitle="Tap a day for details"
      action={<SegmentedControl size="sm" label="Forecast length" options={RANGES} value={range} onChange={setRange} />}
    >
      <ul className="divide-y divide-card-border">
        {days.map((day, i) => (
          <DailyRow
            key={day.time}
            day={day}
            isToday={i === 0}
            currentTemp={i === 0 ? model.current.temperature_2m : null}
            periodMin={periodMin}
            periodMax={periodMax}
            expanded={expanded === day.time}
            onToggle={() => setExpanded((prev) => (prev === day.time ? null : day.time))}
            settings={settings}
            hour12={hour12}
            todayDate={model.todayDate}
          />
        ))}
      </ul>
    </Card>
  );
}
