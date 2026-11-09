# Nuancier — étiquette « Café La Casita del Abuelo »

> Source : `specs/package.png` (photo du paquet Honey 250 g). Couleurs extraites automatiquement (quantification median-cut + échantillonnage par zones : titre, toit, cerises, montagne, fond).
>
> ⚠️ La photo est sombre et tirée vers le chaud : les valeurs sont **mesurées**, pas corrigées. À recaler sur le fichier d'impression de l'étiquette si on l'obtient.

## Neutres — papier kraft / crème

| Token | Hex | Rôle suggéré | Présence |
|---|---|---|---|
| `--cream-50` | `#E5DDD5` | Fond principal (le plus clair du paquet) | ~5 % |
| `--cream-100` | `#DBD2C9` | Fond secondaire, cartes | ~8 % |
| `--cream-200` | `#CDC5B9` | Bordures douces, séparateurs | ~6 % |
| `--cream-300` | `#C5B9AA` | Fond de section alterné | ~8 % |
| `--sand-400` | `#AFA388` | Éléments décoratifs | ~5 % |

## Bruns — café / titre

| Token | Hex | Rôle suggéré | Présence |
|---|---|---|---|
| `--coffee-900` | `#371E15` | Texte très foncé, footer | ~6 % |
| `--coffee-800` | `#3F2522` | Texte principal, titre « La Casita del Abuelo » | — |
| `--coffee-700` | `#6B503C` | Texte secondaire | ~7 % |
| `--coffee-500` | `#9F836C` | Icônes, détails | ~7 % |
| `--coffee-400` | `#C1A691` | Accents clairs, survols | ~5 % |

## Rouges — cerises de café / toit

| Token | Hex | Rôle suggéré |
|---|---|---|
| `--cherry-800` | `#631B1C` | Couleur d'accent principale (CTA, liens) — cerises |
| `--cherry-700` | `#6D352C` | Accent foncé, survol de CTA |
| `--roof-500` | `#9C5252` | Toit de la maison — décoratif uniquement |
| `--terracotta-400` | `#976A56` | Décoratif (soleil, chemins) |

## Verts olive — montagne / caféiers

| Token | Hex | Rôle suggéré |
|---|---|---|
| `--olive-800` | `#473F29` | Montagne ombrée, texte sur fond clair possible |
| `--olive-700` | `#4F4728` | Végétation |
| `--olive-500` | `#7F7453` | Végétation claire, illustrations |

## Touches ponctuelles

| Token | Hex | Origine |
|---|---|---|
| `--gold-500` | `#A3954E` | Jaune (drapeau Colombie, soleil, médaille) |
| `--gold-400` | `#B9A268` | Dorure claire |
| `--indigo-700` | `#333A54` | Bleu du drapeau / colibri |

## Contrastes (WCAG 2.1)

| Texte | Fond | Ratio | Usage |
|---|---|---|---|
| `#3F2522` | `#E5DDD5` | 10,4 | ✅ Texte courant |
| `#631B1C` | `#E5DDD5` | 9,2 | ✅ Liens / CTA texte |
| `#E5DDD5` | `#631B1C` | 9,2 | ✅ Texte sur bouton |
| `#6D352C` | `#E5DDD5` | 7,1 | ✅ AAA |
| `#4F4728` | `#E5DDD5` | 6,9 | ✅ AA |
| `#9C5252` | `#E5DDD5` | 4,2 | ⚠️ Gros texte seulement (≥ 24 px) |
| `#976A56` | `#E5DDD5` | 3,5 | ❌ Décoratif uniquement |

## Tokens CSS

```css
:root {
  /* Neutres */
  --cream-50: #E5DDD5;
  --cream-100: #DBD2C9;
  --cream-200: #CDC5B9;
  --cream-300: #C5B9AA;
  --sand-400: #AFA388;

  /* Bruns */
  --coffee-900: #371E15;
  --coffee-800: #3F2522;
  --coffee-700: #6B503C;
  --coffee-500: #9F836C;
  --coffee-400: #C1A691;

  /* Rouges */
  --cherry-800: #631B1C;
  --cherry-700: #6D352C;
  --roof-500: #9C5252;
  --terracotta-400: #976A56;

  /* Verts */
  --olive-800: #473F29;
  --olive-700: #4F4728;
  --olive-500: #7F7453;

  /* Touches */
  --gold-500: #A3954E;
  --gold-400: #B9A268;
  --indigo-700: #333A54;
}
```
