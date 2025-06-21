import { getWeatherIcon } from '../services/WeatherIcons';
import { useState, useEffect } from 'react';

export default function CurrentWeather({ data, daily }) {
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (data) {
      const weatherIcon = getWeatherIcon(data.weather_code);
      setIcon(weatherIcon);
    }
  }, [data]);

  if (!data) return null;

  return (
    <div className="text-center space-y-3">
      <div className="text-7xl transition-opacity duration-700 ease-in-out opacity-100">
        {icon}
      </div>

      <h2 className="text-9xl font-thin">{data.temperature_2m}°</h2>
      <div className="flex justify-center space-x-4 text-lg">
        <span>H: {daily?.temperature_2m_max[0]}°</span>
        <span>L: {daily?.temperature_2m_min[0]}°</span>
      </div>

      <div className="text-sm text-white/80 space-x-4">
        <span>Feels like: {data.apparent_temperature}°</span>
        <span>Humidity: {data.relative_humidity_2m}%</span>
        <span>Wind: {data.wind_speed_10m} km/h</span>
      </div>
    </div>
  );
}
