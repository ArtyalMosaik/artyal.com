// @ts-check
import { defineConfig } from 'astro/config';

// BASE_PATH est injecté par le workflow GitHub Actions (vide pour un domaine personnalisé).
export default defineConfig({
  site: 'https://artyal.com',
  base: process.env.BASE_PATH || '/',
  // Conserve les URLs historiques : /pages/gallery.html, /pages/about.html, ...
  build: { format: 'file' },
  trailingSlash: 'ignore',
});
