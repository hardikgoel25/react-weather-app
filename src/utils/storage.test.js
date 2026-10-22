import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { readJson, removeKey, writeJson } from './storage.js';

const Schema = z.object({ a: z.number(), b: z.string().optional() });

describe('storage helpers', () => {
  it('round-trips validated JSON', () => {
    expect(writeJson('k', { a: 1, b: 'x' })).toBe(true);
    expect(readJson('k', Schema, null)).toEqual({ a: 1, b: 'x' });
  });
  it('returns the fallback for missing keys', () => {
    expect(readJson('missing', Schema, 'fallback')).toBe('fallback');
  });
  it('returns the fallback for corrupted or tampered values', () => {
    window.localStorage.setItem('bad', '{not json');
    expect(readJson('bad', Schema, 'fallback')).toBe('fallback');
    window.localStorage.setItem('wrong', JSON.stringify({ a: 'not a number' }));
    expect(readJson('wrong', Schema, 'fallback')).toBe('fallback');
  });
  it('strips unknown keys via the schema', () => {
    window.localStorage.setItem('extra', JSON.stringify({ a: 2, evil: true }));
    expect(readJson('extra', Schema, null)).toEqual({ a: 2 });
  });
  it('refuses oversized payloads', () => {
    expect(writeJson('big', { a: 'x'.repeat(700_000) })).toBe(false);
  });
  it('removes keys', () => {
    writeJson('gone', { a: 1 });
    removeKey('gone');
    expect(readJson('gone', Schema, null)).toBeNull();
  });
});
