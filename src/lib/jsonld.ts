// Données structurées schema.org (Product / Offer) d'un café, partagées par l'accueil et la boutique.
import { useTranslations, type Lang } from '../i18n/ui';
import { site } from '../site.config';
import { countryName, formatWeight, type Cafe } from './cafes';
import { shopPath } from './paths';

export function productJsonLd(cafe: Cafe, lang: Lang, origin: URL | undefined) {
  const t = useTranslations(lang);
  const url = new URL(`${shopPath(lang)}#${cafe.slug}`, origin).toString();
  return {
    '@type': 'Product',
    name: cafe.nom[lang],
    description: cafe.histoire?.[lang] ?? cafe.notes[lang].join(', '),
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
        url,
      })),
    ),
  };
}
