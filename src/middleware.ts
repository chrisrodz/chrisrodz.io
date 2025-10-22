import { defineMiddleware } from 'astro:middleware';
import { applySecurityHeaders } from './lib/security-headers';
import { config } from './lib/config';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, cookies, url } = context;
  const securityHeaderOptions = { supabaseUrl: config.database.url };

  applySecurityHeaders(context.response.headers, securityHeaderOptions);

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

  // 3. Check Accept-Language header (W3C standard) with robust parsing
  const acceptLang = request.headers.get('accept-language') || '';

  // Parse Accept-Language header more robustly
  // Handles cases like: "es-MX, es-419, es;q=0.9, en;q=0.8"
  const languages = acceptLang
    .split(',')
    .map((lang) => lang.split(';')[0].trim().toLowerCase())
    .filter((lang) => lang.length > 0);

  const browserPrefersEnglish = languages.some((lang) => lang.startsWith('en'));

  // 4. Redirect logic based on browser language preference
  // FLIPPED: Spanish is now default
  if (browserPrefersEnglish && url.pathname === '/') {
    // User prefers English and is on Spanish homepage -> redirect to English
    const response = redirect('/en', 302);
    applySecurityHeaders(response.headers, securityHeaderOptions);
    return response;
  }

  if (!browserPrefersEnglish && url.pathname === '/en') {
    // User prefers Spanish and is on English homepage -> redirect to Spanish
    const response = redirect('/', 302);
    applySecurityHeaders(response.headers, securityHeaderOptions);
    return response;
  }

  // No redirect needed, proceed with request
  return proceed();
});
