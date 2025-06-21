import { getWeatherIcon } from '../services/WeatherIcons.js';

export default function DailyForecast({ data }) {
  if (!data) return null;

  const days = data.time.map(dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const highs = data.temperature_2m_max;
  const lows = data.temperature_2m_min;
  const codes = data.weather_code;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Daily Forecast</h2>
      <div className="space-y-3 bg-white/10 backdrop-blur-md p-3 rounded-xl">
        {days.map((day, i) => (
          <div key={i} className="flex justify-between items-center">
            <span>{i === 0 ? 'Today' : day}</span>
            <span className="text-2xl">{getWeatherIcon(codes[i])}</span>
            <span>
              {Math.round(highs[i])}° / {Math.round(lows[i])}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
