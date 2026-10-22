import { Sheet } from '../ui/Sheet.jsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import {
  DEFAULT_SETTINGS, PRECIP_UNITS, PRESSURE_UNITS, TEMPERATURE_UNITS, THEMES, TIME_FORMATS, WIND_UNITS,
} from '../../utils/units.js';
import { removeKey, STORAGE_KEYS } from '../../utils/storage.js';

function Row({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-fg-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function SettingsSheet({ open, onClose }) {
  const { settings, update } = useSettings();

  const clearData = () => {
    Object.values(STORAGE_KEYS).forEach(removeKey);
    window.location.replace(window.location.pathname);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <div className="divide-y divide-card-border">
        <Row label="Temperature">
          <SegmentedControl label="Temperature unit" options={TEMPERATURE_UNITS} value={settings.temperature} onChange={(v) => update({ temperature: v })} />
        </Row>
        <Row label="Wind speed">
          <SegmentedControl label="Wind speed unit" options={WIND_UNITS} value={settings.windSpeed} onChange={(v) => update({ windSpeed: v })} />
        </Row>
        <Row label="Precipitation">
          <SegmentedControl label="Precipitation unit" options={PRECIP_UNITS} value={settings.precipitation} onChange={(v) => update({ precipitation: v })} />
        </Row>
        <Row label="Pressure">
          <SegmentedControl label="Pressure unit" options={PRESSURE_UNITS} value={settings.pressure} onChange={(v) => update({ pressure: v })} />
        </Row>
        <Row label="Time format">
          <SegmentedControl label="Time format" options={TIME_FORMATS} value={settings.timeFormat} onChange={(v) => update({ timeFormat: v })} />
        </Row>
        <Row label="Appearance" hint="Auto follows your system setting.">
          <SegmentedControl label="Theme" options={THEMES} value={settings.theme} onChange={(v) => update({ theme: v })} />
        </Row>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update({ ...DEFAULT_SETTINGS })}
          className="focus-ring rounded-full border border-card-border bg-card px-4 py-2 text-sm font-medium hover:bg-card-strong"
        >
          Reset to defaults
        </button>
        <button
          type="button"
          onClick={clearData}
          className="focus-ring rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-500/20 dark:text-red-300"
        >
          Clear saved places &amp; cache
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-fg-faint">
        Settings and saved places are stored only in this browser. No account, no analytics. Weather data from
        Open-Meteo (CC BY 4.0).
      </p>
    </Sheet>
  );
}
