import { getCollection, type CollectionEntry } from 'astro:content';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

export type Locale = 'en' | 'es';

const translations: Record<Locale, typeof en> = {
  en,
  es,
};

/**
 * Extract locale from URL pathname
 * /es/blog -> 'es'
 * /blog -> 'en'
 */
export function getLocaleFromUrl(url: URL): Locale {
  const pathname = url.pathname;
  if (pathname.startsWith('/es/') || pathname === '/es') {
    return 'es';
  }
  return 'en';
}

/**
 * Get translation for a key using dot notation
 * t('en', 'nav.home') -> 'Home'
 * t('es', 'nav.home') -> 'Inicio'
 */
export function t(locale: Locale, key: string, vars?: Record<string, string>): string {
  const keys = key.split('.');
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
 * getAlternateUrl('/blog/my-post', 'en', 'es') -> '/es/blog/my-post'
 * getAlternateUrl('/es/blog/mi-post', 'es', 'en') -> '/blog/mi-post'
 */
export function getAlternateUrl(
  currentPath: string,
  _currentLocale: Locale,
  targetLocale: Locale
): string {
  // If switching to English (default), remove /es prefix
  if (targetLocale === 'en') {
    return currentPath.replace(/^\/es(\/|$)/, '/') || '/';
  }

  // If switching to Spanish, add /es prefix
  if (targetLocale === 'es') {
    // Remove any existing /es prefix first
    const cleanPath = currentPath.replace(/^\/es(\/|$)/, '/');
    return `/es${cleanPath === '/' ? '' : cleanPath}`;
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
 */
export function getBlogPostUrl(post: CollectionEntry<'blog'>): string {
  const slug = post.data.slug;
  const locale = post.data.locale || 'en';

  if (locale === 'es') {
    return `/es/blog/${slug}`;
  }
  return `/blog/${slug}`;
}
