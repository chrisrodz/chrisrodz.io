import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN || process.env.SENTRY_DSN,

  // Free tier optimization: 10% error sampling
  sampleRate: 0.1,

  // No tracing on free tier
  tracesSampleRate: 0,

  environment: import.meta.env.PROD ? 'production' : 'development',

  // Filter out expected errors
  beforeSend(event) {
    // Skip 404s (expected behavior)
    if (event.exception?.values?.[0]?.value?.includes('404')) {
      return null;
    }
    return event;
  },

  sendDefaultPii: false,
});
