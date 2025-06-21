export default function WeatherDetails({ airQuality, daily }) {
  if (!airQuality || !daily) return null;

  const pmValue = airQuality.pm2_5;
  const uvValue = airQuality.uv_index;

  const getAqiColor = (value) => {
    if (value <= 50) return 'bg-green-500';
    if (value <= 100) return 'bg-yellow-400';
    if (value <= 150) return 'bg-orange-400';
    if (value <= 200) return 'bg-red-500';
    if (value <= 300) return 'bg-purple-500';
    return 'bg-black';
  };

  const getUvColor = (uv) => {
    if (uv <= 2) return 'bg-green-500';
    if (uv <= 5) return 'bg-yellow-400';
    if (uv <= 7) return 'bg-orange-400';
    if (uv <= 10) return 'bg-red-500';
    return 'bg-purple-700';
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl space-y-3">
      <h2 className="text-xl font-semibold">Details</h2>

      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getAqiColor(pmValue)}`}></div>
        <span className="text-base">PM2.5: {pmValue} μg/m³</span>
      </div>

      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getUvColor(uvValue)}`}></div>
        <span className="text-base">UV Index: {uvValue}</span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-xl">🌅</span>
        <span className="text-base">
          Sunrise: {new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-xl">🌇</span>
        <span className="text-base">
          Sunset: {new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
