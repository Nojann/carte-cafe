# Update — Analyse UX/UI et marketing de la carte (explorer-map)

> **Date** : 9 novembre 2026. Analyse faite sur le code actuel de la carte : `src/components/WorldMap.astro`, `src/scripts/explorer.ts`, `src/components/{Region,Coffee,Place}Sheet.astro`, `src/styles/global.css` (§ Explorateur), `src/i18n/ui.ts`, `src/lib/cafes.ts`, `src/layouts/Layout.astro`, `src/pages/[lang]/index.astro`.
>
> Complète `specs-carte.md` (section 16 « Update »). Priorités : **P1** = avant mise en ligne, **P2** = itération suivante, **P3** = idée.

## 1. Synthèse

**Points forts**
- Narration claire : un seul trajet, de la Colombie à la Suisse.
- Charte « chiva » forte et cohérente (couleurs du drapeau, bordures, ombres décalées).
- Aucune bibliothèque de cartographie côté navigateur : SVG généré au build.
- Liens profonds (`#region-…`, `#<café>`, `#lieu-…`), `Échap` hiérarchique, `prefers-reduced-motion` respecté.
- Liste textuelle « Tous nos cafés » comme alternative accessible.
- UTM par café et par torréfaction sur les liens d'achat.

**Faiblesses principales**
- La carte n'indique pas assez **quoi faire** : seules 3 régions sont cliquables, les compteurs sont cachés jusqu'au survol, et rien ne remplace le survol sur mobile.
- La **Suisse est sous-exploitée** : torréfaction non interactive, pas de « prochaine date » pour le camion.
- **Aucun suivi analytique** du parcours carte → achat.
- **SEO et partage** encore calés sur l'ancien concept « carte du monde ».

---

## 2. UX — parcours et interactions

> **Statut (9 novembre 2026)** : U1 à U10 implémentés. U9 = masquage côté client (`data-ends`) + rebuild CI quotidien. U10 = repli photo café → photo de région → drapeau, avec avertissement au build ; les vraies photos producteurs restent à fournir (M3). **U1 révisé** : les étiquettes de région ne sont plus affichées au repos ; le nom apparaît au survol / focus (et reste affiché sur la région sélectionnée) ; le nombre de cafés n'est plus sur la carte (il reste dans l'`aria-label` et la fiche région).

| # | Constat | Réf. | Recommandation | Prio |
|---|---|---|---|---|
| U1 | Le nombre de cafés sous le libellé de région n'apparaît qu'au survol/focus → invisible sur mobile (pas de survol) | `global.css` `.region-label span` (opacity 0) | Afficher le compteur en permanence, au moins sous 1000 px | P1 |
| U2 | Affordance faible : rien n'indique au repos que les régions sont cliquables (pas de curseur sur tactile) | `WorldMap.astro`, loupe Colombie | Pastille « Touchez une région » dans la loupe, ou léger pulse unique au premier affichage (désactivé si reduced-motion) | P1 |
| U3 | La consigne `map.hint` est à droite en desktop mais **sous la carte** en < 1000 px : l'utilisateur mobile la voit après la carte | `index.astro` `.explorer__hint` | Ajouter une consigne courte au-dessus de la carte en mobile | P1 |
| U4 | Torréfaction : `<span>` non focusable, libellé seulement au survol souris → contredit § 10 de `specs-carte.md` (ordre de tabulation incluant la torréfaction) | `WorldMap.astro` `.pin--roastery` | En faire un lien vers une mini-fiche « Notre torréfaction », ou au minimum focusable avec libellé visible | P2 |
| U5 | Fiche lieu sans précédent / suivant (contrairement à la fiche café) | `PlaceSheet.astro` | Ajouter précédent / suivant entre lieux, comme `CoffeeSheet` | P3 |
| U6 | Mobile : défilement automatique vers le panneau après ≈ 1,25 s ; aucun moyen rapide de remonter à la carte en bas de fiche | `explorer.ts` `MOBILE_SHEET_DELAY_MS` | Bouton « Revenir à la carte » collant en bas de fiche (mobile) ; réduire le délai à ≈ `ZOOM_MS` | P2 |
| U7 | Clic dans la liste « Tous nos cafés » en desktop : remonte à la carte, l'utilisateur perd sa position dans la liste | `explorer.ts` (`data-show`) | Acceptable ; à la fermeture, revenir à la carte de café d'origine | P3 |
| U8 | `aria-live="polite"` sur tout le panneau : un lecteur d'écran relit toute la fiche à chaque changement, alors que le focus va déjà au titre | `index.astro` `.explorer__panel` | Retirer `aria-live` du panneau ou le limiter à une courte zone d'annonce | P2 |
| U9 | Les événements passés sont retirés **au build** : sans rebuild, un événement terminé reste affiché | `cafes.ts` `getData` (filtre `dates.fin`) | Rebuild planifié (CI cron quotidien) ou masquage côté client | P2 |
| U10 | Fiches café : la photo est souvent remplacée par le drapeau (placeholder) | `CoffeeSheet.astro` | Prioriser de vraies photos producteurs (voir M3) | P2 |

---

## 3. UI — lisibilité et cohérence visuelle

> **Statut (9 novembre 2026)** : I1 à I8 implémentés. Trajet en jaune + liseré encre partout (monde, loupes, légende) ; une seule entrée de légende pour le trajet (tirets mer + pointillés terre) ; loupe Suisse laissée en beige et bleu (I3 annulé) ; région active jaune à contour épais ; textes ≥ 0,75 rem (0,85 rem en mobile) ; icône « recentrer » ; noms des camions visibles en tactile/mobile, à côté de l'icône ; ombre des loupes à 3 px.

