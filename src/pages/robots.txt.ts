// robots.txt (docs/seo.md). Attention : les robots ne le lisent qu'à la racine du domaine ;
// tant que le site est servi sous /carte-cafe/, il sert surtout à indiquer le sitemap à qui le consulte.
import type { APIRoute } from 'astro';
import { withBase } from '../lib/paths';

export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL(withBase('/sitemap.xml'), site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
