import { defineConfig } from 'astro/config';

// Use environment variable or fallback to placeholder
const site = process.env.SITE_URL || 'https://yourdomain.com';

export default defineConfig({
  site: site,
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
      minify: true,
    },
  },
});