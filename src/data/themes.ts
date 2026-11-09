// Nuanciers disponibles comme thème du site (choix sur la page cachée /coolors).
// Chaque thème surcharge les 11 tokens couleur de `global.css`. Le premier est le défaut (valeurs de `:root` dans global.css, à garder synchronisées).
// Ajouter un nuancier = ajouter une entrée ici.

export const tokenRoles = {
  yellow: 'Bandeau, surbrillances',
  blue: 'Océan, ombres',
  red: 'Boutons, liens forts',
  green: 'Colombie, feuilles',
  pink: 'Décor 1',
  turquoise: 'Décor 2',
  ink: 'Texte, bordures',
  paper: 'Fond',
  white: 'Cartes',
  land: 'Terres',
  soldout: 'Épuisé',
} as const;

export type Token = keyof typeof tokenRoles;

export interface Theme {
  id: string;
  name: string;
  description: string;
  tokens: Record<Token, string>;
}

export const themes: Theme[] = [
  {
    id: 'casita-vive',
    name: 'Casita vive',
    description: 'Les mêmes teintes que l’étiquette, ravivées : moutarde, rouge cerise franc, vert feuille, corail et orange torréfié sur un crème lumineux.',
    tokens: {
      yellow: '#E8B630',
      blue: '#2B4A8B',
      red: '#B3242B',
      green: '#7FA046',
      pink: '#E0675A',
      turquoise: '#E08A3C',
      ink: '#2E1A16',
      paper: '#F6EFE6',
      white: '#FFFBF5',
      land: '#EBDDC8',
      soldout: '#A89F8E',
    },
  },
  {
    id: 'chiva',
    name: 'Chiva colombienne',
    description: 'L’ancienne charte : jaune, bleu et rouge du drapeau, avec le vert, le rose et le turquoise de l’art populaire.',
    tokens: {
      yellow: '#ffc800',
      blue: '#0033a0',
      red: '#e4002b',
      green: '#00a86b',
      pink: '#ff4f9a',
      turquoise: '#00b5c8',
      ink: '#0b1640',
      paper: '#fff8e6',
      white: '#ffffff',
      land: '#f4e9d0',
      soldout: '#8d93a8',
    },
  },
  {
    id: 'casita',
    name: 'Casita del Abuelo',
    description: 'Les tons de l’étiquette du paquet : papier kraft, brun café, rouge cerise et vert olive (voir specs/specs-colors.md).',
    tokens: {
      yellow: '#B9A268',
      blue: '#333A54',
      red: '#631B1C',
      green: '#7F7453',
      pink: '#9C5252',
      turquoise: '#976A56',
      ink: '#3F2522',
      paper: '#E5DDD5',
      white: '#F3EEE8',
      land: '#DBD2C9',
      soldout: '#AFA388',
    },
  },
];

export const defaultTheme = themes[0].id;

/** Blocs CSS `:root[data-theme="…"]` pour tous les thèmes sauf le défaut. */
export const themeCss = themes
  .filter((t) => t.id !== defaultTheme)
  .map((t) => `:root[data-theme="${t.id}"]{${Object.entries(t.tokens).map(([k, v]) => `--${k}:${v}`).join(';')}}`)
  .join('\n');

/** Couleur de la barre du navigateur (meta theme-color) par thème. */
export const themeColors = Object.fromEntries(themes.map((t) => [t.id, t.tokens.yellow]));
