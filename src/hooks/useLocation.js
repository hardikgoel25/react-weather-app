import { useContext } from 'react';
import { LocationContext } from '../context/contexts.js';

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
}
