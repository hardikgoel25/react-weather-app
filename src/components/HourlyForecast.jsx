import { getWeatherIcon } from '../services/WeatherIcons';

export default function HourlyForecast({ data }) {
  if (!data) return null;

  const times = data.time;
  const temps = data.temperature_2m;
  const codes = data.weather_code;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Hourly Forecast</h2>
      <div className="flex overflow-x-scroll space-x-5 py-3 px-2 bg-white/10 backdrop-blur-md rounded-xl scrollbar-hide">
        {times.slice(0, 24).map((time, i) => {
          const t = new Date(time);
          const hourStr = t.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
          const icon = getWeatherIcon(codes[i]);

          return (
            <div key={i} className="flex flex-col items-center min-w-[60px]">
              <span className="text-sm">{hourStr}</span>
              <span className="text-2xl">{icon}</span>
              <span className="text-sm">{temps[i]}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
