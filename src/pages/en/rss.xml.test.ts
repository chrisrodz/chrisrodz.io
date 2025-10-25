import { describe, it, expect, vi } from 'vitest';
import { XMLParser } from 'fast-xml-parser';

// Mock blog post data
const mockBlogPosts = [
  {
    slug: 'welcome',
    data: {
      title: 'Welcome Post',
      description: 'A short description',
      pubDate: new Date('2025-01-01'),
      locale: 'en',
      category: 'tech',
    },
    body: `This is a **test** blog post with [a link](https://example.com) and some content.

It has multiple paragraphs to test the markdown rendering.

- List item 1
- List item 2`,
  },
];

// Mock astro:content module
vi.mock('astro:content', () => ({
  getCollection: vi.fn(async (collection: string, filter?: any) => {
    if (filter) {
      return mockBlogPosts.filter((post) => filter({ data: post.data }));
    }
    return mockBlogPosts;
  }),
}));

// Mock the i18n module
vi.mock('../../lib/i18n', () => ({
  getBlogPostUrl: (post: any) => `https://chrisrodz.io/en/blog/${post.slug}/`,
}));

describe('English RSS Feed Generation', () => {
  describe('Content Encoding', () => {
    it('should include content:encoded field with full HTML content', async () => {
      const { GET } = await import('./rss.xml');
      const response = await GET({ site: 'https://chrisrodz.io' } as any);

      const xml = await response.text();
      const parser = new XMLParser();
      const feed = parser.parse(xml);

      const firstItem = feed.rss.channel.item[0] || feed.rss.channel.item;

      // Verify content:encoded exists and contains HTML
      expect(firstItem['content:encoded']).toBeDefined();
      expect(firstItem['content:encoded']).toContain('<p>');
      expect(firstItem['content:encoded']).toContain('</p>');
    });

    it('should sanitize HTML content while preserving safe tags', async () => {
      const { GET } = await import('./rss.xml');
      const response = await GET({ site: 'https://chrisrodz.io' } as any);

      const xml = await response.text();
      const parser = new XMLParser();
      const feed = parser.parse(xml);

      const firstItem = feed.rss.channel.item[0] || feed.rss.channel.item;
      const content = firstItem['content:encoded'];

      // Should allow safe HTML tags
      expect(content).toMatch(/<(p|a|strong|em|ul|ol|li|h[1-6]|img)/);

      // Should not contain dangerous tags (script, iframe, etc.)
      expect(content).not.toContain('<script');
      expect(content).not.toContain('<iframe');
    });

    it('should include both description and content:encoded', async () => {
      const { GET } = await import('./rss.xml');
      const response = await GET({ site: 'https://chrisrodz.io' } as any);

      const xml = await response.text();
      const parser = new XMLParser();
      const feed = parser.parse(xml);

      const firstItem = feed.rss.channel.item[0] || feed.rss.channel.item;

      // Both fields should exist
      expect(firstItem.description).toBeDefined();
      expect(firstItem['content:encoded']).toBeDefined();

      // content:encoded should be longer than description
      expect(firstItem['content:encoded'].length).toBeGreaterThan(firstItem.description.length);
    });
  });

  describe('RSS Feed Structure', () => {
    it('should generate valid RSS 2.0 with content module namespace', async () => {
      const { GET } = await import('./rss.xml');
      const response = await GET({ site: 'https://chrisrodz.io' } as any);

      const xml = await response.text();

      // Check for content module namespace
      expect(xml).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');

      // Check for RSS 2.0 version
      expect(xml).toContain('version="2.0"');
    });
  });
});
