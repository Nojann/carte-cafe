// @ts-check
import { defineConfig, envField } from 'astro/config';

// GitHub Pages, site de projet : https://nojann.github.io/carte-cafe/
// - `site` : ton domaine GitHub Pages (sert aux URL canoniques / hreflang)
// - `base` : doit correspondre exactement au nom du dépôt GitHub
export default defineConfig({
  site: 'https://nojann.github.io',
  base: '/carte-cafe',
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
