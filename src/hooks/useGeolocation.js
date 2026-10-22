import { useCallback, useEffect, useRef, useState } from 'react';

const MESSAGES = {
  unavailable: 'Your device could not determine its position.',
  denied: 'Location access was denied. Search for a place instead, or allow location in your browser settings.',
  timeout: 'Finding your location took too long. Try again or search for a place.',
};

/**
 * Explicit-state wrapper over navigator.geolocation.
 * status: idle | locating | granted | denied | unavailable | timeout
 */
export function useGeolocation() {
  const [state, setState] = useState({ status: 'idle', position: null, error: null });
  const [permission, setPermission] = useState('unknown'); // granted | denied | prompt | unknown
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let status;
    const onChange = () => setPermission(status?.state ?? 'unknown');
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((s) => {
          status = s;
          onChange();
          s.addEventListener?.('change', onChange);
        })
        .catch(() => {});
    }
    return () => {
      mounted.current = false;
      status?.removeEventListener?.('change', onChange);
    };
  }, []);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({ status: 'unavailable', position: null, error: 'Geolocation is not supported by this browser.' });
      return;
    }
    setState((s) => ({ ...s, status: 'locating', error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted.current) return;
        setState({
          status: 'granted',
          position: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          error: null,
        });
      },
      (err) => {
        if (!mounted.current) return;
        const status = err?.code === 1 ? 'denied' : err?.code === 3 ? 'timeout' : 'unavailable';
        setState({ status, position: null, error: MESSAGES[status] });
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return { ...state, permission, request };
}
