// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkContentImages from './src/plugins/remark-content-images.mjs';

// BASE_PATH est injecté par le workflow GitHub Actions (vide pour un domaine personnalisé).
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://artyal.com',
  base,
  // Conserve les URLs historiques : /pages/gallery.html, /pages/about.html, ...
  build: { format: 'file' },
  trailingSlash: 'ignore',
  markdown: {
    // Garde les apostrophes et guillemets tels qu'ils sont saisis (pas de typographie automatique)
    processor: unified({
      smartypants: false,
      remarkPlugins: [[remarkContentImages, { base }]],
    }),
  },
});
