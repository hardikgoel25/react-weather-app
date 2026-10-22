import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchForecast, ForecastSchema } from '../api/forecast.js';
import { fetchAirQuality, AirQualitySchema } from '../api/airQuality.js';
import { searchPlaces } from '../api/geocoding.js';
import { reverseGeocode } from '../api/reverseGeocode.js';
import { ApiError } from '../api/client.js';
import { readJson, writeJson, STORAGE_KEYS } from '../utils/storage.js';

const TEN_MINUTES = 10 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const retry = (count, error) => count < 2 && (!(error instanceof ApiError) || error.retryable);
const retryDelay = (attempt) => Math.min(1000 * 2 ** attempt, 8000);

/* ---------- last-good-response persistence (offline fallback) ---------- */

function cacheSchemaFor(dataSchema) {
  return z.object({ key: z.string(), fetchedAt: z.number(), data: dataSchema });
}

const ForecastCacheSchema = cacheSchemaFor(ForecastSchema);
const AirCacheSchema = cacheSchemaFor(AirQualitySchema);

function readCache(storageKey, schema, key) {
  const cached = readJson(storageKey, schema, null);
  return cached && cached.key === key ? cached : null;
}

function persist(storageKey, key, data) {
  writeJson(storageKey, { key, fetchedAt: Date.now(), data });
}

/* ---------- queries ---------- */

export function forecastQueryKey(location, settings) {
  return ['forecast', location?.lat, location?.lon, settings.temperature, settings.windSpeed, settings.precipitation];
}

export function useForecastQuery(location, settings) {
  const key = forecastQueryKey(location, settings);
  const cacheId = key.join('|');
  // Validated once per location/unit combination; feeds initialData so the app renders offline.
  const cached = useMemo(
    () => (location ? readCache(STORAGE_KEYS.forecastCache, ForecastCacheSchema, cacheId) : null),
    [location, cacheId],
  );

  return useQuery({
    queryKey: key,
    enabled: Boolean(location),
    queryFn: async ({ signal }) => {
      const data = await fetchForecast({
        lat: location.lat,
        lon: location.lon,
        units: settings,
        signal,
      });
      persist(STORAGE_KEYS.forecastCache, cacheId, data);
      return data;
    },
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.fetchedAt,
    staleTime: TEN_MINUTES,
    gcTime: 60 * 60 * 1000,
    refetchInterval: FIFTEEN_MINUTES,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry,
    retryDelay,
    // Keep showing the previous payload when only the units change for the same place.
    placeholderData: (previous, previousQuery) => {
      const prevKey = previousQuery?.queryKey;
      return prevKey && prevKey[1] === key[1] && prevKey[2] === key[2] ? previous : undefined;
    },
  });
}

export function useAirQualityQuery(location) {
  const key = ['air-quality', location?.lat, location?.lon];
  const cacheId = key.join('|');
  const cached = useMemo(
    () => (location ? readCache(STORAGE_KEYS.airCache, AirCacheSchema, cacheId) : null),
    [location, cacheId],
  );

  return useQuery({
    queryKey: key,
    enabled: Boolean(location),
    queryFn: async ({ signal }) => {
      const data = await fetchAirQuality({ lat: location.lat, lon: location.lon, signal });
      persist(STORAGE_KEYS.airCache, cacheId, data);
      return data;
    },
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.fetchedAt,
    staleTime: TEN_MINUTES,
    gcTime: 60 * 60 * 1000,
    refetchInterval: FIFTEEN_MINUTES,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry,
    retryDelay,
  });
}

export function usePlaceSearch(query) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['places', trimmed.toLowerCase()],
    enabled: trimmed.length >= 2,
    queryFn: ({ signal }) => searchPlaces(trimmed, { signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 0,
    placeholderData: (previous) => previous,
  });
}

export function useReverseGeocode(location, enabled) {
  return useQuery({
    queryKey: ['reverse-geocode', location?.lat, location?.lon],
    enabled: Boolean(location) && enabled,
    queryFn: ({ signal }) => reverseGeocode({ lat: location.lat, lon: location.lon, signal }),
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    retryDelay,
  });
}
