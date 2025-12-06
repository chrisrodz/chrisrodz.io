import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';

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
