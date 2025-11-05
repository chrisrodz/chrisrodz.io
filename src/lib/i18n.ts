import { getCollection, type CollectionEntry } from 'astro:content';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import type { TranslationKey } from './i18n-keys';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
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
 * Extract translation key from post ID
 * e.g., "welcome-post-2025/en.md" -> "welcome-post-2025"
 * e.g., "welcome-post-2025/en" -> "welcome-post-2025"
 */
export function getTranslationKey(post: CollectionEntry<'blog'>): string {
  // Remove .md/.mdx extension if present
  const cleanId = post.id.replace(/\.mdx?$/, '');
  const parts = cleanId.split('/');
  return parts[0]; // First part is the folder name (translation key)
}

/**
 * Find translated blog post by looking for sibling in same folder
 */
export async function getTranslatedPost(
  post: CollectionEntry<'blog'>,
  targetLocale: Locale
): Promise<CollectionEntry<'blog'> | null> {
  const translationKey = getTranslationKey(post);
  const allPosts = await getCollection('blog');

  const translated = allPosts.find(
    (p) => getTranslationKey(p) === translationKey && p.data.locale === targetLocale
  );

  return translated || null;
}

/**
 * Get the custom URL slug from post frontmatter
 */
export function getPostSlug(post: CollectionEntry<'blog'>): string {
  return post.data.slug;
}

/**
 * Build blog post URL based on locale
 * Spanish (default): /blog/slug
 * English: /en/blog/slug
 */
export function getBlogPostUrl(post: CollectionEntry<'blog'>): string {
  const slug = post.data.slug;
  const locale = post.data.locale || 'es'; // Default to Spanish

  if (locale === 'en') {
    return `/en/blog/${slug}`;
  }
  return `/blog/${slug}`;
}

/**
 * Helper for components that need translations
 */
export function useTranslations(locale: Locale) {
  return {
    t: (key: TranslationKey, vars?: Record<string, string>) => t(locale, key, vars),
    locale,
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options),
    formatNumber: (num: number) => num.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US'),
  };
}
