import en from '../i18n/en.json';
import es from '../i18n/es.json';
import type { TranslationKey } from './i18n-keys';
import { formatDate as formatDateWithDayjs } from './date-utils';

export type Locale = 'en' | 'es';

const translations: Record<Locale, typeof en> = {
  en,
  es,
};

/**
 * Extract locale from URL pathname
 * /en/blog -> 'en'
 * /blog -> 'es' (Spanish is now default)
 */
export function getLocaleFromUrl(url: URL): Locale {
  const pathname = url.pathname;
  // English now has the prefix
  if (pathname.startsWith('/en/') || pathname === '/en') {
    return 'en';
  }
  // Spanish is default (no prefix)
  return 'es';
}

/**
 * Get translation for a key using dot notation
 * t('es', 'nav.home') -> 'Inicio'
 * t('en', 'nav.home') -> 'Home'
 */
export function t(locale: Locale, key: TranslationKey, vars?: Record<string, string>): string {
  const keys = key.split('.');
  let value: unknown = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key} for locale ${locale}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }

  // Replace variables like {year}
  if (vars) {
    return value.replace(/\{(\w+)\}/g, (match, varName) => {
      return vars[varName] || match;
    });
  }

  return value;
}

/**
 * Generate URL for alternate language
 * getAlternateUrl('/blog/my-post', 'en') -> '/en/blog/my-post'
 * getAlternateUrl('/en/blog/my-post', 'es') -> '/blog/my-post'
 */
export function getAlternateUrl(currentPath: string, targetLocale: Locale): string {
  // If switching to Spanish (default), remove /en prefix
  if (targetLocale === 'es') {
    return currentPath.replace(/^\/en(\/|$)/, '/') || '/';
  }

  // If switching to English, add /en prefix
  if (targetLocale === 'en') {
    // Remove any existing /en prefix first
    const cleanPath = currentPath.replace(/^\/en(\/|$)/, '/');
    return `/en${cleanPath === '/' ? '' : cleanPath}`;
  }

  return currentPath;
}

/**
 * Helper for components that need translations
 */
export function useTranslations(locale: Locale) {
  return {
    t: (key: TranslationKey, vars?: Record<string, string>) => t(locale, key, vars),
    locale,
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      formatDateWithDayjs(date, locale, options),
    formatNumber: (num: number) => num.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US'),
  };
}
