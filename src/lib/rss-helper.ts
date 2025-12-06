import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { type Locale, useTranslations } from '@/lib/i18n';
import { getBlogPostUrl } from '@/lib/i18n-server';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

// Initialize markdown parser
const parser = new MarkdownIt();

/**
 * Generate an RSS feed for a specific locale
 * @param locale - The locale to generate the feed for ('en' or 'es')
 * @param context - The Astro API context
 * @returns RSS feed response
 */
export async function generateRssFeed(locale: Locale, context: APIContext) {
  const { t } = useTranslations(locale);

  // Get all blog posts for the specified locale
  const posts = await getCollection('blog', ({ data }) => data.locale === locale);

  // Sort by date (newest first)
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  // Determine the language tag for the RSS feed
  const languageTag = locale === 'en' ? 'en-us' : locale;

  return rss({
    title: t('blog.rssTitle'),
    description: t('blog.rssDescription'),
    site: context.site || 'https://chrisrodz.io',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: getBlogPostUrl(post),
      categories: post.data.category ? [post.data.category] : undefined,
      content: sanitizeHtml(parser.render(post.body || ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          a: ['href', 'target', 'rel'],
          img: ['src', 'alt', 'title'],
        },
      }),
    })),
    customData: `<language>${languageTag}</language>`,
  });
}
