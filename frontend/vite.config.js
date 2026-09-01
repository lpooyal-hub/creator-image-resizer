import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SEO_LANDING_PAGES } from './src/utils/seoLandingPages.js';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          SEO_LANDING_PAGES.map((page) => [page.slug, resolve(__dirname, `${page.slug}.html`)]),
        ),
      },
    },
  },
});

