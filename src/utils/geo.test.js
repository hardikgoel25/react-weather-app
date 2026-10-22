import { describe, expect, it } from 'vitest';
import {
  countryFlag, formatCoords, isValidCoords, locationFromSearch, locationSubtitle, makeLocation, sanitizeName,
  searchFromLocation,
} from './geo.js';

describe('sanitizeName', () => {
  it('strips control characters, collapses whitespace and caps length', () => {
    expect(sanitizeName('  New\u0000  Delhi\u001f ')).toBe('New Delhi');
    expect(sanitizeName('x'.repeat(200))).toHaveLength(80);
    expect(sanitizeName(42)).toBe('');
  });
});

describe('coordinates', () => {
  it('validates ranges', () => {
    expect(isValidCoords(28.6, 77.2)).toBe(true);
    expect(isValidCoords(91, 0)).toBe(false);
    expect(isValidCoords(0, -181)).toBe(false);
    expect(isValidCoords('28', 77)).toBe(false);
    expect(isValidCoords(NaN, 77)).toBe(false);
  });
  it('formats coordinates as a fallback name', () => {
    expect(formatCoords(28.6519, -77.2315)).toBe('28.65° N, 77.23° W');
  });
});

describe('makeLocation', () => {
  it('normalises input', () => {
    const loc = makeLocation({ latitude: 28.62137, longitude: 77.2148, name: 'New Delhi', country_code: 'in', countryCode: 'in', admin1: 'NCT', timezone: 'Asia/Kolkata' });
    expect(loc).toMatchObject({ id: '28.621,77.215', lat: 28.6214, lon: 77.2148, name: 'New Delhi', countryCode: 'IN', admin1: 'NCT' });
    expect(locationSubtitle(loc)).toBe('NCT');
  });
  it('falls back to coordinates when the name is empty', () => {
    expect(makeLocation({ lat: 1, lon: 2, name: '' }).name).toBe('1.00° N, 2.00° E');
  });
  it('rejects invalid coordinates and bad country codes', () => {
    expect(makeLocation({ lat: 100, lon: 0 })).toBeNull();
    expect(makeLocation({ lat: 1, lon: 2, countryCode: 'USA' }).countryCode).toBeUndefined();
  });
});

describe('URL state', () => {
  it('parses lat/lon/name and ignores unknown params', () => {
    const loc = locationFromSearch('?lat=28.6&lon=77.2&name=Delhi&evil=<script>');
    expect(loc).toMatchObject({ lat: 28.6, lon: 77.2, name: 'Delhi', source: 'url' });
  });
  it('rejects malformed or out-of-range values', () => {
    expect(locationFromSearch('?lat=abc&lon=77')).toBeNull();
    expect(locationFromSearch('?lat=95&lon=77')).toBeNull();
    expect(locationFromSearch('')).toBeNull();
  });
  it('round-trips through searchFromLocation', () => {
    const loc = makeLocation({ lat: 51.5074, lon: -0.1278, name: 'London & Co' });
    const search = searchFromLocation(loc);
    expect(search).toBe('?lat=51.5074&lon=-0.1278&name=London+%26+Co');
    expect(locationFromSearch(search)).toMatchObject({ lat: 51.5074, lon: -0.1278, name: 'London & Co' });
  });
});

describe('countryFlag', () => {
  it('builds regional indicator pairs', () => {
    expect(countryFlag('IN')).toBe('🇮🇳');
    expect(countryFlag('us')).toBe('🇺🇸');
    expect(countryFlag('')).toBe('');
    expect(countryFlag('USA')).toBe('');
  });
});
