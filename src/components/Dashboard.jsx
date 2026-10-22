import { useEffect, useMemo } from 'react';
import { Background } from './layout/Background.jsx';
import { OfflineBanner } from './layout/OfflineBanner.jsx';
import { Footer } from './layout/Footer.jsx';
import { CurrentConditions } from './current/CurrentConditions.jsx';
import { HeadsUp } from './insights/HeadsUp.jsx';
import { HourlySection } from './hourly/HourlySection.jsx';
import { DailySection } from './daily/DailySection.jsx';
import { DetailsGrid } from './details/cards.jsx';
import { AirQualitySection } from './airquality/AirQualitySection.jsx';
import { SectionError } from './ui/SectionError.jsx';
import { Skeleton, SkeletonCard } from './ui/Skeleton.jsx';
import { useLocation } from '../hooks/useLocation.js';
import { useSettings } from '../hooks/useSettings.js';
import { useToast } from '../hooks/useToast.js';
import { useNow } from '../hooks/useNow.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import { useAirQualityQuery, useForecastQuery, useReverseGeocode } from '../hooks/useWeatherQueries.js';
import { buildAirModel, buildWeatherModel } from '../utils/forecast.js';
import { deriveInsights } from '../utils/insights.js';
import { nowInZone } from '../utils/time.js';
import { formatTemp } from '../utils/units.js';
import { describeError } from '../api/client.js';

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-busy="true" aria-label="Loading forecast">
      <div className="flex flex-col items-center gap-3 px-1 pt-4 sm:flex-row sm:justify-between lg:col-span-12">
        <div className="space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-24 w-40" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="size-40 rounded-full" />
      </div>
      <SkeletonCard className="lg:col-span-12" lines={4} />
      <SkeletonCard className="lg:col-span-5" lines={7} />
      <div className="grid grid-cols-2 gap-3 lg:col-span-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { location, updateLocation } = useLocation();
  const { settings, hour12 } = useSettings();
  const { toast } = useToast();
  const online = useOnlineStatus();
  const now = useNow();

  const forecast = useForecastQuery(location, settings);
  const air = useAirQualityQuery(location);

  const timezone = forecast.data?.timezone ?? location.timezone;
  const nowKey = useMemo(() => nowInZone(timezone, now), [timezone, now]);
  const model = useMemo(() => (forecast.data ? buildWeatherModel(forecast.data, nowKey) : null), [forecast.data, nowKey]);
  const airModel = useMemo(() => (air.data ? buildAirModel(air.data, nowKey) : null), [air.data, nowKey]);
  const insights = useMemo(() => deriveInsights(model, airModel, settings), [model, airModel, settings]);

  // Give GPS positions a human-readable name.
  const reverse = useReverseGeocode(location, location.source === 'gps');
  useEffect(() => {
    if (reverse.data) updateLocation({ ...reverse.data, source: 'gps-named' });
  }, [reverse.data, updateLocation]);

  useEffect(() => {
    document.title = model
      ? `${formatTemp(model.current.temperature_2m)} ${location.name} · Weather`
      : `${location.name} · Weather`;
  }, [model, location.name]);

  // A failed background refresh keeps the old data on screen; just mention it.
  useEffect(() => {
    if (forecast.isError && forecast.data) {
      toast({ tone: 'warn', title: 'Could not refresh the forecast', description: describeError(forecast.error) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecast.errorUpdatedAt]);

  const code = model?.current.weather_code;
  const isDay = model ? model.current.is_day !== 0 : true;

  return (
    <>
      <Background code={code} isDay={isDay} />
      <div className="space-y-4">
        <OfflineBanner online={online} stale={forecast.isError && Boolean(forecast.data)} updatedAt={forecast.dataUpdatedAt} hour12={hour12} />

        {forecast.isPending && <DashboardSkeleton />}

        {forecast.isError && !forecast.data && (
          <SectionError
            title="Could not load the forecast"
            error={forecast.error}
            onRetry={() => forecast.refetch()}
            retrying={forecast.isFetching}
          />
        )}

        {model && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-12">
              <CurrentConditions model={model} location={location} />
            </div>
            {insights.length > 0 && (
              <div className="lg:col-span-12">
                <HeadsUp insights={insights} />
              </div>
            )}
            <div className="lg:col-span-12">
              <HourlySection model={model} />
            </div>
            <div className="lg:col-span-5">
              <DailySection model={model} />
            </div>
            <div className="lg:col-span-7">
              <DetailsGrid model={model} air={airModel} />
            </div>
            <div className="lg:col-span-12">
              {air.isPending && <SkeletonCard lines={3} />}
              {air.isError && !air.data && (
                <SectionError title="Air quality is unavailable" error={air.error} onRetry={() => air.refetch()} retrying={air.isFetching} />
              )}
              {airModel && <AirQualitySection air={airModel} />}
            </div>
          </div>
        )}

        <Footer
          updatedAt={forecast.dataUpdatedAt || null}
          fetching={forecast.isFetching || air.isFetching}
          onRefresh={() => {
            forecast.refetch();
            air.refetch();
          }}
        />
      </div>
    </>
  );
}
