import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Use environment variable or fallback to production domain
const site = process.env.SITE_URL || 'https://gokhanturhan.com';

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
      chunkSizeWarningLimit: 3000, // Increase limit to suppress warning for large chunks
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'astro-vendor': ['astro'],
            'keystatic-core': ['@keystatic/core'],
            'keystatic-astro': ['@keystatic/astro'],
            'keystatic-ui': ['@keystatic/ui'],
            'content-vendor': ['@astrojs/mdx', '@astrojs/markdoc'],
            'cloudflare-vendor': ['@astrojs/cloudflare'],
            'utils-vendor': ['date-fns', 'zod', 'nanoid'],
          },
        },
      },
    },
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
  },
  adapter: cloudflare(),
  output: 'server'
});
