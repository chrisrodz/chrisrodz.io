import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    // Preserve folder structure in ID: "welcome-post-2025/en.md"
    generateId: ({ entry }) => entry,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    slug: z.string(), // Custom URL slug (e.g., "welcome-to-my-site")
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    locale: z.enum(['en', 'es']).default('en'),
  }),
});

export const collections = { blog };