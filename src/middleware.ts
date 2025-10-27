import { defineMiddleware } from 'astro:middleware';
import { applySecurityHeaders } from './lib/security-headers';
import { config } from './lib/config';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, cookies, url } = context;
  const securityHeaderOptions = { supabaseUrl: config.database.url };

  const proceed = async () => {
    const response = await next();
    applySecurityHeaders(response.headers, securityHeaderOptions);
    return response;
  };

  // 1. Check if user has manually selected a language (respect user choice)
  const langPreference = cookies.get('preferred-lang')?.value;
  if (langPreference) {
    // User has a preference set, don't redirect
    return proceed();
  }

  // 2. Only redirect on homepage to avoid breaking deep links
  // Allow redirects from both / and /en to properly handle Accept-Language
  if (url.pathname !== '/' && url.pathname !== '/en') {
    return proceed();
  }

  // 3. Use Astro's built-in i18n properties for locale detection
  // currentLocale: derived from URL ('es' for '/', 'en' for '/en')
  // preferredLocale: best match between browser Accept-Language and supported locales
  const { currentLocale, preferredLocale } = context;

  // 4. Redirect logic based on browser language preference
  // Only redirect if browser prefers a different locale than current page
  if (preferredLocale && currentLocale !== preferredLocale) {
    // User prefers a different language than current page
    const targetPath = preferredLocale === 'en' ? '/en' : '/';
    const response = redirect(targetPath, 302);
    applySecurityHeaders(response.headers, securityHeaderOptions);
    return response;
  }

  // No redirect needed, proceed with request
  return proceed();
});
