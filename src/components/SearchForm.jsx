import { useState } from 'react';
import { fetchCityCoordinates } from '../services/weatherApi';

export default function SearchForm({ setLat, setLon, loadWeather, setLocationName }) {
  const [city, setCity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loc = await fetchCityCoordinates(city);
    if (loc) {
      setLat(loc.lat);
      setLon(loc.lon);
      loadWeather(loc.lat, loc.lon, loc.name);
      setLocationName(loc.name);
    }
    setCity('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
        className="flex-1 p-2 rounded text-black"
      />
      <button
        type="submit"
        className="bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
      >
        Search
      </button>
    </form>
  );
}
