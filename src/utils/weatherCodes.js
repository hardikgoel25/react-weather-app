/**
 * WMO weather interpretation codes (as used by Open-Meteo) mapped to a label,
 * a visual "group" (used for backgrounds/particles) and an animated icon name
 * for both day and night (Meteocons set, see components/ui/WeatherIcon).
 */
const dn = (day, night) => ({ day, night });

export const WMO_CODES = Object.freeze({
  0: { label: 'Clear sky', group: 'clear', icon: dn('clear-day', 'clear-night') },
  1: { label: 'Mainly clear', group: 'clear', icon: dn('clear-day', 'clear-night') },
  2: { label: 'Partly cloudy', group: 'partly', icon: dn('partly-cloudy-day', 'partly-cloudy-night') },
  3: { label: 'Overcast', group: 'cloudy', icon: dn('overcast-day', 'overcast-night') },
  45: { label: 'Fog', group: 'fog', icon: dn('fog-day', 'fog-night') },
  48: { label: 'Icy fog', group: 'fog', icon: dn('fog-day', 'fog-night') },
  51: { label: 'Light drizzle', group: 'drizzle', icon: dn('partly-cloudy-day-drizzle', 'partly-cloudy-night-drizzle') },
  53: { label: 'Drizzle', group: 'drizzle', icon: dn('drizzle', 'drizzle') },
  55: { label: 'Heavy drizzle', group: 'drizzle', icon: dn('drizzle', 'drizzle') },
  56: { label: 'Freezing drizzle', group: 'sleet', icon: dn('partly-cloudy-day-sleet', 'partly-cloudy-night-sleet') },
  57: { label: 'Heavy freezing drizzle', group: 'sleet', icon: dn('sleet', 'sleet') },
  61: { label: 'Light rain', group: 'rain', icon: dn('partly-cloudy-day-rain', 'partly-cloudy-night-rain') },
  63: { label: 'Rain', group: 'rain', icon: dn('rain', 'rain') },
  65: { label: 'Heavy rain', group: 'rain', icon: dn('rain', 'rain') },
  66: { label: 'Freezing rain', group: 'sleet', icon: dn('sleet', 'sleet') },
  67: { label: 'Heavy freezing rain', group: 'sleet', icon: dn('sleet', 'sleet') },
  71: { label: 'Light snow', group: 'snow', icon: dn('partly-cloudy-day-snow', 'partly-cloudy-night-snow') },
  73: { label: 'Snow', group: 'snow', icon: dn('snow', 'snow') },
  75: { label: 'Heavy snow', group: 'snow', icon: dn('snow', 'snow') },
  77: { label: 'Snow grains', group: 'snow', icon: dn('snowflake', 'snowflake') },
  80: { label: 'Light showers', group: 'rain', icon: dn('partly-cloudy-day-rain', 'partly-cloudy-night-rain') },
  81: { label: 'Showers', group: 'rain', icon: dn('rain', 'rain') },
  82: { label: 'Violent showers', group: 'rain', icon: dn('rain', 'rain') },
  85: { label: 'Snow showers', group: 'snow', icon: dn('partly-cloudy-day-snow', 'partly-cloudy-night-snow') },
  86: { label: 'Heavy snow showers', group: 'snow', icon: dn('snow', 'snow') },
  95: { label: 'Thunderstorm', group: 'thunder', icon: dn('thunderstorms-day', 'thunderstorms-night') },
  96: { label: 'Thunderstorm with hail', group: 'thunder', icon: dn('thunderstorms-day-rain', 'thunderstorms-night-rain') },
  99: { label: 'Severe thunderstorm with hail', group: 'thunder', icon: dn('hail', 'hail') },
});

const UNKNOWN = { label: 'Unknown', group: 'cloudy', icon: dn('not-available', 'not-available') };

export function weatherInfo(code) {
  return WMO_CODES[code] ?? UNKNOWN;
}

export function describeWeather(code) {
  return weatherInfo(code).label;
}

export function weatherGroup(code) {
  return weatherInfo(code).group;
}

export function weatherIconName(code, isDay = true) {
  const icon = weatherInfo(code).icon;
  return isDay ? icon.day : icon.night;
}

export const PRECIP_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
export const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
export const THUNDER_CODES = new Set([95, 96, 99]);
export const FOG_CODES = new Set([45, 48]);

export function isPrecipitating(code) {
  return PRECIP_CODES.has(code) || SNOW_CODES.has(code) || THUNDER_CODES.has(code);
}
