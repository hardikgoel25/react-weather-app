/**
 * Minimal, hardened fetch wrapper shared by all API modules.
 *  - every URL is built with URLSearchParams (no string concatenation of input)
 *  - hard timeout via AbortController, merged with the caller's signal
 *  - non-2xx, malformed JSON and schema mismatches become typed ApiErrors
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'network', cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ApiError';
    this.status = status;
    this.code = code; // network | timeout | client | server | schema | aborted
  }

  get retryable() {
    return this.code === 'network' || this.code === 'timeout' || this.code === 'server' || this.status === 429;
  }
}

export function buildUrl(base, params = {}) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return url.toString();
}

export async function fetchJson(url, { signal, timeoutMs = 10_000, schema, headers } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
  const onAbort = () => controller.abort('aborted');
  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', ...headers },
      referrerPolicy: 'strict-origin-when-cross-origin',
    });

    if (!response.ok) {
      let reason = '';
      try {
        const body = await response.json();
        if (body && typeof body.reason === 'string') reason = body.reason;
      } catch {
        /* body not JSON */
      }
      throw new ApiError(reason || `Request failed with status ${response.status}`, {
        status: response.status,
        code: response.status >= 500 ? 'server' : 'client',
      });
    }

    let json;
    try {
      json = await response.json();
    } catch (cause) {
      throw new ApiError('The server returned malformed data', { code: 'schema', cause });
    }

    if (schema) {
      const parsed = schema.safeParse(json);
      if (!parsed.success) {
        throw new ApiError('The server returned data in an unexpected shape', {
          code: 'schema',
          cause: parsed.error,
        });
      }
      return parsed.data;
    }
    return json;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      if (controller.signal.reason === 'timeout') {
        throw new ApiError('The request timed out', { code: 'timeout', cause: error });
      }
      throw new ApiError('Request cancelled', { code: 'aborted', cause: error });
    }
    throw new ApiError('Could not reach the server', { code: 'network', cause: error });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

/** Human-friendly message for any thrown value. */
export function describeError(error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'timeout':
        return 'The request took too long. Check your connection and try again.';
      case 'network':
        return 'Could not reach the weather service. You may be offline.';
      case 'server':
        return 'The weather service is having trouble. Please try again shortly.';
      case 'schema':
        return 'Received unexpected data from the weather service.';
      case 'aborted':
        return 'Request cancelled.';
      default:
        return error.message || 'Something went wrong.';
    }
  }
  if (error && typeof error.message === 'string' && error.message) return error.message;
  return 'Something went wrong.';
}
