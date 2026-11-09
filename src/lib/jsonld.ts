// Données structurées schema.org : site / organisation (toutes les pages) et Product / Offer d'un café
// (partagées par l'accueil et la boutique). Conseils SEO : docs/seo.md.
import { useTranslations, type Lang } from '../i18n/ui';
import { site } from '../site.config';
import { countryName, formatWeight, pickPhoto, type Cafe, type Region } from './cafes';
import { homePath, shopPath, withBase } from './paths';

const absolute = (path: string, origin: URL | undefined) => new URL(path, origin).toString();

/** Identifiant stable de l'organisation, référencé par les offres (`seller`). */
const organizationId = (origin: URL | undefined) => `${absolute(withBase('/'), origin)}#organization`;

/** Organisation + site web : présent dans l'en-tête de chaque page indexable. */
export function siteJsonLd(lang: Lang, origin: URL | undefined) {
  const home = absolute(homePath(lang), origin);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId(origin),
        name: site.brand,
        url: absolute(withBase('/'), origin),
        logo: absolute(withBase('/images/logo.avif'), origin),
        sameAs: [site.instagram],
      },
      {
        '@type': 'WebSite',
        name: site.brand,
        url: home,
        inLanguage: lang,
        publisher: { '@id': organizationId(origin) },
      },
    ],
  };
}

export function productJsonLd(cafe: Cafe, region: Region, lang: Lang, origin: URL | undefined) {
  const t = useTranslations(lang);
  const url = absolute(`${shopPath(lang)}#${cafe.slug}`, origin);
  const photo = pickPhoto(cafe, region);
  return {
    '@type': 'Product',
    name: cafe.nom[lang],
    description: cafe.histoire?.[lang] ?? cafe.notes[lang].join(', '),
    ...(photo && { image: absolute(withBase(photo.src), origin) }),
    brand: { '@type': 'Brand', name: site.brand },
    countryOfOrigin: countryName(cafe.pays, lang),
    url,
    offers: cafe.torrefactions.flatMap((r) =>
      r.formats.map((f) => ({
        '@type': 'Offer',
        name: `${t(`roast.${r.niveau}`)} · ${formatWeight(f.poids_g, lang)}`,
        price: f.montant,
        priceCurrency: r.devise,
        availability: `https://schema.org/${r.disponible ? 'InStock' : 'OutOfStock'}`,
        seller: { '@type': 'Organization', '@id': organizationId(origin), name: site.brand },
        url,
      })),
    ),
  };
}
