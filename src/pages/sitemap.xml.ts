// Plan du site pour les moteurs de recherche (docs/seo.md) : pages indexables uniquement,
// avec leurs équivalents dans les autres langues. Le panier et /coolors en sont exclus (noindex).
import type { APIRoute } from 'astro';
import { langs, defaultLang } from '../i18n/ui';
import { withBase } from '../lib/paths';

/** Chemins sans la langue des pages à référencer. Ajouter ici toute nouvelle page publique. */
const pages = ['/', '/boutique/', '/contact/', '/mentions-legales/'];

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(withBase(path), site).toString();
  const lastmod = new Date().toISOString().slice(0, 10); // rebuild quotidien (deploy.yml)
  const entries = pages.flatMap((path) => {
    const alternates = [
      ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(`/${l}${path}`)}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(path === '/' ? '/' : `/${defaultLang}${path}`)}"/>`,
    ].join('\n');
    return langs.map(
      (l) => `  <url>\n    <loc>${url(`/${l}${path}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`,
    );
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
