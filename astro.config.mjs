import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yoursite.com',
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