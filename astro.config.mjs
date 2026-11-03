// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages, site de projet : https://nojann.github.io/carte-cafe/
// - `site` : ton domaine GitHub Pages (sert aux URL canoniques / hreflang)
// - `base` : doit correspondre exactement au nom du dépôt GitHub
export default defineConfig({
  site: 'https://nojann.github.io',
  base: '/carte-cafe',
});
