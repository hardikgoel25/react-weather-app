import clsx from 'clsx';
import { describeWeather, weatherIconName } from '../../utils/weatherCodes.js';

/* Animated SVGs from Meteocons (MIT, Bas Milius). Only the icons we use are bundled. */
import clearDay from '@bybas/weather-icons/production/fill/all/clear-day.svg';
import clearNight from '@bybas/weather-icons/production/fill/all/clear-night.svg';
import partlyCloudyDay from '@bybas/weather-icons/production/fill/all/partly-cloudy-day.svg';
import partlyCloudyNight from '@bybas/weather-icons/production/fill/all/partly-cloudy-night.svg';
import overcastDay from '@bybas/weather-icons/production/fill/all/overcast-day.svg';
import overcastNight from '@bybas/weather-icons/production/fill/all/overcast-night.svg';
import cloudy from '@bybas/weather-icons/production/fill/all/cloudy.svg';
import fogDay from '@bybas/weather-icons/production/fill/all/fog-day.svg';
import fogNight from '@bybas/weather-icons/production/fill/all/fog-night.svg';
import drizzle from '@bybas/weather-icons/production/fill/all/drizzle.svg';
import partlyCloudyDayDrizzle from '@bybas/weather-icons/production/fill/all/partly-cloudy-day-drizzle.svg';
import partlyCloudyNightDrizzle from '@bybas/weather-icons/production/fill/all/partly-cloudy-night-drizzle.svg';
import sleet from '@bybas/weather-icons/production/fill/all/sleet.svg';
import partlyCloudyDaySleet from '@bybas/weather-icons/production/fill/all/partly-cloudy-day-sleet.svg';
import partlyCloudyNightSleet from '@bybas/weather-icons/production/fill/all/partly-cloudy-night-sleet.svg';
import rain from '@bybas/weather-icons/production/fill/all/rain.svg';
import partlyCloudyDayRain from '@bybas/weather-icons/production/fill/all/partly-cloudy-day-rain.svg';
import partlyCloudyNightRain from '@bybas/weather-icons/production/fill/all/partly-cloudy-night-rain.svg';
import snow from '@bybas/weather-icons/production/fill/all/snow.svg';
import partlyCloudyDaySnow from '@bybas/weather-icons/production/fill/all/partly-cloudy-day-snow.svg';
import partlyCloudyNightSnow from '@bybas/weather-icons/production/fill/all/partly-cloudy-night-snow.svg';
import snowflake from '@bybas/weather-icons/production/fill/all/snowflake.svg';
import thunderstormsDay from '@bybas/weather-icons/production/fill/all/thunderstorms-day.svg';
import thunderstormsNight from '@bybas/weather-icons/production/fill/all/thunderstorms-night.svg';
import thunderstormsDayRain from '@bybas/weather-icons/production/fill/all/thunderstorms-day-rain.svg';
import thunderstormsNightRain from '@bybas/weather-icons/production/fill/all/thunderstorms-night-rain.svg';
import hail from '@bybas/weather-icons/production/fill/all/hail.svg';
import notAvailable from '@bybas/weather-icons/production/fill/all/not-available.svg';
import sunrise from '@bybas/weather-icons/production/fill/all/sunrise.svg';
import sunset from '@bybas/weather-icons/production/fill/all/sunset.svg';
import uvIndex from '@bybas/weather-icons/production/fill/all/uv-index.svg';
import humidity from '@bybas/weather-icons/production/fill/all/humidity.svg';
import barometer from '@bybas/weather-icons/production/fill/all/barometer.svg';
import wind from '@bybas/weather-icons/production/fill/all/wind.svg';
import raindrops from '@bybas/weather-icons/production/fill/all/raindrops.svg';
import thermometer from '@bybas/weather-icons/production/fill/all/thermometer.svg';
import mist from '@bybas/weather-icons/production/fill/all/mist.svg';
import compass from '@bybas/weather-icons/production/fill/all/compass.svg';
import dust from '@bybas/weather-icons/production/fill/all/dust.svg';

const ICONS = {
  'clear-day': clearDay,
  'clear-night': clearNight,
  'partly-cloudy-day': partlyCloudyDay,
  'partly-cloudy-night': partlyCloudyNight,
  'overcast-day': overcastDay,
  'overcast-night': overcastNight,
  cloudy,
  'fog-day': fogDay,
  'fog-night': fogNight,
  drizzle,
  'partly-cloudy-day-drizzle': partlyCloudyDayDrizzle,
  'partly-cloudy-night-drizzle': partlyCloudyNightDrizzle,
  sleet,
  'partly-cloudy-day-sleet': partlyCloudyDaySleet,
  'partly-cloudy-night-sleet': partlyCloudyNightSleet,
  rain,
  'partly-cloudy-day-rain': partlyCloudyDayRain,
  'partly-cloudy-night-rain': partlyCloudyNightRain,
  snow,
  'partly-cloudy-day-snow': partlyCloudyDaySnow,
  'partly-cloudy-night-snow': partlyCloudyNightSnow,
  snowflake,
  'thunderstorms-day': thunderstormsDay,
  'thunderstorms-night': thunderstormsNight,
  'thunderstorms-day-rain': thunderstormsDayRain,
  'thunderstorms-night-rain': thunderstormsNightRain,
  hail,
  'not-available': notAvailable,
  sunrise,
  sunset,
  'uv-index': uvIndex,
  humidity,
  barometer,
  wind,
  raindrops,
  thermometer,
  mist,
  compass,
  dust,
};

/** Weather condition icon (day/night aware). Decorative unless `label` is given. */
export function WeatherIcon({ code, isDay = true, name, label, className, size = 48 }) {
  const iconName = name ?? weatherIconName(code, Boolean(isDay));
  const src = ICONS[iconName] ?? notAvailable;
  const alt = label ?? (name ? '' : describeWeather(code));
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      width={size}
      height={size}
      draggable={false}
      decoding="async"
      className={clsx('select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}
