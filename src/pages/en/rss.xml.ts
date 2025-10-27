import { generateRssFeed } from '@/lib/rss-helper';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  return generateRssFeed('en', context);
}
