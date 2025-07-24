import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Use environment variable or fallback to placeholder
const site = process.env.SITE_URL || 'https://yourdomain.com';

export default defineConfig({
  site: site,
  integrations: [
    mdx({
      remarkPlugins: [],
      rehypePlugins: [],
    })
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
      minify: true,
    },
    optimizeDeps: {
      include: ['tinacms']
    },
    ssr: {
      external: ['@tinacms/cli']
    }
  },
});