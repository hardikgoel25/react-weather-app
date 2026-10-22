import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchBox } from './SearchBox.jsx';
import { LocationProvider } from '../../context/LocationProvider.jsx';
import { useLocation } from '../../hooks/useLocation.js';
import { searchPlaces } from '../../api/geocoding.js';

vi.mock('../../api/geocoding.js', () => ({ searchPlaces: vi.fn() }));

const PLACES = [
  { id: '28.621,77.215', placeId: 1, lat: 28.6214, lon: 77.2148, name: 'New Delhi', admin1: 'Delhi', country: 'India', countryCode: 'IN', population: 317797, source: 'search' },
  { id: '39.032,-90.261', placeId: 2, lat: 39.0317, lon: -90.2612, name: 'New Delhi', admin1: 'Illinois', country: 'United States', countryCode: 'US', source: 'search' },
];

function Probe() {
  const { location } = useLocation();
  return <output data-testid="location">{location ? `${location.name} (${location.admin1})` : 'none'}</output>;
}

function renderBox() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LocationProvider>
        <SearchBox onLocate={() => {}} />
        <Probe />
      </LocationProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  searchPlaces.mockReset();
  searchPlaces.mockResolvedValue(PLACES);
});

describe('SearchBox', () => {
  it('does not search for fewer than two characters', async () => {
    const user = userEvent.setup();
    renderBox();
    await user.type(screen.getByRole('combobox'), 'N');
    await new Promise((r) => setTimeout(r, 400));
    expect(searchPlaces).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('debounces, lists suggestions and selects with the keyboard', async () => {
    const user = userEvent.setup();
    renderBox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'New Del');

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(2);
    expect(searchPlaces).toHaveBeenCalledTimes(1);
    expect(searchPlaces.mock.calls[0][0]).toBe('New Del');
    expect(options[0]).toHaveTextContent('Delhi, India');

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('New Delhi (Illinois)'));
    expect(input).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(window.location.search).toContain('lat=39.0317');
  });

  it('selects the first result on Enter and closes on Escape', async () => {
    const user = userEvent.setup();
    renderBox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'New');
    await screen.findAllByRole('option');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(input);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('New Delhi (Delhi)'));
  });

  it('shows an empty state', async () => {
    searchPlaces.mockResolvedValue([]);
    const user = userEvent.setup();
    renderBox();
    await user.type(screen.getByRole('combobox'), 'zzzz');
    expect(await screen.findByText(/No places found/)).toBeInTheDocument();
  });
});
