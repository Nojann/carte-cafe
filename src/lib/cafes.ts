import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoDistance } from 'd3-geo';
import { getCollection, type CollectionEntry } from 'astro:content';
import { useTranslations, type Lang } from '../i18n/ui';
import { site } from '../site.config';
import { isInDepartment } from './map';
import { withBase } from './paths';

type CafeData = CollectionEntry<'cafes'>['data'];
export type Roast = CafeData['torrefactions'][number];
export type Format = Roast['formats'][number];
export type Region = CollectionEntry<'regions'>['data'];
export type Place = CollectionEntry<'lieux'>['data'];
export type Cafe = Omit<CafeData, 'region'> & {
  /** Slug de la région (département) du café. */
  region: string;
  /** Faux si toutes les torréfactions sont épuisées. */
  disponible: boolean;
};

/**
 * Charge régions, cafés et lieux de vente.
 * - Régions triées par `ordre` (nord → sud), cafés groupés par région puis d'ouest en est :
 *   c'est l'ordre utilisé pour « précédent / suivant ».
 * - Le build échoue si un café pointe vers une région inconnue ou tombe hors de son département.
 * - Les événements déjà terminés sont retirés.
 */
export async function getData() {
  const regions = (await getCollection('regions'))
    .map((e) => e.data)
    .sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom));
  const regionBySlug = new Map(regions.map((r) => [r.slug, r]));
  const rank = new Map(regions.map((r, i) => [r.slug, i]));

  const cafes: Cafe[] = (await getCollection('cafes'))
    .map(({ data }) => {
      const region = regionBySlug.get(data.region.id);
      if (!region) throw new Error(`Café « ${data.slug} » : région « ${data.region.id} » inconnue.`);
      if (!isInDepartment(region.iso, data.coordonnees)) {
        throw new Error(
          `Café « ${data.slug} » : les coordonnées (${data.coordonnees.lat}, ${data.coordonnees.lng}) sont hors du département ${region.nom}.`,
        );
      }
      return { ...data, region: region.slug, disponible: data.torrefactions.some((t) => t.disponible) };
    })
    .sort((a, b) => rank.get(a.region)! - rank.get(b.region)! || a.coordonnees.lng - b.coordonnees.lng);

  // Les fiches sans vraie photo affichent le drapeau : on le signale au build.
  for (const c of cafes) {
    const region = regionBySlug.get(c.region)!;
    if (!c.photos.some((p) => photoExists(p.src)) && !(region.photo && photoExists(region.photo.src))) {
      console.warn(`[photos] Café « ${c.slug} » : aucune photo trouvée dans public/, le drapeau sera affiché.`);
    }
  }

  const now = new Date();
  const places = (await getCollection('lieux'))
    .map((e) => e.data)
    .filter((p) => !p.dates || p.dates.fin >= now)
    .sort((a, b) => a.coordonnees.lng - b.coordonnees.lng);

  return { regions, cafes, places };
}

export function countryName(code: string, lang: Lang) {
  return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code;
}

export function formatPrice(montant: number, devise: string, lang: Lang) {
  return new Intl.NumberFormat(lang, { style: 'currency', currency: devise }).format(montant);
}

/** « 250 g », « 1 kg » (même rendu que weightLabel dans scripts/cart.ts). */
export function formatWeight(g: number, lang: Lang) {
  return g >= 1000
    ? new Intl.NumberFormat(lang, { style: 'unit', unit: 'kilogram' }).format(g / 1000)
    : new Intl.NumberFormat(lang, { style: 'unit', unit: 'gram' }).format(g);
}

/** Prix et disponibilité par « torréfaction:poids », lus par les formulaires produit (scripts/cart.ts). */
export function offersOf(cafe: Cafe, lang: Lang) {
  const offers: Record<string, { price: string; disponible: boolean }> = {};
  for (const r of cafe.torrefactions) {
    for (const f of r.formats) {
      offers[`${r.niveau}:${f.poids_g}`] = { price: formatPrice(f.montant, r.devise, lang), disponible: r.disponible };
    }
  }
  return JSON.stringify(offers);
}

