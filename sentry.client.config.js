import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,

  // Free tier optimization: 10% error sampling
  sampleRate: 0.1,

  // No tracing on free tier (conserves quota)
  tracesSampleRate: 0,

  // No replay on free tier (conserves quota)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Environment tagging
  environment: import.meta.env.PROD ? 'production' : 'development',

  // Filter out noise
  beforeSend(event) {
    // Drop console errors from browser extensions
    if (
      event.exception?.values?.[0]?.stacktrace?.frames?.some((frame) =>
        frame.filename?.includes('chrome-extension')
      )
    ) {
      return null;
    }
    return event;
  },

  // Don't send PII
  sendDefaultPii: false,
});
