import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { SettingsContext } from './contexts.js';
import { DEFAULT_SETTINGS } from '../utils/units.js';
import { readJson, writeJson, STORAGE_KEYS } from '../utils/storage.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

const SETTING_SCHEMAS = {
  temperature: z.enum(['celsius', 'fahrenheit']),
  windSpeed: z.enum(['kmh', 'mph', 'ms', 'kn']),
  precipitation: z.enum(['mm', 'inch']),
  pressure: z.enum(['hpa', 'inhg', 'mmhg']),
  timeFormat: z.enum(['12h', '24h']),
  theme: z.enum(['auto', 'light', 'dark']),
};

const RawSchema = z.record(z.string(), z.unknown());

/** Restore settings key by key so one bad value never discards the rest. */
function initialSettings() {
  const raw = readJson(STORAGE_KEYS.settings, RawSchema, {});
  const settings = { ...DEFAULT_SETTINGS };
  for (const [key, schema] of Object.entries(SETTING_SCHEMAS)) {
    const parsed = schema.safeParse(raw[key]);
    if (parsed.success) settings[key] = parsed.data;
  }
  return settings;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(initialSettings);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev };
      for (const [key, value] of Object.entries(patch)) {
        const schema = SETTING_SCHEMAS[key];
        if (schema && schema.safeParse(value).success) next[key] = value;
      }
      writeJson(STORAGE_KEYS.settings, next);
      return next;
    });
  }, []);

  const resolvedTheme = settings.theme === 'auto' ? (prefersDark ? 'dark' : 'light') : settings.theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#0b1220' : '#dbeafe');
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      settings,
      update,
      resolvedTheme,
      reducedMotion,
      hour12: settings.timeFormat !== '24h',
    }),
    [settings, update, resolvedTheme, reducedMotion],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
