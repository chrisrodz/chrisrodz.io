import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getBlogPostUrl } from '@/lib/i18n';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

// Initialize markdown parser
const parser = new MarkdownIt();

export async function GET(context: APIContext) {
  // Get all English blog posts
  const posts = await getCollection('blog', ({ data }) => data.locale === 'en');

  // Sort by date (newest first)
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Christian Rodriguez - Blog',
    description:
      'Software engineering, life lessons, and thoughts worth sharing by Christian Rodriguez',
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
    customData: `<language>en-us</language>`,
  });
}
