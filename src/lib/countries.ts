// Pays producteurs de café : code ISO 3166-1 alpha-2 → code numérique utilisé par world-atlas.
// Ajouter une ligne ici pour pouvoir utiliser un nouveau pays dans une fiche.
export const producingCountries = {
  // Afrique
  ET: '231', KE: '404', RW: '646', BI: '108', UG: '800', TZ: '834', CD: '180',
  CM: '120', MW: '454', ZM: '894',
  // Amériques
  BR: '076', CO: '170', PE: '604', BO: '068', EC: '218', CR: '188', GT: '320',
  HN: '340', SV: '222', NI: '558', PA: '591', MX: '484', JM: '388', DO: '214',
  // Asie / Océanie / Moyen-Orient
  ID: '360', PG: '598', IN: '356', VN: '704', YE: '887', CN: '156', LA: '418',
  TH: '764', MM: '104', TL: '626', PH: '608',
} as const;

export type CountryCode = keyof typeof producingCountries;
export const countryCodes = Object.keys(producingCountries) as [CountryCode, ...CountryCode[]];
