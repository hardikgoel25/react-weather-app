import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, buildUrl, describeError, fetchJson } from './client.js';

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' }, ...init });

describe('buildUrl', () => {
  it('encodes values and joins arrays', () => {
    const url = buildUrl('https://example.com/v1/search', { name: 'São Paulo & co', count: 5, list: ['a', 'b'], skip: undefined, empty: '' });
    expect(url).toBe('https://example.com/v1/search?name=S%C3%A3o+Paulo+%26+co&count=5&list=a%2Cb');
  });
});

describe('fetchJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses and validates JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true, extra: 1 })));
    const data = await fetchJson('https://example.com', { schema: z.object({ ok: z.boolean() }) });
    expect(data).toEqual({ ok: true });
  });

  it('turns HTTP errors into ApiError with the server reason', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: true, reason: 'Latitude must be in range' }, { status: 400 })));
    await expect(fetchJson('https://example.com')).rejects.toMatchObject({ name: 'ApiError', code: 'client', status: 400, message: 'Latitude must be in range' });
  });

  it('classifies 5xx as retryable server errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('oops', { status: 503 })));
    const error = await fetchJson('https://example.com').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('server');
    expect(error.retryable).toBe(true);
  });

  it('rejects responses that do not match the schema', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: 'nope' })));
    await expect(fetchJson('https://example.com', { schema: z.object({ ok: z.boolean() }) })).rejects.toMatchObject({ code: 'schema' });
  });

  it('times out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))),
    );
    await expect(fetchJson('https://example.com', { timeoutMs: 5 })).rejects.toMatchObject({ code: 'timeout' });
  });

  it('propagates caller aborts as "aborted"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))),
    );
    const controller = new AbortController();
    const promise = fetchJson('https://example.com', { signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toMatchObject({ code: 'aborted' });
  });

  it('maps network failures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    const error = await fetchJson('https://example.com').catch((e) => e);
    expect(error.code).toBe('network');
    expect(describeError(error)).toMatch(/offline/);
  });
});

describe('describeError', () => {
  it('gives friendly messages', () => {
    expect(describeError(new ApiError('x', { code: 'timeout' }))).toMatch(/too long/);
    expect(describeError(new Error('boom'))).toBe('boom');
    expect(describeError(undefined)).toBe('Something went wrong.');
  });
});
