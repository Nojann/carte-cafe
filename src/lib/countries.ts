// Pays affichés sur la carte : code ISO 3166-1 alpha-2 → code numérique utilisé par world-atlas.
// La Colombie est le seul pays d'origine, la Suisse le pays de vente.
export const countryIds = { CO: '170', CH: '756' } as const;

// Pays voisins dessinés en fond dans chaque loupe, pour situer le pays.
export const neighbourIds = {
  co: ['591', '862', '218', '604', '076', '188'], // Panama, Venezuela, Équateur, Pérou, Brésil, Costa Rica
  ch: ['250', '276', '380', '040', '438'], // France, Allemagne, Italie, Autriche, Liechtenstein
} as const;
