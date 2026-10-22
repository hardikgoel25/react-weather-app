import clsx from 'clsx';
import {
  ArrowUpDown, BellRing, CloudFog, CloudLightning, CloudRain, Factory, Snowflake, Sun,
  Sunrise, Sunset, Thermometer, ThermometerSnowflake, Wind,
} from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { tone } from '../../utils/tones.js';

const ICONS = {
  rain: CloudRain,
  snow: Snowflake,
  thunder: CloudLightning,
  uv: Sun,
  wind: Wind,
  heat: Thermometer,
  cold: ThermometerSnowflake,
  fog: CloudFog,
  air: Factory,
  swing: ArrowUpDown,
  sunrise: Sunrise,
  sunset: Sunset,
  sun: Sun,
};

const TONE_FOR = { danger: 'bad', warn: 'warn', info: 'info' };

export function HeadsUp({ insights }) {
  if (!insights?.length) return null;
  return (
    <Card title="Heads-up" icon={BellRing} subtitle="Computed from the forecast — not an official warning">
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {insights.map((item) => {
          const Icon = ICONS[item.icon] ?? BellRing;
          const palette = tone(TONE_FOR[item.severity] ?? 'info');
          return (
            <li
              key={item.id}
              className={clsx('flex items-start gap-3 rounded-2xl border p-3', palette.bg, palette.border)}
            >
              <Icon className={clsx('mt-0.5 size-5 shrink-0', palette.text)} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-medium leading-tight">{item.title}</p>
                <p className="mt-0.5 text-sm text-fg-muted">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
