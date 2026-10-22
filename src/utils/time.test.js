import { describe, expect, it } from 'vitest';
import {
  addDays, dayLabel, formatClock, formatDuration, formatHour, formatWeekday, hourKey, minutesBetween,
  nowInZone, parseLocal, relativeTime,
} from './time.js';

const ws = (s) => s.replace(/\s/g, ' ');

describe('parseLocal', () => {
  it('parses Open-Meteo local ISO strings', () => {
    expect(parseLocal('2026-10-22T14:45')).toEqual({
      year: 2026, month: 10, day: 22, hour: 14, minute: 45, date: '2026-10-22', key: '2026-10-22T14:45',
    });
  });
  it('parses date-only strings as midnight', () => {
    expect(parseLocal('2026-10-22').key).toBe('2026-10-22T00:00');
  });
  it('rejects garbage', () => {
    expect(parseLocal('yesterday')).toBeNull();
    expect(parseLocal(null)).toBeNull();
    expect(parseLocal(42)).toBeNull();
  });
});

describe('nowInZone', () => {
  it('renders wall-clock time in the given zone', () => {
    const instant = new Date(Date.UTC(2026, 9, 22, 9, 15));
    expect(nowInZone('Asia/Kolkata', instant)).toBe('2026-10-22T14:45');
    expect(nowInZone('America/New_York', instant)).toBe('2026-10-22T05:15');
  });
  it('crosses the date line correctly', () => {
    const instant = new Date(Date.UTC(2026, 9, 22, 3, 5));
    expect(nowInZone('America/Los_Angeles', instant)).toBe('2026-10-21T20:05');
  });
  it('never emits hour 24', () => {
    const instant = new Date(Date.UTC(2026, 9, 22, 0, 0));
    expect(nowInZone('UTC', instant)).toBe('2026-10-22T00:00');
  });
});

describe('hour arithmetic', () => {
  it('floors to the hour', () => {
    expect(hourKey('2026-10-22T14:45')).toBe('2026-10-22T14:00');
  });
  it('computes minutes between two local times', () => {
    expect(minutesBetween('2026-10-22T06:30', '2026-10-22T17:45')).toBe(675);
    expect(minutesBetween('2026-10-22T17:45', '2026-10-22T06:30')).toBe(-675);
    expect(minutesBetween('nope', '2026-10-22T06:30')).toBeNull();
  });
  it('adds days across month boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('formatting', () => {
  it('formats hours in 12h and 24h', () => {
    expect(ws(formatHour('2026-10-22T15:00', { hour12: true, locale: 'en-US' }))).toBe('3 PM');
    expect(formatHour('2026-10-22T15:00', { hour12: false, locale: 'en-US' })).toBe('15:00');
    expect(formatHour('2026-10-22T00:00', { hour12: false, locale: 'en-US' })).toBe('00:00');
  });
  it('formats clock times', () => {
    expect(ws(formatClock('2026-10-22T06:05', { hour12: true, locale: 'en-US' }))).toBe('6:05 AM');
    expect(formatClock('2026-10-22T06:05', { hour12: false, locale: 'en-US' })).toBe('06:05');
  });
  it('labels days relative to today', () => {
    expect(dayLabel('2026-10-22', '2026-10-22')).toBe('Today');
    expect(dayLabel('2026-10-23', '2026-10-22')).toBe('Tomorrow');
    expect(dayLabel('2026-10-21', '2026-10-22')).toBe('Yesterday');
    expect(dayLabel('2026-10-25', '2026-10-22', { locale: 'en-US' })).toBe('Sun');
    expect(formatWeekday('2026-10-25', { long: true, locale: 'en-US' })).toBe('Sunday');
  });
  it('formats durations', () => {
    expect(formatDuration(40500)).toBe('11h 15m');
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(300)).toBe('5m');
    expect(formatDuration(null)).toBe('—');
  });
  it('formats relative time', () => {
    const now = Date.UTC(2026, 9, 22, 12, 0);
    expect(relativeTime(now - 10_000, now)).toBe('just now');
    expect(relativeTime(now - 3 * 60_000, now)).toBe('3 min ago');
    expect(relativeTime(now - 2 * 3_600_000, now)).toBe('2 h ago');
    expect(relativeTime(now - 26 * 3_600_000, now)).toBe('yesterday');
  });
});
