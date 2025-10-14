import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chrisrodz.io',
  output: 'server',
  adapter: vercel(),
  prefetch: true,
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        // Exclude admin pages from sitemap
        if (page.includes('/admin')) return false;
        // Exclude 404 page
        if (page.includes('/404')) return false;
        return true;
      },
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es',
          en: 'en',
        },
      },
    }),
  ],
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false, // Spanish has no prefix
    },
  },
});
