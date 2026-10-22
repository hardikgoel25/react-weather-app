import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';
import { formatHour, formatWeekday, parseLocal } from '../../utils/time.js';
import { formatPrecip, formatTemp, formatWind } from '../../utils/units.js';
import { clamp, formatNumber, formatPercent, isNum, maxOf, minOf } from '../../utils/format.js';
import { uvCategory } from '../../utils/uv.js';

const TABS = [
  { value: 'temp', label: 'Temp' },
  { value: 'precip', label: 'Rain' },
  { value: 'wind', label: 'Wind' },
  { value: 'humidity', label: 'Humidity' },
  { value: 'uv', label: 'UV' },
];

/** Width of an element, kept up to date with ResizeObserver. */
function useContainerWidth(ref) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function buildSpec(tab, hours, settings) {
  const col = (key) => hours.map((h) => h[key]);
  switch (tab) {
    case 'precip':
      return {
        title: 'Precipitation',
        bars: { label: 'Chance', values: col('precipProb'), color: '#38bdf8', domain: [0, 100], format: formatPercent },
        lines: [{ label: 'Amount', values: col('precip'), color: '#818cf8', area: true }],
        format: (v) => formatPrecip(v, settings.precipitation),
        min: 0,
      };
    case 'wind':
      return {
        title: 'Wind',
        lines: [
          { label: 'Wind', values: col('wind'), color: '#34d399', area: true },
          { label: 'Gusts', values: col('gusts'), color: '#a7f3d0', dashed: true },
        ],
        format: (v) => formatWind(v, settings.windSpeed),
        min: 0,
      };
    case 'humidity':
      return {
        title: 'Humidity and cloud cover',
        lines: [
          { label: 'Humidity', values: col('humidity'), color: '#60a5fa', area: true },
          { label: 'Cloud cover', values: col('cloud'), color: '#cbd5e1', dashed: true },
        ],
        format: formatPercent,
        domain: [0, 100],
      };
    case 'uv': {
      const values = col('uv');
      return {
        title: 'UV index',
        bars: {
          label: 'UV index',
          values,
          colorFor: (v) => uvCategory(v)?.color ?? '#94a3b8',
          domain: [0, Math.max(11, Math.ceil(maxOf(values) ?? 0))],
          format: (v) => formatNumber(v, { digits: 1 }),
        },
        lines: [],
        format: (v) => formatNumber(v, { digits: 1 }),
      };
    }
    default:
      return {
        title: 'Temperature',
        lines: [
          { label: 'Temperature', values: col('temp'), color: '#fbbf24', area: true },
          { label: 'Feels like', values: col('feels'), color: '#f87171', dashed: true },
        ],
        format: (v) => formatTemp(v),
        pad: 2,
      };
  }
}

function lineDomain(spec) {
  if (spec.domain) return spec.domain;
  const all = spec.lines.flatMap((l) => l.values).filter(isNum);
  if (all.length === 0) return [0, 1];
  let lo = minOf(all);
  let hi = maxOf(all);
  const pad = spec.pad ?? Math.max((hi - lo) * 0.15, 1);
  lo = spec.min != null ? Math.min(spec.min, lo) : lo - pad;
  hi += pad;
  if (hi === lo) hi = lo + 1;
  return [lo, hi];
}

