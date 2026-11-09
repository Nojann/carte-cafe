// @ts-check
import { defineConfig, envField } from 'astro/config';

// Par défaut : GitHub Pages, site de projet : https://nojann.github.io/carte-cafe/
// - `site` : domaine public (sert aux URL canoniques / hreflang)
// - `base` : sous-chemin du site ; sur GitHub Pages, doit correspondre exactement au nom du dépôt
// Autre hébergeur servi à la racine (ex. Cloudflare Pages) : SITE_URL=https://carte-cafe.pages.dev BASE_PATH=/
export default defineConfig({
  site: process.env.SITE_URL || 'https://nojann.github.io',
  base: process.env.BASE_PATH || '/carte-cafe',
  env: {
    schema: {
      // Coordonnées de contact (docs/configuration-github.md) : jamais écrite dans le dépôt. En local : fichier .env ;
      // sur GitHub : secret CONTACT_EMAIL (Settings → Secrets and variables → Actions).
      CONTACT_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Numéro de téléphone (format international conseillé : +41 79 123 45 67). Même principe.
      PHONE_NUMBER: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
