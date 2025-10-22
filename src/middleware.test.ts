import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('astro:middleware', () => ({
  defineMiddleware: (handler: any) => handler,
}));

type MockCookie = {
  value?: string;
};

type MockCookies = {
  get: ReturnType<typeof vi.fn>;
};

const originalEnv = { ...import.meta.env };

function setTestEnv(overrides: Record<string, any> = {}) {
  Object.assign(import.meta.env, {
    PROD: false,
    ADMIN_SECRET_HASH: '',
    ADMIN_SECRET_SALT: '',
    SUPABASE_URL: 'https://test-project.supabase.co',
    SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_KEY: '',
    STRAVA_CLIENT_ID: '',
    STRAVA_CLIENT_SECRET: '',
    STRAVA_REFRESH_TOKEN: '',
    ...overrides,
  });
}

async function loadMiddleware() {
  vi.resetModules();
  setTestEnv();
  const module = await import('./middleware');
  return module.onRequest;
}

beforeEach(() => {
  setTestEnv();
});

afterEach(() => {
  Object.assign(import.meta.env, originalEnv);
});

describe('middleware security headers', () => {
  it('applies security headers on standard requests', async () => {
    const onRequest = await loadMiddleware();
    const cookies: MockCookies = {
      get: vi.fn<[], MockCookie | undefined>(() => undefined),
    };

    const request = new Request('https://example.com/cafe');
    const url = new URL('https://example.com/cafe');
    const responseFromNext = new Response('ok', { status: 200 });

    const next = vi.fn(async () => responseFromNext.clone());

    const context: any = {
      request,
      cookies,
      url,
      redirect: (location: string, status = 302) =>
        new Response(null, {
          status,
          headers: {
            Location: location,
          },
        }),
      response: {
        headers: new Headers(),
      },
    };

    const response = await onRequest(context, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()');
  });

  it('preserves redirect behaviour for English users while adding headers', async () => {
    const onRequest = await loadMiddleware();
    const cookies: MockCookies = {
      get: vi.fn<[], MockCookie | undefined>(() => undefined),
    };

    const request = new Request('https://example.com/', {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
    });
    const url = new URL('https://example.com/');

    const context: any = {
      request,
      cookies,
      url,
      redirect: (location: string, status = 302) =>
        new Response(null, {
          status,
          headers: {
            Location: location,
          },
        }),
      response: {
        headers: new Headers(),
      },
    };

    const response = await onRequest(context, vi.fn());

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/en');
    expect(response.headers.get('Content-Security-Policy')).toContain('https://test-project.supabase.co');
    expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
  });

  it('respects Spanish preference redirects and keeps headers', async () => {
    const onRequest = await loadMiddleware();
    const cookies: MockCookies = {
      get: vi.fn<[], MockCookie | undefined>(() => undefined),
    };

    const request = new Request('https://example.com/en', {
      headers: {
        'accept-language': 'es-ES,es;q=0.9',
      },
    });
    const url = new URL('https://example.com/en');

    const context: any = {
      request,
      cookies,
      url,
      redirect: (location: string, status = 302) =>
        new Response(null, {
          status,
          headers: {
            Location: location,
          },
        }),
      response: {
        headers: new Headers(),
      },
    };

    const response = await onRequest(context, vi.fn());

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/');
    expect(response.headers.get('Content-Security-Policy')).toContain('wss://test-project.supabase.co');
  });
});
