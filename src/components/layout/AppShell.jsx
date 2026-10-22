import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './Header.jsx';
import { Background } from './Background.jsx';
import { Footer } from './Footer.jsx';
import { LocationChips } from '../locations/LocationChips.jsx';
import { SettingsSheet } from '../settings/SettingsSheet.jsx';
import { Welcome } from '../Welcome.jsx';
import { Dashboard } from '../Dashboard.jsx';
import { useLocation } from '../../hooks/useLocation.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { useToast } from '../../hooks/useToast.js';

export function AppShell() {
  const { location, setLocation } = useLocation();
  const { toast } = useToast();
  const geo = useGeolocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const searchRef = useRef(null);
  const hadLocationAtStart = useRef(Boolean(location));

  // Apply a successful GPS fix.
  useEffect(() => {
    if (geo.status === 'granted' && geo.position) {
      setLocation(
        { lat: geo.position.lat, lon: geo.position.lon, name: 'My location', source: 'gps' },
        { remember: false, replace: !hadLocationAtStart.current },
      );
    }
  }, [geo.status, geo.position, setLocation]);

  // Surface geolocation problems as a toast when there is already something on screen.
  useEffect(() => {
    if (geo.error && location) toast({ tone: 'warn', title: 'Location unavailable', description: geo.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.error]);

  // First visit with permission already granted: locate silently (never prompt unasked).
  const autoLocated = useRef(false);
  useEffect(() => {
    if (!location && geo.permission === 'granted' && !autoLocated.current) {
      autoLocated.current = true;
      geo.request();
    }
  }, [location, geo.permission, geo.request, geo]);

  // "/" focuses search unless the user is already typing somewhere.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const share = useCallback(async () => {
    if (!location) return;
    const url = window.location.href;
    const title = `Weather for ${location.name}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast({ tone: 'success', title: 'Link copied to clipboard' });
      } else {
        toast({ tone: 'info', title: 'Copy the address bar URL to share this forecast' });
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        toast({ tone: 'error', title: 'Could not share', description: 'Copy the address bar URL instead.' });
      }
    }
  }, [location, toast]);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <Header
          onOpenSettings={openSettings}
          onShare={share}
          onLocate={geo.request}
          locating={geo.status === 'locating'}
          canShare={Boolean(location)}
          searchRef={searchRef}
        />
        <LocationChips />
        <main className="flex-1">
          {location ? (
            <Dashboard />
          ) : (
            <>
              <Background code={1} isDay />
              <Welcome geo={geo} onLocate={geo.request} />
              <Footer />
            </>
          )}
        </main>
      </div>
      <SettingsSheet open={settingsOpen} onClose={closeSettings} />
    </>
  );
}
