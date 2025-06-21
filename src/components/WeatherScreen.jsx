import { useState, useEffect } from 'react';
import {
  getLocation,
  fetchWeather,
  fetchAirQuality
} from '../services/weatherApi';
import CurrentWeather from './CurrentWeather';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForecast';
import WeatherDetails from './WeatherDetails';
import SearchForm from './SearchForm';
import DateTimeDisplay from './DateTimeDisplay';

export default function WeatherScreen() {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [locationName, setLocationName] = useState('Current Location');

  const loadWeather = async (lat, lon, locName = 'Current Location') => {
    const w = await fetchWeather(lat, lon);
    setWeather(w);

    const aq = await fetchAirQuality(lat, lon);
    setAirQuality(aq);

    setLocationName(locName);
  };

  useEffect(() => {
    getLocation(({ lat, lon }) => {
      setLat(lat);
      setLon(lon);
      loadWeather(lat, lon);
    });
  }, []);

  const getBgGradient = (code) => {
    if ([0, 1].includes(code)) return 'from-sky-400 to-blue-700';
    if ([2, 3].includes(code)) return 'from-gray-400 to-gray-700';
    if ([45, 48].includes(code)) return 'from-gray-300 to-gray-600';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'from-blue-500 to-gray-800';
    if ([71, 73, 75].includes(code)) return 'from-cyan-300 to-blue-600';
    if ([95, 96, 97].includes(code)) return 'from-indigo-700 to-gray-900';
    return 'from-sky-400 to-blue-700';
  };

  const bgGradient = getBgGradient(weather?.current?.weather_code);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${bgGradient} text-white transition-colors duration-700 ease-in-out p-6 space-y-6 overflow-x-hidden`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-3xl font-semibold">{locationName}</h1>
          <DateTimeDisplay timezone={weather?.timezone} />
        </div>

        <SearchForm
          setLat={setLat}
          setLon={setLon}
          loadWeather={loadWeather}
          setLocationName={setLocationName}
        />
      </div>

      <CurrentWeather data={weather?.current} daily={weather?.daily} />
      <HourlyForecast data={weather?.hourly} />
      <DailyForecast data={weather?.daily} />
      <WeatherDetails airQuality={airQuality} daily={weather?.daily} />
    </div>
  );
}