/** Identifiant d'un article du panier : café, torréfaction et format, ex. « narino-lave:moyenne:250 ». */
export function itemId(cafe: Cafe, roast: Roast, format: Format) {
  return `${cafe.slug}:${roast.niveau}:${format.poids_g}`;
}

/** Prix d'appel : le plus petit format de la torréfaction disponible la moins chère. */
export function minPrice(cafe: Cafe) {
  const offers = cafe.torrefactions
    .filter((r) => r.disponible)
    .map((r) => ({ roast: r, format: r.formats[0] }));
  if (!offers.length) return null;
  const min = offers.reduce((a, b) => (b.format.montant < a.format.montant ? b : a));
  return { ...min, from: offers.some((o) => o.format.montant !== min.format.montant) };
}

/** Article ajouté par les boutons « Acheter » rapides : torréfaction principale, plus petit format. */
export function quickItem(cafe: Cafe) {
  const roast = mainRoast(cafe);
  return itemId(cafe, roast, roast.formats[0]);
}

/** Catalogue de tous les articles, embarqué dans la page panier : les prix viennent toujours du build. */
export function cartCatalog(cafes: Cafe[], regions: Region[], lang: Lang) {
  const t = useTranslations(lang);
  const regionBySlug = new Map(regions.map((r) => [r.slug, r]));
  const catalog: Record<string, CatalogItem> = {};
  for (const cafe of cafes) {
    const photo = pickPhoto(cafe, regionBySlug.get(cafe.region)!);
    for (const roast of cafe.torrefactions) {
      for (const format of roast.formats) {
        catalog[itemId(cafe, roast, format)] = {
          slug: cafe.slug,
          nom: cafe.nom[lang],
          roast: `${t(`roast.${roast.niveau}`)} · ${t(`usage.${roast.usage}`)}`,
          poids_g: format.poids_g,
          montant: format.montant,
          devise: roast.devise,
          disponible: roast.disponible,
          photo: photoExists(photo.src) ? withBase(photo.src) : null,
        };
      }
    }
  }
  return catalog;
}

export type CatalogItem = {
  slug: string;
  nom: string;
  roast: string;
  poids_g: number;
  montant: number;
  devise: string;
  disponible: boolean;
  photo: string | null;
};

/** Première photo du café présente sur le disque, sinon photo de la région, sinon la première déclarée. */
export function pickPhoto(cafe: Cafe, region: Region) {
  return [...cafe.photos, region.photo].find((p) => p && photoExists(p.src)) ?? cafe.photos[0];
}

export function formatAltitude(alt: NonNullable<Cafe['altitude']>, lang: Lang) {
  const n = new Intl.NumberFormat(lang);
  return alt.min === alt.max ? `${n.format(alt.min)} m` : `${n.format(alt.min)} – ${n.format(alt.max)} m`;
}

export function formatDates(dates: NonNullable<Place['dates']>, lang: Lang) {
  const f = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return f.formatRange(dates.debut, dates.fin);
}

/** Distance orthodromique (« à vol d'oiseau ») entre l'origine et la torréfaction. */
export function formatDistance(cafe: Cafe, lang: Lang) {
  const { lat, lng } = cafe.coordonnees;
  const km = geoDistance([lng, lat], [site.roastery.lng, site.roastery.lat]) * 6371;
  return `≈ ${new Intl.NumberFormat(lang).format(Math.round(km / 100) * 100)} km`;
}

/** Torréfaction mise en avant (première disponible, sinon la première). */
export function mainRoast(cafe: Cafe) {
  return cafe.torrefactions.find((t) => t.disponible) ?? cafe.torrefactions[0];
}

export function mapsUrl(place: Place) {
  if (place.lien_maps) return place.lien_maps;
  const { lat, lng } = place.coordonnees;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Drapeau du pays (paquet flag-icons, MIT) en data-URI : isolé dans une <img>, sans conflit d'id SVG. */
export function flagDataUri(code: string) {
  const file = join(process.cwd(), 'node_modules/flag-icons/flags/4x3', `${code.toLowerCase()}.svg`);
  return `data:image/svg+xml;base64,${readFileSync(file).toString('base64')}`;
}

/** Les photos manquantes sont remplacées par une illustration, au lieu d'une image cassée. */
export function photoExists(src: string) {
  return existsSync(join(process.cwd(), 'public', src));
}
