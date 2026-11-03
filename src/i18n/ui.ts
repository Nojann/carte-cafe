// Textes de l'interface. Les textes marqués EXEMPLE sont à réécrire avec ta propre voix.
export const languages = { fr: 'Français', en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export const langs = Object.keys(languages) as Lang[];
export const defaultLang: Lang = 'fr';

const fr = {
  'meta.title': 'D’où viennent nos cafés ? — Carte des origines',
  'meta.description':
    'Explorez sur une carte du monde l’origine de chacun de nos cafés : pays, région, producteurs, process et notes de dégustation.',
  'nav.map': 'La carte',
  'nav.approach': 'Notre démarche',
  'nav.shop': 'Boutique',
  'nav.language': 'Langue',
  'hero.eyebrow': 'Carte des origines',
  'hero.title.a': 'Chaque tasse a une',
  'hero.title.b': 'adresse.',
  'hero.subtitle':
    'Nos cafés viennent de fermes et de coopératives que nous connaissons. Partez à leur rencontre, d’un point de la carte à l’autre.',
  'hero.cta': 'Explorer la carte',
  'map.title': 'Nos origines',
  'map.label': 'Carte du monde des origines de nos cafés',
  'map.belt': 'Ceinture du café',
  'map.world': 'Vue monde',
  'map.hint': 'Choisissez un point sur la carte pour découvrir l’histoire du café.',
  'map.count': '{n} cafés, {c} pays',
  'map.roastery': 'Notre torréfaction · {city}',
  'sheet.producer': 'Producteur',
  'sheet.altitude': 'Altitude',
  'sheet.varieties': 'Variétés',
  'sheet.process': 'Process',
  'sheet.harvest': 'Récolte',
  'sheet.distance': 'Distance jusqu’à {city}',
  'sheet.notes': 'Notes de dégustation',
  'sheet.profile': 'Profil',
  'sheet.acidity': 'Acidité',
  'sheet.body': 'Corps',
  'sheet.sweetness': 'Douceur',
  'sheet.outOf5': '{v} sur 5',
  'sheet.buy': 'Acheter ce café',
  'sheet.soldOut': 'Épuisé',
  'sheet.soldOutCta': 'Voir sur la boutique',
  'sheet.prev': 'Café précédent',
  'sheet.next': 'Café suivant',
  'sheet.close': 'Fermer et revenir à la vue monde',
  'sheet.per': 'les {g} g',
  'list.title': 'Tous nos cafés',
  'list.show': 'Voir sur la carte',
  'approach.title': 'Notre démarche',
  'approach.1.title': 'Des relations directes', // EXEMPLE
  'approach.1.text':
    'Nous achetons autant que possible auprès des mêmes producteurs, saison après saison, pour construire une relation dans la durée.',
  'approach.2.title': 'Une traçabilité complète', // EXEMPLE
  'approach.2.text':
    'Pour chaque café, nous savons de quelle ferme ou coopérative il vient, à quelle altitude il a poussé et comment il a été traité.',
  'approach.3.title': 'Torréfié pour révéler l’origine', // EXEMPLE
  'approach.3.text':
    'Nos profils de torréfaction cherchent à mettre en valeur le terroir de chaque café plutôt qu’à le masquer.',
  'footer.contact': 'Contact',
  'footer.legal': 'Mentions légales',
  'footer.examples': 'Données présentées à titre d’exemple.',
  'process.lave': 'Lavé',
  'process.nature': 'Nature',
  'process.honey': 'Honey',
  'process.semi-lave': 'Semi-lavé (giling basah)',
  'process.anaerobie': 'Anaérobie',
};

type Dict = Record<keyof typeof fr, string>;

const en: Dict = {
  'meta.title': 'Where do our coffees come from? — Origins map',
  'meta.description':
    'Explore on a world map where each of our coffees comes from: country, region, producers, process and tasting notes.',
  'nav.map': 'The map',
  'nav.approach': 'Our approach',
  'nav.shop': 'Shop',
  'nav.language': 'Language',
  'hero.eyebrow': 'Origins map',
  'hero.title.a': 'Every cup has an',
  'hero.title.b': 'address.',
  'hero.subtitle':
    'Our coffees come from farms and cooperatives we know. Go and meet them, from one point on the map to the next.',
  'hero.cta': 'Explore the map',
  'map.title': 'Our origins',
  'map.label': 'World map of our coffee origins',
  'map.belt': 'Coffee belt',
  'map.world': 'World view',
  'map.hint': 'Pick a point on the map to discover the story behind the coffee.',
  'map.count': '{n} coffees, {c} countries',
  'map.roastery': 'Our roastery · {city}',
  'sheet.producer': 'Producer',
  'sheet.altitude': 'Altitude',
  'sheet.varieties': 'Varieties',
  'sheet.process': 'Process',
  'sheet.harvest': 'Harvest',
  'sheet.distance': 'Distance to {city}',
  'sheet.notes': 'Tasting notes',
  'sheet.profile': 'Profile',
  'sheet.acidity': 'Acidity',
  'sheet.body': 'Body',
  'sheet.sweetness': 'Sweetness',
  'sheet.outOf5': '{v} out of 5',
  'sheet.buy': 'Buy this coffee',
  'sheet.soldOut': 'Sold out',
  'sheet.soldOutCta': 'See in the shop',
  'sheet.prev': 'Previous coffee',
  'sheet.next': 'Next coffee',
  'sheet.close': 'Close and return to world view',
  'sheet.per': 'per {g} g',
  'list.title': 'All our coffees',
  'list.show': 'Show on map',
  'approach.title': 'Our approach',
  'approach.1.title': 'Direct relationships',
  'approach.1.text':
    'Whenever we can, we buy from the same producers season after season, to build long-term relationships.',
  'approach.2.title': 'Full traceability',
  'approach.2.text':
    'For every coffee, we know which farm or cooperative it comes from, the altitude it grew at and how it was processed.',
  'approach.3.title': 'Roasted to reveal origin',
  'approach.3.text':
    'Our roast profiles aim to highlight each coffee’s terroir rather than mask it.',
  'footer.contact': 'Contact',
  'footer.legal': 'Legal notice',
  'footer.examples': 'Data shown for illustration purposes.',
  'process.lave': 'Washed',
  'process.nature': 'Natural',
  'process.honey': 'Honey',
  'process.semi-lave': 'Wet-hulled (giling basah)',
  'process.anaerobie': 'Anaerobic',
};

const es: Dict = {
  'meta.title': '¿De dónde vienen nuestros cafés? — Mapa de orígenes',
  'meta.description':
    'Explora en un mapa del mundo el origen de cada uno de nuestros cafés: país, región, productores, proceso y notas de cata.',
  'nav.map': 'El mapa',
  'nav.approach': 'Nuestro enfoque',
  'nav.shop': 'Tienda',
  'nav.language': 'Idioma',
  'hero.eyebrow': 'Mapa de orígenes',
  'hero.title.a': 'Cada taza tiene una',
  'hero.title.b': 'dirección.',
  'hero.subtitle':
    'Nuestros cafés vienen de fincas y cooperativas que conocemos. Ve a su encuentro, de un punto del mapa a otro.',
  'hero.cta': 'Explorar el mapa',
  'map.title': 'Nuestros orígenes',
  'map.label': 'Mapa del mundo con los orígenes de nuestros cafés',
  'map.belt': 'Cinturón del café',
  'map.world': 'Vista mundial',
  'map.hint': 'Elige un punto del mapa para descubrir la historia del café.',
  'map.count': '{n} cafés, {c} países',
  'map.roastery': 'Nuestra tostaduría · {city}',
  'sheet.producer': 'Productor',
  'sheet.altitude': 'Altitud',
  'sheet.varieties': 'Variedades',
  'sheet.process': 'Proceso',
  'sheet.harvest': 'Cosecha',
  'sheet.distance': 'Distancia hasta {city}',
  'sheet.notes': 'Notas de cata',
  'sheet.profile': 'Perfil',
  'sheet.acidity': 'Acidez',
  'sheet.body': 'Cuerpo',
  'sheet.sweetness': 'Dulzor',
  'sheet.outOf5': '{v} de 5',
  'sheet.buy': 'Comprar este café',
  'sheet.soldOut': 'Agotado',
  'sheet.soldOutCta': 'Ver en la tienda',
  'sheet.prev': 'Café anterior',
  'sheet.next': 'Café siguiente',
  'sheet.close': 'Cerrar y volver a la vista mundial',
  'sheet.per': 'los {g} g',
  'list.title': 'Todos nuestros cafés',
  'list.show': 'Ver en el mapa',
  'approach.title': 'Nuestro enfoque',
  'approach.1.title': 'Relaciones directas',
  'approach.1.text':
    'Siempre que podemos, compramos a los mismos productores temporada tras temporada, para construir relaciones duraderas.',
  'approach.2.title': 'Trazabilidad completa',
  'approach.2.text':
    'De cada café sabemos de qué finca o cooperativa viene, a qué altitud creció y cómo fue procesado.',
  'approach.3.title': 'Tostado para revelar el origen',
  'approach.3.text':
    'Nuestros perfiles de tueste buscan resaltar el terroir de cada café en lugar de ocultarlo.',
  'footer.contact': 'Contacto',
  'footer.legal': 'Aviso legal',
  'footer.examples': 'Datos mostrados a modo de ejemplo.',
  'process.lave': 'Lavado',
  'process.nature': 'Natural',
  'process.honey': 'Honey',
  'process.semi-lave': 'Semilavado (giling basah)',
  'process.anaerobie': 'Anaeróbico',
};

const ui: Record<Lang, Dict> = { fr, en, es };
export type UIKey = keyof Dict;

export function useTranslations(lang: Lang) {
  return (key: UIKey, vars: Record<string, string | number> = {}) =>
    ui[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && value in languages;
}
