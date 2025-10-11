import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getBlogPostUrl } from '@/lib/i18n';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // Get all Spanish blog posts
  const posts = await getCollection('blog', ({ data }) => data.locale === 'es');

  // Sort by date (newest first)
  const sortedPosts = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'Christian Rodriguez - Blog',
    description: 'Ingeniería de software, lecciones de vida, y pensamientos que vale la pena compartir por Christian Rodriguez',
    site: context.site || 'https://chrisrodz.io',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: getBlogPostUrl(post),
      categories: post.data.category ? [post.data.category] : undefined,
    })),
    customData: `<language>es</language>`,
  });
}
