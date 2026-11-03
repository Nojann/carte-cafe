# Spécifications — Landing page « Carte des origines du café »

## Contexte
Robin vend des cafés et veut une landing page interactive montrant, sur une carte du monde, l'origine de chaque café. Objectif : raconter la provenance (traçabilité, producteurs, terroirs), renforcer la confiance et renvoyer vers l'achat. Projet vierge (`/home/robin/Dev/carte-cafe` vide).

Décisions déjà prises :
- Site **statique autonome**, données éditées à la main (fichiers)
- Carte **2D vectorielle stylisée** (SVG), marqueurs cliquables
- **< 15 cafés**, **fiche riche** par café
- **Trilingue FR + EN + ES**

---

## 1. Specs fonctionnelles

### 1.1 Structure de la page
1. **Hero** : accroche + sous-titre + CTA « Explorer la carte » (scroll vers la carte).
2. **Carte interactive** (cœur de la page) : monde stylisé, pays producteurs mis en valeur, un marqueur par café (ou par région si plusieurs cafés).
3. **Fiche café** (panneau latéral desktop / bottom sheet mobile) à l'ouverture d'un marqueur.
4. **Liste / carrousel des cafés** synchronisée avec la carte (survol liste ↔ surbrillance marqueur) — sert aussi d'alternative accessible.
5. **Section « Notre démarche »** (sourcing, relation producteurs) — courte.
6. **Footer** : liens boutique, réseaux, mentions légales, sélecteur de langue.

### 1.2 Interactions carte
- Survol marqueur → infobulle (nom du café + pays).
- Clic → zoom/pan animé vers la région + ouverture de la fiche.
- Navigation précédent/suivant entre cafés depuis la fiche.
- Bouton « vue monde » pour dézoomer.
- Tracé animé origine → torréfaction (Lausanne, configurable dans `src/site.config.ts`) : vue monde, arc pointillé + cargo qui le parcourt, puis zoom sur l'origine. Distance « à vol d'oiseau » affichée dans la fiche.
- Gestion des marqueurs proches (ex. 2 cafés éthiopiens) : regroupement ou léger décalage.
- URL partageable par café (`/fr/#ethiopie-guji` ou `?cafe=…`) qui ouvre directement la fiche.
- Mobile : pinch-zoom désactivé ou maîtrisé, tap = ouverture fiche.

### 1.3 Contenu d'une fiche café (modèle de données)
| Champ | Type | Obligatoire |
|---|---|---|
| `id` / slug | string | oui |
| `nom` (FR/EN/ES) | string | oui |
| `pays`, `région` | string | oui |
| `coordonnées` (lat, lng) | number | oui |
| `producteur` / ferme / coopérative | string | non |
| `altitude` (m) | number ou plage | non |
| `variétés` | string[] | non |
| `process` (lavé, nature, honey…) | enum | non |
| `récolte` (saison/année) | string | non |
| `notes de dégustation` (FR/EN/ES) | string[] | oui |
| `profil` (acidité, corps, douceur 1–5) | numbers | non |
| `histoire` (FR/EN/ES) | texte court Markdown | non |
| `photo(s)` + texte alternatif | image | oui (1 min.) |
| `lien produit` (FR/EN/ES) + prix indicatif | url | oui |
| `disponible` | booléen | oui |

Format : un fichier par café (Markdown + frontmatter, ou JSON) dans `content/cafes/`, validé par un schéma au build (erreur si champ obligatoire manquant).

### 1.4 Internationalisation (FR / EN / ES)
- Routes `/fr/`, `/en/` et `/es/`, détection langue navigateur à la racine (repli : FR), sélecteur manuel.
- Tous les textes UI + champs traduisibles des fiches dans les trois langues (le build échoue si une traduction manque).
- Noms de pays localisés.
- `hreflang` pour le SEO.

### 1.5 Conversion
- CTA « Acheter ce café » dans chaque fiche → lien boutique (UTM pour suivre la provenance du clic).
- Mention « épuisé » si `disponible: false` (le marqueur reste visible, grisé).

---

## 2. Specs non fonctionnelles

- **Performance** : Lighthouse ≥ 90 mobile ; carte SVG < 150 Ko ; images en AVIF/WebP responsive, lazy-load.
- **Responsive** : mobile-first ; breakpoints mobile / tablette / desktop.
- **Accessibilité (WCAG 2.1 AA)** : marqueurs focusables au clavier, ordre de tab logique, `aria-label`, fiche gérée comme dialog (focus trap, Échap), contrastes, `prefers-reduced-motion` (désactive les animations de zoom), liste textuelle alternative à la carte.
- **SEO** : contenu des fiches rendu en HTML statique (pas seulement en JS), balises meta/OG par langue, données structurées `Product`, sitemap.
- **Navigateurs** : 2 dernières versions des navigateurs majeurs, Safari iOS.
- **Analytics** (respectueux RGPD, sans cookie : Plausible/Umami) : ouverture de fiches, clics CTA.
- **Légal** : mentions légales, pas de bannière cookies si analytics sans cookie.

---

## 3. Specs techniques (proposition)

- **Framework** : **Astro** (statique, i18n natif, content collections avec schéma Zod, îlots JS seulement pour la carte).
- **Carte** : **D3-geo** (projection Natural Earth / Equal Earth) + TopoJSON `world-atlas` 110m, rendu SVG, zoom via `d3-zoom`. Pas de tuiles ni de clé API.
- **Style** : CSS (variables de marque) ou Tailwind.
- **Hébergement** : Netlify / Vercel / Cloudflare Pages (gratuit), déploiement à chaque push Git.
- **Structure** :
  ```
  src/content/cafes/*.md        # une fiche par café (FR+EN+ES dans le frontmatter)
  src/content/config.ts         # schéma Zod
  src/components/WorldMap.*     # îlot interactif D3
  src/components/CoffeeSheet.*  # fiche
  src/i18n/{fr,en,es}.json         # textes UI
  src/pages/[lang]/index.astro
  public/images/cafes/
  ```

---

## 4. Specs design à fournir / décider (par toi)
- Charte : logo, couleurs, typographies, ton éditorial.
- Style de carte : couleurs océan/terres, pays producteurs teintés, éventuellement « ceinture du café » (entre les tropiques) mise en évidence.
- Forme des marqueurs (grain de café ? pastille ?).
- Photos des cafés/producteurs (droits d'utilisation !).
- Maquette (Figma ou wireframe) — sinon je peux proposer un premier design.

## 5. Questions encore ouvertes
- URL de la boutique et format des liens produits.
- Nom de domaine / hébergement préféré.
- Textes d'accroche et section démarche : fournis par toi ou rédigés par moi ?
- Faut-il afficher prix/stock (risque de désynchronisation avec la boutique, puisque données manuelles) ?

---

## 6. Plan de livraison
1. Init projet Astro + i18n + schéma de contenu + 2–3 fiches d'exemple.
2. Composant carte (projection, pays producteurs, marqueurs, zoom).
3. Fiche café + liste synchronisée + URL profondes.
4. Hero, démarche, footer, sélecteur langue.
5. Accessibilité, perf, SEO, analytics.
6. Déploiement.

## 7. Vérification
- `npm run build` sans erreur de schéma ; `npm run dev` et parcours manuel FR/EN/ES.
- Test clavier complet (Tab/Entrée/Échap) et lecteur d'écran sur la carte.
- Lighthouse mobile (perf, a11y, SEO ≥ 90).
- Test sur mobile réel (iOS Safari, Android Chrome).
- Ouvrir une URL profonde d'un café → fiche ouverte directement.
