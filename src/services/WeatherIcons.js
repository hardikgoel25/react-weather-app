export function getWeatherIcon(code) {
    const iconMap = {
        0: '☀️', // Clear sky
        1: '🌤️', // Mainly clear
        2: '⛅',  // Partly cloudy
        3: '☁️', // Overcast
        45: '🌫️', 48: '🌫️', // Fog
        51: '🌦️', 53: '🌦️', 55: '🌧️', // Drizzle
        61: '🌧️', 63: '🌧️', 65: '🌧️', // Rain
        71: '❄️', 73: '❄️', 75: '❄️', // Snow
        80: '🌧️', 81: '🌧️', 82: '🌧️', // Rain showers
        95: '⛈️', 96: '⛈️', 97: '⛈️', // Thunderstorm
    };

    return iconMap[code] || '❓';
}