function pathFor(values, x, y) {
  let d = '';
  let open = false;
  values.forEach((v, i) => {
    if (!isNum(v)) {
      open = false;
      return;
    }
    d += `${open ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
    open = true;
  });
  return d.trim();
}

function areaFor(values, x, y, baseline) {
  const runs = [];
  let run = [];
  values.forEach((v, i) => {
    if (isNum(v)) run.push([x(i), y(v)]);
    else if (run.length) {
      runs.push(run);
      run = [];
    }
  });
  if (run.length) runs.push(run);
  return runs
    .filter((r) => r.length > 1)
    .map((r) => {
      const pts = r.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
      return `${pts} L${r[r.length - 1][0].toFixed(1)},${baseline} L${r[0][0].toFixed(1)},${baseline} Z`;
    })
    .join(' ');
}

export function HourlyChart({ hours, settings, hour12 }) {
  const [tab, setTab] = useState('temp');
  const [hover, setHover] = useState(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const containerWidth = useContainerWidth(containerRef);
  const n = hours.length;

  // Render 1:1 with the container so text stays legible on narrow screens.
  const W = Math.max(320, Math.round(containerWidth) || 960);
  const narrow = W < 640;
  const H = narrow ? 210 : 250;
  const PAD = { l: narrow ? 38 : 44, r: narrow ? 38 : 44, t: 18, b: 30 };
  const INNER_W = W - PAD.l - PAD.r;
  const INNER_H = H - PAD.t - PAD.b;

  const spec = useMemo(() => buildSpec(tab, hours, settings), [tab, hours, settings]);
  const [lo, hi] = useMemo(() => lineDomain(spec), [spec]);
  const step = n > 1 ? INNER_W / (n - 1) : INNER_W;
  const x = (i) => PAD.l + i * step;
  const y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * INNER_H;
  const bars = spec.bars;
  const yBar = bars
    ? (v) => PAD.t + (1 - clamp((v - bars.domain[0]) / (bars.domain[1] - bars.domain[0]), 0, 1)) * INNER_H
    : null;
  const baseline = PAD.t + INNER_H;

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((k) => lo + (hi - lo) * k);
  const labelEvery = narrow ? 12 : 6;
  const xLabels = hours
    .map((h, i) => ({ i, p: parseLocal(h.time) }))
    .filter(({ i, p }) => i === 0 || (i >= 2 && p && p.hour % labelEvery === 0))
    .map(({ i, p }) => ({
      i,
      text: i === 0 ? 'Now' : p.hour === 0 ? formatWeekday(hours[i].time) : formatHour(hours[i].time, { hour12 }),
    }));

  const onMove = (event) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const px = ((event.clientX - rect.left) / rect.width) * W;
    setHover(clamp(Math.round((px - PAD.l) / step), 0, n - 1));
  };

  const hovered = hover != null ? hours[hover] : null;
  const summary = spec.lines[0]
    ? `${spec.title} over the next ${n} hours, from ${spec.format(minOf(spec.lines[0].values))} to ${spec.format(maxOf(spec.lines[0].values))}.`
    : `${spec.title} over the next ${n} hours, peaking at ${bars.format(maxOf(bars.values))}.`;

  if (n < 2) return null;

  return (
    <div className="mt-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl size="sm" label="Chart data" options={TABS} value={tab} onChange={setTab} />
        <ul className="flex flex-wrap gap-3 text-xs text-fg-muted" aria-hidden="true">
          {bars && (
            <li className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: bars.color ?? '#94a3b8' }} />
              {bars.label}
            </li>
          )}
          {spec.lines.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span
                className={clsx('inline-block h-0.5 w-4 rounded-full', l.dashed && 'border-t-2 border-dashed bg-transparent')}
                style={l.dashed ? { borderColor: l.color } : { background: l.color }}
              />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <div ref={containerRef} className="relative min-w-0" onPointerLeave={() => setHover(null)}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          className="block touch-pan-x select-none"
          role="img"
          aria-label={summary}
          onPointerMove={onMove}
          onPointerDown={onMove}
        >
          {gridValues.map((v, i) => (
            <g key={i}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={i === 0 ? 0.3 : 0.1} />
              <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity="0.65">
                {spec.format(v)}
              </text>
              {bars && (
                <text x={W - PAD.r + 6} y={y(v) + 4} textAnchor="start" fontSize="11" fill="currentColor" fillOpacity="0.65">
                  {bars.format(bars.domain[0] + (bars.domain[1] - bars.domain[0]) * (i / 4))}
                </text>
              )}
            </g>
          ))}

          {bars &&
            bars.values.map((v, i) =>
              isNum(v) && v > 0 ? (
                <rect
                  key={i}
                  x={x(i) - step * 0.35}
                  y={yBar(v)}
                  width={Math.max(step * 0.7, 1)}
                  height={baseline - yBar(v)}
                  rx={1.5}
                  fill={bars.colorFor ? bars.colorFor(v) : bars.color}
                  fillOpacity={hover === i ? 0.95 : 0.55}
                />
              ) : null,
            )}

          {spec.lines.map((l) => (
            <g key={l.label}>
              {l.area && <path d={areaFor(l.values, x, y, baseline)} fill={l.color} fillOpacity="0.14" />}
              <path
                d={pathFor(l.values, x, y)}
                fill="none"
                stroke={l.color}
                strokeWidth={l.dashed ? 1.75 : 2.25}
                strokeDasharray={l.dashed ? '5 4' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          ))}

          {xLabels.map(({ i, text }) => (
            <text key={i} x={x(i)} y={H - 10} textAnchor={i === 0 ? 'start' : 'middle'} fontSize="11" fill="currentColor" fillOpacity="0.75">
              {text}
            </text>
          ))}

          {hovered && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={baseline} stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 3" />
              {spec.lines.map(
                (l) =>
                  isNum(l.values[hover]) && (
                    <circle key={l.label} cx={x(hover)} cy={y(l.values[hover])} r="4.5" fill={l.color} stroke="white" strokeWidth="1.5" />
                  ),
              )}
            </g>
          )}
        </svg>

        {hovered && (
          <div
            className="glass-strong pointer-events-none absolute top-0 z-10 min-w-32 px-3 py-2 text-xs"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              transform: hover < n * 0.15 ? 'translateX(0)' : hover > n * 0.85 ? 'translateX(-100%)' : 'translateX(-50%)',
            }}
          >
            <p className="font-semibold">
              {hover === 0 ? 'Now' : `${formatWeekday(hovered.time)} ${formatHour(hovered.time, { hour12 })}`}
            </p>
            {bars && isNum(bars.values[hover]) && (
              <p className="text-fg-muted">
                {bars.label}: <span className="font-medium text-fg">{bars.format(bars.values[hover])}</span>
              </p>
            )}
            {spec.lines.map((l) => (
              <p key={l.label} className="text-fg-muted">
                {l.label}: <span className="font-medium text-fg">{isNum(l.values[hover]) ? spec.format(l.values[hover]) : '—'}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
