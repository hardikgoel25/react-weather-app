import axios from 'axios';

export const apiKey = import.meta.env.VITE_API_KEY;

export const weatherIcons = {
    0: 'wi-day-sunny',
    1: 'wi-day-sunny-overcast',
    2: 'wi-day-cloudy',
    3: 'wi-cloudy',
    45: 'wi-fog', 48: 'wi-fog',
    51: 'wi-day-showers', 53: 'wi-day-showers', 55: 'wi-day-showers',
    56: 'wi-sleet', 57: 'wi-sleet',
    61: 'wi-rain', 63: 'wi-rain', 65: 'wi-rain',
    66: 'wi-rain-mix', 67: 'wi-rain-mix',
    71: 'wi-snow', 73: 'wi-snow', 75: 'wi-snow',
    77: 'wi-snowflake-cold',
    80: 'wi-showers', 81: 'wi-showers', 82: 'wi-showers',
    95: 'wi-thunderstorm', 96: 'wi-thunderstorm', 97: 'wi-thunderstorm'
};

export const weatherCodes = {
    0: 'Clear sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog',
    51: 'Drizzle-light', 53: 'Drizzle-moderate', 55: 'Drizzle-heavy', 56: 'Drizzle', 57: 'Drizzle',
    61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain', 66: 'Moderate Rain', 67: 'Heavy Rain',
    71: 'Light Snowfall', 73: 'Moderate Snowfall', 75: 'Heavy Snowfall', 77: 'Snow Grains',
    80: 'Rain showers', 81: 'Rain showers', 82: 'Rain showers', 95: 'ThunderStorm', 96: 'ThunderStorm', 97: 'ThunderStorm'
};

export async function fetchWeather(lat, lon) {
    try {
        const res = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&hourly=temperature_2m,weather_code,apparent_temperature,precipitation,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=auto`
        );
        return res.data;
    } catch (err) {
        console.error('Error fetching weather', err);
        return null;
    }
}

export async function fetchAirQuality(lat, lon) {
    try {
        const res = await axios.get(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,uv_index`
        );
        return res.data.current;
    } catch (err) {
        console.error('Error fetching air quality', err);
        return null;
    }
}

export async function fetchCityCoordinates(city) {
    try {
        const res = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`
        );
        const { lat, lon, name } = res.data[0];
        return { lat, lon, name };
    } catch (err) {
        console.error('Error fetching coordinates', err);
        return null;
    }
}

export function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            callback({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            });
        }, showError);
    } else {
        callback({ lat: 28.6519, lon: 77.2315 });
    }
}

function showError(error) {
    console.error('Geolocation error:', error.message);
}
