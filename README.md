# 🌤️ Weather — React + Vite + Open-Meteo

A fast, private, installable weather app inspired by Apple Weather. Built with **React 19**,
**Vite 7**, **Tailwind CSS 4**, **TanStack Query** and the free, keyless **Open-Meteo** APIs.

No API keys. No accounts. No tracking.

> Live demo: _add your Vercel URL here_

---

## ✨ Features

**Location**
- 🔍 Search any city or place with debounced autocomplete (keyboard navigable, flag + region shown). Press `/` to jump to search.
- 📍 "Use my location" with explicit permission states (never prompts unasked, never silently falls back to a hard-coded city). GPS positions are reverse-geocoded to a readable name.
- ⭐ Save up to 10 locations and keep 5 recent searches, as quick-switch chips.
- 🔗 Every view is a shareable URL (`?lat=&lon=&name=`); back/forward navigation works; one-tap Share (Web Share API / clipboard).

**Forecast**
- 🌡️ Current conditions with feels-like, high/low, day/night-aware animated icons and the location's local time (ticks every minute in *its* timezone).
- 📈 "3° warmer than yesterday at this time" comparison.
- 🕓 48-hour strip starting at the current hour, with precipitation chance and inline sunrise/sunset markers.
- 📊 Hand-drawn SVG chart with tabs: temperature & feels-like, precipitation chance & amount, wind & gusts, humidity & cloud cover, UV.
- 📅 7- or 14-day forecast with Apple-style temperature range bars; expand any day for feels-like range, precipitation total/hours/chance, wind, gusts, UV, sunrise/sunset, daylight and sunshine hours.

**Details**
- ☀️ UV index gauge with category, advice and today's peak hour
- 💧 Humidity with dew point and comfort description
- 💨 Wind compass with direction, gusts and Beaufort scale
- 🧭 Pressure with 3-hour trend
- 👁️ Visibility, ☁️ cloud cover, ☔ precipitation now / next 24 h, ❄️ snowfall (when relevant)
- 🌅 Sunrise & sunset arc with daylight length and change versus yesterday
- 🌬️ Air quality: US AQI and European AQI with health advice, PM2.5 / PM10 / O₃ / NO₂ / SO₂ / CO breakdown, 24-hour trend and pollen (where available)
- 🔔 Heads-up notices derived from the data: rain starting soon, heavy rain, snow, thunderstorms, high UV window, strong gusts, heat/cold stress, frost, fog, poor air, big temperature swings, sunrise/sunset coming up

**Experience**
- 🎨 Weather- and daylight-aware gradient backgrounds with light rain/snow/fog/star layers (off under *reduced motion*), glass cards, light/dark/auto theme
- ⚙️ Settings: °C/°F, km/h · mph · m/s · kn, mm/in, hPa · inHg · mmHg, 12/24-hour clock, theme — persisted, applied server-side by Open-Meteo so nothing is converted twice
- 📱 Installable PWA with offline support: the app shell is precached and the last good forecast is shown with an "offline" banner
- 🔄 Stale-while-revalidate caching (10 min), refresh on focus/reconnect, auto-refresh every 15 min, manual refresh with "updated x min ago"
- ♿ Semantic landmarks, ARIA combobox/listbox/radiogroup/dialog patterns, focus rings, live regions, 44 px targets
- 🧯 Per-section loading skeletons and error states with retry, global error boundary, toasts

## 🔒 Security & privacy

- Zero secrets in the bundle. The old OpenWeatherMap key is gone; geocoding uses Open-Meteo's keyless API.
- Strict Content-Security-Policy (`default-src 'self'`, `connect-src` limited to the APIs used, no inline scripts/styles, `object-src 'none'`), injected into production HTML and sent as a header on Vercel together with `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and HSTS (see `vercel.json`).
- Every request URL is built with `URLSearchParams`; every API response and every `localStorage` value is validated with [zod](https://zod.dev) before use. Inputs are trimmed, control characters stripped, lengths capped, coordinates range-checked.
- Fetches have hard timeouts, are cancelled when the location changes, and retry with exponential backoff only on retryable failures.
- Your location is used only as coordinates in weather-API requests and (for GPS positions) a reverse-geocode lookup. Nothing is sent anywhere else. "Clear saved places & cache" in Settings wipes everything.
- `npm audit` is clean; Dependabot and CI (lint + tests + build + audit) run on every push.

## 🏗️ Architecture

```
src/
  api/          Open-Meteo forecast, air-quality, geocoding + BigDataCloud reverse geocoding.
                client.js: hardened fetch (timeout, abort, typed errors, zod validation)
  hooks/        useForecastQuery / useAirQualityQuery / usePlaceSearch (TanStack Query),
                useGeolocation, useNow, useOnlineStatus, useMediaQuery, useDebouncedValue, …
  context/      SettingsProvider (units/theme), LocationProvider (current/saved/recent + URL sync), ToastProvider
  components/   layout/ search/ locations/ current/ hourly/ daily/ details/ airquality/ insights/ settings/ ui/
  utils/        pure, unit-tested logic: time (timezone-safe parsing of Open-Meteo local ISO strings),
                units, weatherCodes, forecast (model builder), insights (heads-up rules), aqi, uv,
                wind, pressure, geo (URL/input validation), storage (safe localStorage), theme
  test/         Vitest setup + synthetic API fixtures
```

A note on time: Open-Meteo returns timestamps in the *location's* timezone without an offset.
The app never passes those strings to `new Date()` for display; it parses them itself and
computes "now" in the location's zone with `Intl.DateTimeFormat`, so a user in New York
looking at Tokyo sees Tokyo's hours.

## 🌐 Data sources

| Data | Source | Notes |
| --- | --- | --- |
| Forecast (current, 48 h hourly, 16-day daily) | [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | `past_days=1` enables the "vs yesterday" comparison |
| Air quality, pollen, UV | [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) | Pollen available in Europe |
| Place search | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | Keyless, multilingual |
| GPS → place name | [BigDataCloud reverse-geocode-client](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Keyless client API |
| Icons | [Meteocons](https://github.com/basmilius/weather-icons) (MIT) + [Lucide](https://lucide.dev) | Animated SVG |

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed CC BY 4.0.

## ⚙️ Run locally

```bash
git clone https://github.com/hardikgoel25/react-weather-app.git
cd react-weather-app
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build (+ service worker) into dist/
npm run preview    # serve the production build locally
npm test           # unit + component tests (Vitest + Testing Library)
npm run lint       # ESLint
npm run check      # lint + test + build
```

No `.env` file is needed.

## 🚀 Deploy

The project is a static site. On **Vercel** just import the repo: `vercel.json` adds the
security headers and cache rules. Any static host works (`npm run build`, serve `dist/`),
but the Content-Security-Policy is then only enforced via the `<meta>` tag.

## 🧪 Tests

```bash
npm test
```

Covers timezone-safe time parsing, unit formatting, AQI/UV/wind/pressure scales, the
forecast model (current-hour anchoring, past-day offset, sun progress), the heads-up rules,
URL/input sanitising, safe storage, the fetch client (timeouts, aborts, HTTP/schema
errors) and the search box (debounce, keyboard selection, empty state).

## 📄 License

MIT
