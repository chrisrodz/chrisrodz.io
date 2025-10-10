import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, cookies, url } = context;

  // 1. Check if user has manually selected a language (respect user choice)
  const langPreference = cookies.get('preferred-lang')?.value;
  if (langPreference) {
    // User has a preference set, don't redirect
    return next();
  }

  // 2. Only redirect on homepage to avoid breaking deep links
  // Allow redirects from both / and /es to properly handle Accept-Language
  if (url.pathname !== '/' && url.pathname !== '/es') {
    return next();
  }

  // 3. Check Accept-Language header (W3C standard)
  const acceptLang = request.headers.get('accept-language') || '';
  const browserPrefersSpanish = acceptLang.toLowerCase().includes('es');

  // 4. Redirect logic based on browser language preference
  if (browserPrefersSpanish && url.pathname === '/') {
    // User prefers Spanish and is on English homepage -> redirect to Spanish
    return redirect('/es', 302);
  }

  if (!browserPrefersSpanish && url.pathname === '/es') {
    // User prefers English and is on Spanish homepage -> redirect to English
    return redirect('/', 302);
  }

  // No redirect needed, proceed with request
  return next();
});
