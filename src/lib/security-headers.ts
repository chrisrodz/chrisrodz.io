import { config } from './config';

export interface SecurityHeaderOptions {
  supabaseUrl?: string | null;
}

const VERCEL_SCRIPT_SOURCES = [
  'https://va.vercel-scripts.com',
  'https://vitals.vercel-insights.com',
  'https://analytics.vercel.app',
];

const SUPABASE_WILDCARD_SOURCES = [
  'https://*.supabase.co',
  'https://*.supabase.in',
  'wss://*.supabase.co',
  'wss://*.supabase.in',
];

function normalizeSupabaseSources(url?: string | null): string[] {
  if (!url) {
    return [];
  }

  try {
    const supabaseUrl = new URL(url);
    const httpsOrigin = supabaseUrl.origin;
    const wssOrigin = `wss://${supabaseUrl.hostname}`;
    return [httpsOrigin, wssOrigin];
  } catch (error) {
    return [];
  }
}

function buildContentSecurityPolicy(options: SecurityHeaderOptions): string {
  const supabaseSources = normalizeSupabaseSources(options.supabaseUrl ?? config.database.url);

  const directives: Record<string, Set<string>> = {
    'default-src': new Set(["'self'"]),
    'script-src': new Set(["'self'", "'unsafe-inline'", ...VERCEL_SCRIPT_SOURCES]),
    'style-src': new Set(["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net']),
    'font-src': new Set(["'self'", 'https://fonts.gstatic.com']),
    'img-src': new Set(["'self'", 'data:', 'https://cdn.jsdelivr.net', 'https://avatars.githubusercontent.com']),
    'connect-src': new Set([
      "'self'",
      ...VERCEL_SCRIPT_SOURCES,
      'https://cdn.jsdelivr.net',
      ...SUPABASE_WILDCARD_SOURCES,
      ...supabaseSources,
    ]),
    'manifest-src': new Set(["'self'"]),
    'frame-ancestors': new Set(["'self'"]),
    'base-uri': new Set(["'self'"]),
    'form-action': new Set(["'self'"]),
    'object-src': new Set(['none']),
    'worker-src': new Set(["'self'"]),
  };

  const imgSrc = directives['img-src'];
  SUPABASE_WILDCARD_SOURCES.filter((source) => source.startsWith('https://')).forEach((source) =>
    imgSrc.add(source)
  );
  supabaseSources.filter((source) => source.startsWith('https://')).forEach((source) => imgSrc.add(source));

  return Object.entries(directives)
    .map(([directive, values]) => `${directive} ${Array.from(values).join(' ')}`)
    .join('; ');
}

export function getSecurityHeaders(options: SecurityHeaderOptions = {}): Record<string, string> {
  return {
    'Content-Security-Policy': buildContentSecurityPolicy(options),
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
    ].join(', '),
    'X-Content-Type-Options': 'nosniff',
  };
}

export function applySecurityHeaders(target: Headers, options: SecurityHeaderOptions = {}): void {
  const headers = getSecurityHeaders(options);
  for (const [name, value] of Object.entries(headers)) {
    target.set(name, value);
  }
}
