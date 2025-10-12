import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chrisrodz.io',
  output: 'server',
  adapter: vercel(),
  prefetch: true,
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) => {
        // Exclude admin pages from sitemap
        if (page.includes('/admin')) return false;
        // Exclude 404 page
        if (page.includes('/404')) return false;
        return true;
      },
    }),
  ],
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
