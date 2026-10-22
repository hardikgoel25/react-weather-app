import { useState } from 'react';
import clsx from 'clsx';
import { Flower2, Wind } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';
import { Sparkline } from '../ui/Sparkline.jsx';
import { EU_AQI_SCALE, POLLEN_TYPES, POLLUTANTS, US_AQI_SCALE, euAqiCategory, pollenLevel, usAqiCategory } from '../../utils/aqi.js';
import { tone } from '../../utils/tones.js';
import { clamp, formatNumber, isNum } from '../../utils/format.js';

const INDEXES = [
  { value: 'us', label: 'US AQI' },
  { value: 'eu', label: 'EU AQI' },
];

function ScaleBar({ scale, value, cap }) {
  const segments = scale.map((c, i) => {
    const start = i === 0 ? 0 : scale[i - 1].max;
    const end = Math.min(c.max, cap);
    return { ...c, width: ((end - start) / cap) * 100 };
  });
  const pos = isNum(value) ? clamp(value / cap, 0, 1) * 100 : null;
  return (
    <div className="relative mt-3" aria-hidden="true">
      <div className="flex h-2 overflow-hidden rounded-full">
        {segments.map((s) => (
          <div key={s.label} style={{ width: `${s.width}%`, background: s.color }} />
        ))}
      </div>
      {pos != null && (
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-fg shadow"
          style={{ left: `${pos}%` }}
        />
      )}
    </div>
  );
}

export function AirQualitySection({ air }) {
  const [index, setIndex] = useState('us');
  const current = air.current;
  const isUs = index === 'us';
  const value = isUs ? current.us_aqi : current.european_aqi;
  const cat = isUs ? usAqiCategory(value) : euAqiCategory(value);
  const palette = tone(cat?.tone ?? 'info');
  const history = air.last24.map((h) => (isUs ? h.usAqi : h.euAqi));

  return (
    <Card
      title="Air quality"
      icon={Wind}
      subtitle={isUs ? 'United States EPA index' : 'European Environment Agency index'}
      action={<SegmentedControl size="sm" label="Air quality index" options={INDEXES} value={index} onChange={setIndex} />}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <div className="flex items-end gap-3">
            <p className="text-5xl font-semibold leading-none tabular">{isNum(value) ? Math.round(value) : '—'}</p>
            {cat && (
              <span className={clsx('mb-1 rounded-full px-2.5 py-0.5 text-sm font-medium', palette.bg, palette.text)}>
                {cat.label}
              </span>
            )}
          </div>
          <ScaleBar scale={isUs ? US_AQI_SCALE : EU_AQI_SCALE} value={value} cap={isUs ? 300 : 120} />
          {cat && <p className="mt-3 text-sm text-fg-muted">{cat.advice}</p>}
          {history.filter(isNum).length > 2 && (
            <div className="mt-4">
              <Sparkline values={history} color={cat?.color ?? '#7dd3fc'} height={44} label={`${isUs ? 'US' : 'European'} AQI over the past 24 hours`} />
              <p className="mt-1 text-[11px] uppercase tracking-wider text-fg-faint">Past 24 hours</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Pollutants</h3>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {POLLUTANTS.map((p) => {
              const v = current[p.key];
              const ratio = isNum(v) ? clamp(v / p.concern, 0, 1) : 0;
              return (
                <li key={p.key} className="rounded-xl bg-card p-2.5" title={p.description}>
                  <p className="text-xs text-fg-muted">{p.name}</p>
                  <p className="font-semibold tabular">
                    {isNum(v) ? formatNumber(v, { digits: v < 10 ? 1 : 0 }) : '—'}
                    <span className="ml-1 text-[11px] font-normal text-fg-faint">{p.unit}</span>
                  </p>
                  <div className="mt-1.5 h-1 rounded-full bg-fg/10" aria-hidden="true">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${ratio * 100}%`, background: ratio < 0.5 ? '#22c55e' : ratio < 0.8 ? '#eab308' : '#ef4444' }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {air.hasPollen && (
            <>
              <h3 className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                <Flower2 className="size-3.5" aria-hidden="true" /> Pollen
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {POLLEN_TYPES.map((p) => {
                  const level = pollenLevel(current[p.key]);
                  if (!level) return null;
                  const t = tone(level.tone);
                  return (
                    <li key={p.key} className={clsx('rounded-full px-2.5 py-1 text-xs font-medium', t.bg, t.text)}>
                      {p.name}: {level.label}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
