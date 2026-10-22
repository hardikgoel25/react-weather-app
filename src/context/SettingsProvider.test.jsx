import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider } from './SettingsProvider.jsx';
import { useSettings } from '../hooks/useSettings.js';
import { STORAGE_KEYS } from '../utils/storage.js';

function mockMatchMedia(dark) {
  window.matchMedia = vi.fn((query) => ({
    matches: query.includes('dark') ? dark : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

function Probe() {
  const { settings, update, resolvedTheme } = useSettings();
  return (
    <div>
      <output data-testid="theme">{resolvedTheme}</output>
      <output data-testid="temp">{settings.temperature}</output>
      <button type="button" onClick={() => update({ theme: 'dark' })}>dark</button>
      <button type="button" onClick={() => update({ temperature: 'fahrenheit' })}>f</button>
    </div>
  );
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe('SettingsProvider', () => {
  it('follows the system colour scheme in auto mode and writes data-theme', () => {
    mockMatchMedia(false);
    render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('prefers dark when the system does', () => {
    mockMatchMedia(true);
    render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('persists updates and restores validated settings', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const { unmount } = render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    await act(async () => {
      await user.click(screen.getByText('dark'));
      await user.click(screen.getByText('f'));
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.settings))).toMatchObject({ theme: 'dark', temperature: 'fahrenheit' });
    unmount();

    // Tampered value is ignored, valid ones restored.
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ temperature: 'kelvin', theme: 'dark' }));
    render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    expect(screen.getByTestId('temp')).toHaveTextContent('celsius');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
});
