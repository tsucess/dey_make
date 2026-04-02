import { afterEach, describe, expect, it, vi } from 'vitest';

describe('api request handling', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
    window.localStorage.clear();
  });

  it('times out stalled requests', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    })));

    const { api, DEFAULT_REQUEST_TIMEOUT_MS } = await import('./api');
    const request = api.getConversations().catch((error) => {
      throw error;
    });
    const expectation = expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 408,
      message: 'Request timed out.',
    });

    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS + 1);

    await expectation;
  });

  it('normalizes network failures into ApiError instances', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const { api } = await import('./api');

    await expect(api.getConversations()).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      message: 'Unable to reach the server.',
    });
  });
});