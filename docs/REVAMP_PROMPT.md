# Revamp prompt — React Weather App 2.0

> This is the brief used to rebuild this repository. It can be reused verbatim with any
> capable coding agent, or by a human engineer, to reproduce (or extend) the same result.

---

You are a senior front-end engineer. Completely revamp and expand the existing
React + Vite + Tailwind weather app in this repository
(https://github.com/hardikgoel25/react-weather-app). Keep the Apple-Weather-inspired
feel, but rebuild it as a production-grade, installable, accessible and resilient weather
application that uses the full breadth of the free, keyless Open-Meteo APIs.
Work in the current directory and rewrite freely; the old code is a reference, not a constraint.

## 1. Goals

1. **Modern UI** — glassmorphism cards on a weather-and-daylight-aware gradient, fluid
   type, animated SVG weather icons, smooth transitions, light/dark/auto theme, lightweight
   rain/snow/fog particle layers, and a responsive 1→3 column layout up to 1200 px.
2. **Breadth of data** — expose everything useful that Open-Meteo offers: 16-day daily,
   48-hour hourly, feels-like, dew point, precipitation probability, UV, visibility,
   pressure, cloud cover, gusts, sunrise/sunset/daylight, US + European AQI with pollutant
   breakdown, pollen (where available), and a "versus yesterday" comparison.
3. **Robustness** — timeouts, aborts, retries, schema validation, stale-while-revalidate
   caching, offline fallback, per-section error states, error boundary, no silent failures.
4. **Security** — zero API keys in the bundle, strict Content-Security-Policy, encoded
   URLs, validated inputs and storage, clean `npm audit`, hardened response headers.
5. **Maintainability** — feature-folder architecture, typed-ish boundaries (zod), hooks for
   every side effect, unit tests, lint, CI.

## 2. Non-negotiable constraints

- No API keys anywhere. Drop OpenWeatherMap; use Open-Meteo Geocoding (keyless) and a
  keyless reverse-geocoder for GPS positions. Delete `.env`.
- Build every outbound URL with `URLSearchParams`; never string-concatenate user input.
- Validate every API response with zod. Missing/invalid fields must degrade a single
  section, never crash the page.
- No `dangerouslySetInnerHTML`, no `eval`, no inline scripts/handlers. Ship a CSP that
  only allows the APIs actually used.
- Every `localStorage` read is wrapped in try/catch and validated; cap sizes.
- Honour `prefers-reduced-motion` and `prefers-color-scheme`.
- Never silently fall back to a hard-coded city. Geolocation denied/unavailable → clear
  message + last saved location (if any) + search prompt.
- Do not re-implement unit conversion on the client: pass `temperature_unit`,
  `wind_speed_unit`, `precipitation_unit` to Open-Meteo.
- Parse Open-Meteo's local ISO strings (no offset) *as strings*; do not feed them to
  `new Date()` for display — it would re-interpret them in the browser's zone.

## 3. Architecture

```
src/
  api/          open-meteo clients: forecast, airQuality, geocoding, reverseGeocode
                (shared fetch wrapper: timeout + AbortSignal + retry/backoff + zod parse)
  hooks/        useWeather, useAirQuality, useGeolocation, useSettings, useSavedLocations,
                useUrlLocation, useNow (minute tick), useOnlineStatus, useDebounce
  context/      SettingsProvider, LocationProvider
  components/
    layout/     AppShell, Header, Footer, Background (gradient + particles)
    search/     SearchBox (debounced autocomplete, keyboard nav), SuggestionList
    locations/  LocationChips (saved + recent), SaveButton
    current/    CurrentConditions, VsYesterday
    hourly/     HourlyStrip, HourlyChart (SVG, tabs)
    daily/      DailyList, DailyRow (expandable), TempRangeBar
    details/    UvCard, HumidityCard, WindCard, PressureCard, VisibilityCard,
                CloudCard, PrecipitationCard, SunCard
    airquality/ AirQualityCard, PollutantGrid, PollenCard
    insights/   HeadsUp (derived alerts)
    settings/   SettingsSheet
    ui/         Card, Skeleton, Toast, ErrorBoundary, Modal/Sheet, IconButton,
                SegmentedControl, WeatherIcon
  utils/        weatherCodes, units, time, aqi, uv, wind, pressure, insights, storage,
                geo (clamp/validate), format
  test/         setup + shared fixtures
```

## 4. Features (implement all)

### Location
- Search with debounced autocomplete (300 ms, min 2 chars, AbortController), keyboard
  navigation (↑ ↓ Enter Esc), rows show `name · admin1 · country` with a flag emoji.
  Pressing `/` focuses the search box.
- Geolocation with explicit states: idle / locating / granted / denied / unavailable /
  timeout. Reverse-geocode GPS positions to a human name.
- Saved locations (★, max 10) and recent searches (max 5) in localStorage; chips to
  switch; remove on hover/long-press.
- URL state `?lat=&lon=&name=` so every view is shareable; back/forward works; a Share
  button uses the Web Share API with clipboard fallback.

### Current conditions
- Large temperature, condition, feels-like, H/L, day/night-aware animated icon, and the
  location's local time ticking every minute in its own timezone.
- "N° warmer/cooler than yesterday at this time" using `past_days=1`.
- Background gradient keyed by weather code **and** `is_day`; particle layer for
  rain / snow / fog, disabled under reduced motion.

### Hourly
- 48-hour strip starting at the *current* hour, with "Now", icon, temperature and
  precipitation probability (hidden at 0 %), plus inline sunrise/sunset markers.
- Hand-written SVG chart (no chart library) with tabs: Temperature, Precipitation,
  Wind, Humidity, UV.

### Daily
- 7 days by default, toggle to 14 (fetch `forecast_days=16` once).
- Apple-style range bars normalised to the period's min/max with a marker for the current
  temperature on today.
- Rows expand to show feels-like range, precipitation sum/probability/hours, wind max,
  gusts and dominant direction, UV max, sunrise/sunset, daylight and sunshine duration.

### Details grid
UV (gauge, category, advice, today's peak hour) · Humidity (dew point + comfort text) ·
Wind (compass needle, speed, gusts, Beaufort label) · Pressure (hPa/inHg + 3-hour trend)
· Visibility (qualitative) · Cloud cover · Precipitation (now + next 24 h) · Sun (arc
progress, daylight length, delta vs yesterday). Show a Snowfall card only when relevant.

### Air quality
US AQI and European AQI with category, colour scale and health advice; PM2.5, PM10, O₃,
NO₂, SO₂, CO breakdown; 24-hour AQI sparkline; pollen (alder, birch, grass, mugwort,
olive, ragweed) only when values are non-null.

### Heads-up (derived insights)
Rule-based notices with severity, icon and time window: rain soon, heavy precipitation,
high UV window, strong wind/gusts, heat or cold stress (apparent temperature), poor air
quality, fog/low visibility, frost risk, large temperature swing.

### Settings
Temperature °C/°F · wind km/h / mph / m/s / kn · precipitation mm/in · 12/24-hour time ·
theme auto/light/dark. Persisted and applied to API requests.

### Data lifecycle
- TanStack Query: `staleTime` 10 min, `refetchInterval` 15 min, refetch on focus and on
  reconnect, 2 retries with exponential backoff, request de-duplication.
- PWA via vite-plugin-pwa (`autoUpdate`): precache the app shell; runtime-cache API
  responses (NetworkFirst). Persist the last good payload so the app renders offline with
  an "Offline — showing data from HH:MM" banner.
- "Updated N min ago" footer with a manual refresh button.

### UX / accessibility
Skeletons per section; per-section error + retry; global error boundary; toasts for
transient failures; semantic landmarks; `aria-live` for updates; labelled controls;
visible focus rings; 44 px touch targets; AA contrast in both themes.

## 5. Security checklist
- CSP `<meta>`: `default-src 'self'`; `connect-src` limited to the Open-Meteo hosts and
  the reverse-geocoder; `img-src 'self' data:`; `object-src 'none'`; `base-uri 'self'`;
  `form-action 'self'`; `frame-ancestors 'none'` (via headers).
- `vercel.json` headers: `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Permissions-Policy` (allow geolocation self only).
- Inputs trimmed, capped at 80 chars, control characters stripped.
- URL params parsed as numbers, clamped to valid ranges; unknown params ignored.
- Remove axios/postcss/autoprefixer; `npm audit` clean; Dependabot config.

## 6. Quality gates
- `npm run lint`, `npm test`, `npm run build` all pass; GitHub Actions runs them on push.
- Unit tests for time parsing, unit formatting, AQI/UV categories, insights rules, weather
  code mapping, storage helpers, URL parsing, hourly slicing from current hour, and the
  search box (debounce + keyboard).
- README rewritten: features, architecture, APIs and attribution, setup, deployment,
  privacy note (no tracking; location never leaves the device except as query
  coordinates to the weather API).
