import { useMemo } from 'react';
import clsx from 'clsx';
import { Clock } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { WeatherIcon } from '../ui/WeatherIcon.jsx';
import { HourlyChart } from './HourlyChart.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { buildTimeline } from '../../utils/timeline.js';
import { formatClock, formatHour, formatWeekday, parseLocal } from '../../utils/time.js';
import { formatTemp } from '../../utils/units.js';
import { describeWeather } from '../../utils/weatherCodes.js';
import { isNum } from '../../utils/format.js';

function HourItem({ hour, isNow, hour12 }) {
  const parts = parseLocal(hour.time);
  const label = isNow ? 'Now' : parts?.hour === 0 ? formatWeekday(hour.time) : formatHour(hour.time, { hour12 });
  const prob = isNum(hour.precipProb) && hour.precipProb >= 10 ? `${Math.round(hour.precipProb)}%` : '';
  return (
    <li
      className={clsx(
        'flex w-[4.4rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-sm',
        isNow && 'bg-card-strong',
      )}
      aria-label={`${label}: ${describeWeather(hour.code)}, ${formatTemp(hour.temp)}${prob ? `, ${prob} chance of precipitation` : ''}`}
    >
      <span className={clsx('text-xs', isNow ? 'font-semibold' : 'text-fg-muted')}>{label}</span>
      <WeatherIcon code={hour.code} isDay={hour.isDay !== 0} size={40} />
      <span className="h-4 text-[11px] font-medium text-sky-700 dark:text-sky-300" aria-hidden="true">
        {prob}
      </span>
      <span className="font-semibold tabular">{formatTemp(hour.temp)}</span>
    </li>
  );
}

function SunMarker({ kind, time, hour12 }) {
  return (
    <li
      className="flex w-[4.4rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-sm"
      aria-label={`${kind === 'sunrise' ? 'Sunrise' : 'Sunset'} at ${formatClock(time, { hour12 })}`}
    >
      <span className="text-xs text-fg-muted">{formatClock(time, { hour12 })}</span>
      <WeatherIcon name={kind} size={40} />
      <span className="h-4" aria-hidden="true" />
      <span className="text-xs font-medium capitalize">{kind}</span>
    </li>
  );
}

export function HourlySection({ model }) {
  const { settings, hour12 } = useSettings();
  const items = useMemo(() => buildTimeline(model), [model]);

  return (
    <Card title="Hourly forecast" icon={Clock} subtitle="Next 48 hours · scroll sideways" className="min-w-0">
      <ul className="-mx-4 flex snap-x gap-1 overflow-x-auto px-4 pb-1 scrollbar-hide sm:-mx-5 sm:px-5" aria-label="Hour by hour">
        {items.map((item) =>
          item.kind === 'hour' ? (
            <HourItem key={item.hour.time} hour={item.hour} isNow={item.isNow} hour12={hour12} />
          ) : (
            <SunMarker key={`${item.kind}-${item.time}`} kind={item.kind} time={item.time} hour12={hour12} />
          ),
        )}
      </ul>
      <HourlyChart hours={model.next48} settings={settings} hour12={hour12} />
    </Card>
  );
}
