import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoDistance } from 'd3-geo';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { site } from '../site.config';

export type Cafe = CollectionEntry<'cafes'>['data'];

/** Cafés triés d'ouest en est : l'ordre utilisé pour « précédent / suivant ». */
export async function getCafes(): Promise<Cafe[]> {
  const entries = await getCollection('cafes');
  return entries.map((e) => e.data).sort((a, b) => a.coordonnees.lng - b.coordonnees.lng);
}

export function countryName(code: string, lang: Lang) {
  return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code;
}

export function formatPrice(prix: NonNullable<Cafe['prix']>, lang: Lang) {
  return new Intl.NumberFormat(lang, { style: 'currency', currency: prix.devise }).format(prix.montant);
}

export function formatAltitude(alt: NonNullable<Cafe['altitude']>, lang: Lang) {
  const n = new Intl.NumberFormat(lang);
  return alt.min === alt.max ? `${n.format(alt.min)} m` : `${n.format(alt.min)} – ${n.format(alt.max)} m`;
}

/** Distance orthodromique (« à vol d'oiseau ») entre l'origine et la torréfaction. */
export function formatDistance(cafe: Cafe, lang: Lang) {
  const { lat, lng } = cafe.coordonnees;
  const km = geoDistance([lng, lat], [site.roastery.lng, site.roastery.lat]) * 6371;
  return `≈ ${new Intl.NumberFormat(lang).format(Math.round(km / 100) * 100)} km`;
}

export function buyUrl(cafe: Cafe, lang: Lang) {
  const url = new URL(cafe.lien[lang]);
  for (const [k, v] of Object.entries(site.utm)) url.searchParams.set(k, v);
  url.searchParams.set('utm_campaign', cafe.slug);
  return url.toString();
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