| # | Constat | Réf. | Recommandation | Prio |
|---|---|---|---|---|
| I1 | **Légende incohérente** : trait du trajet en `--ink` dans la légende, mais jaune sur le monde et rouge dans les loupes ; mer (tirets) et terre (pointillés) non distingués | `global.css` `.legend__line path` | Légende aux couleurs réelles, avec deux entrées mer / terre | P1 |
| I2 | Deux couleurs pour un même trajet (jaune sur le monde, rouge dans les loupes) | `.inset .route` | Une seule couleur partout (jaune + liseré `--ink`) | P2 |
| I3 | Suisse en `--red` sur le monde, mais `--land` dans sa loupe → rupture de repère | `.map__country.is-ch` / `.inset__country` | Teinter légèrement la loupe Suisse ou lui donner une bordure rouge | P3 |
| I4 | Région active en jaune sur départements beiges : contraste faible avec `--land` ; régions inactives atténuées à 45 % | `.region.is-active path`, `.has-region` | Contour `--ink` épais (ou hachures) pour l'actif ; ne pas atténuer les libellés | P2 |
| I5 | Textes très petits (0,66–0,8 rem titres de loupe, 0,68 rem port, 0,75 rem légende) → lisibilité limite sur 360 px | `.inset__title`, `.port-label`, `.map__legend` | Plancher à 0,75 rem, 0,85 rem en mobile | P2 |
| I6 | Bouton « Vue d'ensemble » en haut à gauche (≥ 700 px) avec icône globe, alors que le concept n'est plus « monde » | `.map__overview` | Icône « recentrer » ; position à valider sur maquette | P3 |
| I7 | Pins camion : nom du lieu seulement au survol ; illisible sur mobile sans tap | `.pin__label` | Afficher le nom en permanence sur mobile (peu de lieux) | P2 |
| I8 | Ombres décalées multiples (carte 10 px, fiche 8 px, loupes 5 px) : forte identité mais charge visuelle élevée | `.map`, `.sheet`, `.inset` | Garder ; réduire l'ombre des loupes à 3 px pour hiérarchiser | P3 |

---

## 4. Marketing

> **Statut (9 novembre 2026)** : M5 implémenté. Chaque ligne de la fiche région affiche le prix de la torréfaction disponible la moins chère (« dès … » si les prix diffèrent) et un bouton Acheter (lien UTM, attribut `data-buy`) ; un café épuisé affiche le badge « Épuisé ».

| # | Constat | Recommandation | Prio |
|---|---|---|---|
| M1 | **Aucun suivi** : seulement des UTM sur les liens d'achat ; pas de mesure des clics région / café / lieu / itinéraire, ni du taux carte → achat | Analytics respectueux sans cookie (Plausible, Umami) + événements `region_open`, `cafe_open`, `buy_click`, `directions_click` ; l'attribut `data-buy` existe déjà comme crochet | P1 |
| M2 | SEO et partage désalignés : `meta.description` parle encore de « carte du monde… pays » ; pas d'`og:image` ; JSON-LD `ItemList` sans `image`, rien pour les lieux | Réécrire la meta (« De la Colombie à la Suisse… food truck Lausanne ») ; `og:image` 1200×630 de la carte ; JSON-LD `FoodEstablishment` / `Event` pour les lieux | P1 |
| M3 | La promesse « des gens qui la font vivre » n'est pas incarnée : pas de visage, de prénom de producteur, de photo réelle ; textes encore marqués EXEMPLE | Portrait + citation du producteur dans chaque fiche café ; photo de région dans `RegionSheet` | P1 (contenu) |
| M4 | Le camion est le canal de vente physique principal, mais la carte ne dit pas **quand** le trouver | Badge « Prochain passage : samedi 14 nov. » sur le pin et en tête de fiche lieu ; lien « Ajouter au calendrier » (.ics) | P1 |
| M5 | La fiche région ne propose aucun achat direct : 2 clics (région → café) avant de voir un prix | Prix « dès X CHF » et bouton Acheter sur chaque ligne de `RegionSheet` | P2 |
| M6 | Pas de capture de contacts (où sera le camion, nouvelle récolte) | Encart newsletter en bas de la fiche lieu et après la liste des cafés | P2 |
| M7 | Pas de preuve sociale (déjà noté dans `next-steps.md`) | Bandeau « Ils nous ont fait confiance » / marchés sous la carte | P3 |
| M8 | Le trajet (≈ 10 000 km, Panamá, Rhin) est un argument de transparence non exploité en texte | Encart « Le voyage de votre café » : étapes, durée, modes de transport, bilan CO₂ si disponible | P2 |
| M9 | La distance « à vol d'oiseau » de la fiche café parle moins que le trajet réel dessiné | Remplacer par la longueur du trajet réel (`src/data/route.ts`) | P3 |
| M10 | Café épuisé = bouton « Voir sur la boutique » : impasse commerciale | « Me prévenir au retour » ou suggestion d'un autre café de la même région | P3 |

---

## 5. Priorités

- **Avant mise en ligne (P1)** : U1, U2, U3, I1, M1, M2, M3, M4.
- **Itération suivante (P2)** : U4, U6, U8, U9, U10, I2, I4, I5, I7, M5, M6, M8.
- **Idées (P3)** : U5, U7, I3, I6, I8, M7, M9, M10.

## 6. Critères d'acceptation ajoutés

- [ ] Sur mobile 360 px, le nombre de cafés par région et le nom des lieux sont lisibles sans interaction.
- [ ] La légende reproduit exactement les couleurs et styles de trait de la carte.
- [ ] Les événements `region_open`, `cafe_open`, `buy_click`, `directions_click` sont mesurés.
- [ ] Le partage du lien affiche une image et une description alignées sur « De la Colombie à la Suisse ».
- [ ] Chaque lieu affiche sa prochaine date de présence.
