import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import { SettingsProvider } from './context/SettingsProvider.jsx';
import { LocationProvider } from './context/LocationProvider.jsx';
import { ToastProvider } from './context/ToastProvider.jsx';
import { AppShell } from './components/layout/AppShell.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <LocationProvider>
            <ToastProvider>
              <AppShell />
            </ToastProvider>
          </LocationProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
