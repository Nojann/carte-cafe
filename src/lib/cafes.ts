import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoDistance } from 'd3-geo';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { site } from '../site.config';
import { isInDepartment } from './map';

type CafeData = CollectionEntry<'cafes'>['data'];
export type Roast = CafeData['torrefactions'][number];
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

export function formatPrice(prix: NonNullable<Roast['prix']>, lang: Lang) {
  return new Intl.NumberFormat(lang, { style: 'currency', currency: prix.devise }).format(prix.montant);
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

export function buyUrl(cafe: Cafe, roast: Roast, lang: Lang) {
  const url = new URL(roast.lien[lang]);
  for (const [k, v] of Object.entries(site.utm)) url.searchParams.set(k, v);
  url.searchParams.set('utm_campaign', `${cafe.slug}-${roast.niveau}`);
  return url.toString();
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
