import clsx from 'clsx';
import { Star } from 'lucide-react';
import { WeatherIcon } from '../ui/WeatherIcon.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { useLocation } from '../../hooks/useLocation.js';
import { describeWeather } from '../../utils/weatherCodes.js';
import { formatTemp } from '../../utils/units.js';
import { formatClock, formatFullDate } from '../../utils/time.js';
import { countryFlag, locationSubtitle } from '../../utils/geo.js';
import { isNum } from '../../utils/format.js';

export function CurrentConditions({ model, location }) {
  const { hour12 } = useSettings();
  const { isSaved, toggleSaved } = useLocation();
  const current = model.current;
  const today = model.today;
  const isDay = current.is_day !== 0;
  const saved = isSaved(location.id);
  const delta = model.tempDeltaVsYesterday;
  const subtitle = locationSubtitle(location);

  return (
    <section aria-label="Current conditions" className="animate-rise px-1 pt-2">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="min-w-0">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              {countryFlag(location.countryCode) && (
                <span className="mr-1.5" aria-hidden="true">
                  {countryFlag(location.countryCode)}
                </span>
              )}
              {location.name}
            </h1>
            <button
              type="button"
              onClick={() => toggleSaved(location)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from saved locations' : 'Save this location'}
              title={saved ? 'Remove from saved' : 'Save location'}
              className="focus-ring rounded-full p-1.5 text-fg-muted transition hover:text-fg"
            >
              <Star
                className={clsx('size-5', saved && 'fill-current text-yellow-500 dark:text-yellow-300')}
                aria-hidden="true"
              />
            </button>
          </div>
          <p className="text-sm text-fg-muted">
            {subtitle && <span>{subtitle} · </span>}
            <time dateTime={model.nowKey}>
              {formatFullDate(model.nowKey)}, {formatClock(model.nowKey, { hour12 })}
            </time>
            {model.timezoneAbbreviation && <span className="text-fg-faint"> {model.timezoneAbbreviation}</span>}
          </p>

          <p className="mt-2 text-[6.5rem] font-extralight leading-none tracking-tighter tabular sm:text-[8rem]">
            {formatTemp(current.temperature_2m)}
          </p>
          <p className="text-xl font-medium">{describeWeather(current.weather_code)}</p>
          <p className="mt-1 text-sm text-fg-muted">
            {isNum(today?.tMax) && <span>H: {formatTemp(today.tMax)} </span>}
            {isNum(today?.tMin) && <span>L: {formatTemp(today.tMin)} </span>}
            {isNum(current.apparent_temperature) && (
              <span>· Feels like {formatTemp(current.apparent_temperature)}</span>
            )}
          </p>
          {isNum(delta) && Math.abs(delta) >= 1 && (
            <p className="mt-1 text-sm text-fg-muted">
              {Math.abs(Math.round(delta))}° {delta > 0 ? 'warmer' : 'cooler'} than yesterday at this time
            </p>
          )}
        </div>

        <WeatherIcon
          code={current.weather_code}
          isDay={isDay}
          size={176}
          className="drop-shadow-[0_12px_24px_rgb(0_0_0/0.25)] sm:mr-4"
        />
      </div>
    </section>
  );
}
