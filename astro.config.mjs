import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Use environment variable or fallback to placeholder
const site = process.env.SITE_URL || 'https://yourdomain.com';

export default defineConfig({
  site: site,
  integrations: [
    mdx({
      remarkPlugins: [],
      rehypePlugins: [],
    }), 
    react(), 
    markdoc(), 
    keystatic()
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
  },
  adapter: cloudflare({
    imageService: 'compile'
  }),
  output: 'hybrid'
});
