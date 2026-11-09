# Spécifications — Refonte de la carte « De la Colombie à la Suisse »

> Source : section **Carte** de `specs-6-nov.md`. Ce document remplace la section 1.2 « Interactions carte » de `SPECS.md` pour tout ce qui touche à la carte.

> **Révision du 9 novembre 2026** : plus d'icônes de caféier sur la carte (trop serrées), plus d'animation du cargo ni d'arc animé. À la place, le **trajet réel** du café est dessiné en fond : Buenaventura → canal de Panamá → Caraïbes → Atlantique → Rotterdam (mer), puis Rhin jusqu'à Bâle et route jusqu'à Lausanne. La loupe Suisse passe au-dessus de la Russie pour laisser l'Atlantique visible. Les sections ci-dessous sont à jour.

## 0. Résumé

La carte garde le monde entier en fond, mais elle ne raconte plus « des origines partout dans le monde ». Elle raconte **un seul trajet** : des plantations de **Colombie** (Cauca, Nariño, Antioquia) jusqu'à la **Suisse**, où le café est torréfié puis vendu depuis des **food trucks** sur les marchés.

| Sujet | Décision |
|---|---|
| Cadrage | Monde complet sobre + **deux loupes** (Colombie, Suisse) + **trajet réel** du café dessiné en fond |
| Interaction | Pas de pan/zoom libre. **Clic sur une région → zoom guidé + liste de ses cafés → fiche café** |
| Régions | **Vrais contours** des départements, noms en espagnol : **Cauca, Nariño, Antioquia** |
| Région ↔ cafés | Une région contient N cafés ; un café peut avoir plusieurs torréfactions |
| Animations | Aucune animation décorative ; seul le zoom guidé de la loupe Colombie est animé |
| Suisse | Icône **torréfaction** (Lausanne, arrivée de l'arc) + un **camion vert par lieu de vente**, cliquable |
| Mobile | **Loupes empilées** : mini-monde en bandeau, loupe Colombie, loupe Suisse |

---

## 1. Point de départ (existant)

| Fichier | Rôle actuel | Devenir |
|---|---|---|
| `src/lib/map.ts` (`buildMap`) | SVG généré au build, projection `geoEqualEarth`, `countries-110m`, pays producteurs colorés, écartement des marqueurs, arcs Bézier vers la torréfaction | Conservé pour le monde ; ajout de deux projections locales pour les loupes |
| `src/components/WorldMap.astro` | SVG + marqueurs HTML en %, cargo, point « Notre torréfaction · Lausanne », bouton « Vue monde » | Réécrit : monde + loupe Colombie + loupe Suisse |
| `src/scripts/explorer.ts` | Sélection, zoom CSS (`setView`), tracé + cargo (`playRoute`), fiches, hash, liste synchronisée | Étendu : états « région » et « lieu », zoom dans la loupe et non plus sur le monde |
| `src/lib/countries.ts` | 30+ pays producteurs | Réduit à `CO` (+ `CH` pour l'affichage) |
| `src/content/cafes/*.md` | 5 cafés d'exemple, dont 4 hors Colombie | Cafés hors Colombie supprimés, cafés colombiens rattachés à une région |
| `src/site.config.ts` (`roastery`) | Lausanne, point d'arrivée des arcs | Conservé |

**Ce qui disparaît** : la bande « Ceinture du café », la coloration de tous les pays producteurs, le zoom sur le planisphère, les marqueurs de cafés posés sur le monde.

---

## 2. Composition visuelle (desktop ≥ 1000 px)

```
┌──────────────────────────────────────────────────────────────┐
│   monde désaturé (--land pâle, pas de graticule marqué)       │
│                                      ╭───────────────╮        │
│                         · · · · · ·> │  SUISSE       │        │
│                  · · ·               │  ⚙ Lausanne   │        │
│             · ·                      │  🚚 🚚        │        │
│  ╭──────────────╮ ·                  ╰───────┬───────╯        │
│  │  COLOMBIE    │                            ╎ (rappel)       │
│  │   Antioquia  │      ■ CO           ■ CH ──┘                │
│  │ Cauca 🌱🌱   │──╌╌╌╌╌┘                                       │
│  │  Nariño 🌱   │                                               │
│  ╰──────────────╯        [légende : 🌱 plantation ⚙ torréfaction 🚚 food truck] │
└──────────────────────────────────────────────────────────────┘
```

- **Monde** : pays en `--land` atténué, contours fins ; seuls la Colombie (`--green`) et la Suisse (`--red`) sont remplis en couleur.
- **Loupe Colombie** : posée dans l'océan Pacifique, à gauche de l'Amérique du Sud. Environ 30 % de la largeur de la carte.
- **Loupe Suisse** : posée au-dessus de la Russie, à droite de l'Europe, pour laisser l'Atlantique (et la route maritime) visible. Environ 30 % de la largeur.
- **Cadres** au style du site : fond `--paper`, bordure `var(--border)`, `border-radius: var(--radius)`, ombre décalée `var(--shadow)` ; petit titre en capitales (« COLOMBIA », « SUISSE »).
- **Traits de rappel** : trait pointillé fin entre le vrai pays sur le monde et le coin le plus proche de la loupe.
- **Trajet du café** (`src/data/route.ts`) : voie maritime en tirets jaunes de Buenaventura à Rotterdam via le canal de Panamá, puis Rhin et route en pointillés jusqu'à la torréfaction. Ports de départ et d'arrivée marqués et nommés. Le trajet continue dans les deux loupes (en rouge) : sortie de Buenaventura dans la loupe Colombie, Bâle → Lausanne dans la loupe Suisse.
- **Légende** en bas à droite : trajet du café, torréfaction, food truck.

Les positions exactes des loupes sont des constantes (`INSET_CO`, `INSET_CH` : x, y, largeur en unités du viewBox), à régler visuellement.

---

## 3. Loupe Colombie

- **Fond** : contour de la Colombie (`world-atlas/countries-50m`), pays voisins en gris très clair pour situer.
- **Départements** : les 32 départements en trait léger ; **Cauca, Nariño, Antioquia** remplis (`--green`, plus foncé au survol, `--yellow` quand actifs).
- **Noms** : écrits comme en Colombie : `Antioquia`, `Cauca`, `Nariño` (avec ñ). Ils ne sont pas traduits.
- **Pas d'icône de caféier** sur la carte (elles étaient trop serrées) : les cafés se choisissent via leur région, puis dans la liste du panneau. Le port de Buenaventura est marqué.
- **États**

| État | Région |
|---|---|
| Repos | vert |
| Survol / focus (ou survol d'une carte de café de la région) | vert foncé + nombre de cafés sous le libellé |
| Active | jaune, autres régions atténuées |

---

## 4. Loupe Suisse

- **Fond** : contour de la Suisse (`countries-50m`), pays voisins en gris très clair. Le lac Léman est optionnel (repère utile pour Lausanne et Genève).
- **Torréfaction** : icône distincte (sac de café ou torréfacteur) à `site.roastery`, libellé « Notre torréfaction · Lausanne ». C'est le **point d'arrivée de l'arc**.
- **Food trucks** : un **camion vert** (`--green`, contour `--ink`) par lieu de vente, libellé court (« Marché de Lausanne »). Si deux lieux sont trop proches (Lausanne marché / torréfaction), on les écarte légèrement.
- Les camions sont cliquables (§ 5.3).

---

## 5. Interactions

Principe : **aucune capture de la molette ni du pincement**. La page défile normalement ; la carte ne bouge que sur un clic ou un tap.

### 5.1 Région colombienne
1. Survol ou focus → surbrillance + infobulle (nom + nombre de cafés).
2. Clic → **zoom dans la loupe Colombie** sur le département (transform CSS sur le groupe de la loupe, même durée que `--zoom-duration`), autres régions atténuées.
3. Le panneau latéral affiche **« Cafés du Cauca »** : description courte de la région (optionnelle) + liste des cafés (nom, producteur, notes, pastille « épuisé »).
4. Hash : `#region-cauca`.

### 5.2 Café
1. Clic sur un café dans la liste de la région (ou « Voir sur la carte » dans la liste sous la carte) → zoom sur sa région dans la loupe Colombie.
2. Puis ouverture de la **fiche café** existante (`CoffeeSheet.astro`), avec **l'histoire en premier** et la liste des torréfactions.
3. Précédent / suivant parcourt les cafés **de la même région**, puis passe à la région suivante.
4. Hash : `#colombie-cauca-xxx` (slug du café, comme aujourd'hui).

### 5.3 Lieu de vente (camion)
1. Clic sur un camion → **fiche lieu** dans le même panneau : nom, type (marché, événement…), adresse, jours et horaires, photo, bouton **« Itinéraire »** (lien Google Maps, nouvel onglet).
2. Hash : `#lieu-marche-lausanne`.

### 5.4 Retour
- Bouton **« Vue d'ensemble »** (remplace « Vue monde ») : dézoome la loupe et ferme le panneau.
- `Échap` : remonte d'un niveau (fiche café → liste de la région → vue d'ensemble).
- Le clic sur la région active la désélectionne.

### 5.5 Liste textuelle
La liste « Tous nos cafés » sous la carte reste, **groupée par région**, synchronisée au survol comme aujourd'hui. Elle sert aussi d'alternative accessible.

---

## 6. Animations

- Seul le **zoom guidé** de la loupe Colombie est animé (`--zoom-duration`).
- Plus de caféiers animés ni de cargo : le trajet est dessiné de façon statique.
- **`prefers-reduced-motion: reduce`** : zoom instantané.

---

## 7. Mobile (< 700 px)

Disposition **empilée**, chaque bloc en pleine largeur :

1. **Mini-monde** en bandeau (hauteur ~120 px) : Colombie et Suisse colorées, arc. Non interactif (`aria-hidden`), sert de repère.
2. **Loupe Colombie** : régions (cibles tactiles = le département entier).
3. **Loupe Suisse** : torréfaction et camions.
4. Panneau (liste de la région / fiche café / fiche lieu) **sous les loupes** ; après un tap, on défile jusqu'au panneau (comme `MOBILE_SHEET_DELAY_MS` aujourd'hui).

Sur mobile, le trajet reste visible dans le mini-monde (sans le nom des ports) ; après un choix, on défile jusqu'au panneau.

Entre 700 et 1000 px : composition desktop, panneau sous la carte.

---

## 8. Modèle de données

### 8.1 Régions — `src/content/regions/*.md` (nouvelle collection)
| Champ | Type | Obligatoire | Exemple |
|---|---|---|---|
| `slug` | string | oui | `cauca` |
| `nom` | string (non traduit) | oui | `Cauca` |
| `iso` | code ISO 3166-2 | oui | `CO-CAU` (Antioquia `CO-ANT`, Nariño `CO-NAR`) |
| `description` | texte FR/EN/ES | non | 2–3 phrases sur le terroir |
| `ordre` | number | non | ordre d'affichage |

Le point visé par le zoom (centroïde) et la position du libellé (contre le bord est du département) sont calculés au build à partir du contour : pas de coordonnées à saisir.

### 8.2 Café — modifications de `src/content/cafes/*.md`
- `pays` : limité à `CO`.
- **`localite`** (optionnel) : commune ou lieu-dit, affiché après la région (« Colombie · Cauca · Inzá »).
- **`region`** : référence vers une région (`reference('regions')`), obligatoire.
- `coordonnees` : doit tomber dans le département (vérifié au build avec `geoContains`, erreur sinon).
- **`torrefactions`** : liste, au moins 1. Chaque entrée : `niveau` (`claire` | `moyenne` | `foncee`), `usage` (`filtre` | `espresso` | `omni`), `lien` (FR/EN/ES), `prix` optionnel, `disponible`.
  - Le `lien`, le `prix` et `disponible` de premier niveau sont déplacés dans `torrefactions` ; le café est « épuisé » si toutes ses torréfactions le sont.

### 8.3 Lieux de vente — `src/content/lieux/*.md` (nouvelle collection)
| Champ | Type | Obligatoire |
|---|---|---|
| `slug` | string | oui |
| `nom` | texte FR/EN/ES | oui |
| `type` | `marche` \| `evenement` \| `emplacement` | oui |
| `adresse` | string | oui |
| `coordonnees` | `{ lat, lng }` | oui |
| `horaires` | texte FR/EN/ES | oui |
| `dates` | `{ debut, fin }` | si `type: evenement` (masqué une fois passé) |
| `lien_maps` | url | non (sinon généré depuis `coordonnees`) |
| `photo` | `{ src, alt FR/EN/ES }` | non |
| `exemple` | booléen | non (`true` = donnée fictive à remplacer) |

**Exemples à créer**
- `marche-lausanne` : Marché de Lausanne, place de la Riponne, 1005 Lausanne, `46.5235, 6.6326`, mercredi et samedi matin — **horaires à confirmer**.
- `fete-cafe-geneve` : « Fête du café de Plainpalais », plaine de Plainpalais, 1205 Genève, `46.1980, 6.1410` — **fictif** (`exemple: true`).

---

## 9. Données géographiques

- **Monde, Colombie, Suisse** : `world-atlas/countries-110m` pour le monde, **`countries-50m`** pour les contours dans les loupes (déjà installé).
- **Départements colombiens** : fichier GeoJSON **versionné dans le repo**, `src/data/colombia-departamentos.geo.json`.
  - Source : Natural Earth *Admin 1 – States, Provinces* (domaine public), filtré sur la Colombie.
  - Simplifié avec mapshaper (≈ 8 %), propriétés réduites à `iso` (ISO 3166-2) et `nombre`, **< 30 Ko**.
  - Procédure de régénération décrite dans le `README.md`.
- **Projections des loupes** : `geoMercator().fitExtent()` sur l'emprise de chaque pays (avec une marge), calculées au build dans `buildMap` ; le navigateur reçoit un SVG prêt, sans bibliothèque de cartographie (même principe qu'aujourd'hui).

---

## 10. Accessibilité

- Régions et camions sont des **liens focusables** (`<a href="#…">`) avec `aria-label` (« Cauca, 2 cafés », « Marché de Lausanne, food truck »).
- Ordre de tabulation : régions (nord → sud) → cafés de la région active → torréfaction → camions.
- Le panneau garde le comportement actuel (titre focalisé à l'ouverture, `Échap`).
- Contraste AA pour tous les libellés posés sur la carte (fond `--paper` derrière le texte si besoin).
- Les animations décoratives sont `aria-hidden`.

## 11. Performance

- SVG total (monde + 2 loupes + départements) **< 150 Ko** (non compressé).
- Icônes (caféier pour les listes, camion, torréfaction) définies une fois en `<symbol>` et réutilisées avec `<use>`.
- Aucune dépendance JS supplémentaire côté navigateur.

## 12. Traductions (`src/i18n/ui.ts`)

Nouvelles clés (FR / EN / ES) : `map.label` mis à jour, `map.overview` (« Vue d'ensemble »), `map.legend.route` (« Trajet du café »), `map.legend.roastery`, `map.legend.truck`, `map.region.cafes` (« Cafés du {region} »), `map.region.count` (« {n} cafés »), `place.type.marche|evenement|emplacement`, `place.hours`, `place.directions` (« Itinéraire »), `sheet.roasts` (« Torréfactions »). Clés supprimées : `map.belt`, `map.world`. `map.count` devient « {n} cafés, {r} régions ».

## 13. Hors périmètre

- Fiche Suisse complète au-delà de la fiche lieu (section « Fiche café » de `specs-6-nov.md`).
- Animation de l'histoire dans la fiche café.
- Colibri interactif, nuancier de l'étiquette, section « Démarche ».

---

## 14. Critères d'acceptation

- [ ] Le monde entier est visible ; seules la Colombie et la Suisse sont en couleur.
- [ ] Deux loupes lisibles sans interaction, reliées à leur pays par un trait de rappel.
- [ ] Cauca, Nariño et Antioquia ont leurs vrais contours et sont nommés avec cette orthographe (ñ inclus).
- [ ] Un clic sur une région zoome dans la loupe et liste ses cafés ; un clic sur un café zoome sur sa région et ouvre sa fiche.
- [ ] Un café peut afficher plusieurs torréfactions, chacune avec son lien d'achat.
- [ ] Le trajet réel Buenaventura → Panamá → Rotterdam → Rhin → Lausanne est visible en fond, et dans les loupes.
- [ ] La torréfaction de Lausanne et au moins deux camions verts (Lausanne, Genève) sont visibles ; un clic ouvre une fiche lieu avec un lien Google Maps.
- [ ] La molette et le pincement font défiler la page, jamais la carte.
- [ ] Mobile 360 px : mini-monde, loupe Colombie et loupe Suisse empilées, toutes les cibles ≥ 44 px.
- [ ] Liens profonds `#region-…`, `#<slug-café>`, `#lieu-…` fonctionnels dans les 3 langues.
- [ ] Le build échoue si un café n'a pas de région, si ses coordonnées sortent du département, ou si une traduction manque.
- [ ] SVG < 150 Ko ; Lighthouse mobile ≥ 90.

## 15. Questions ouvertes

1. Position exacte des loupes (à caler sur maquette).
2. Liste réelle des cafés par région et leurs torréfactions.
3. Jours et horaires réels du marché de Lausanne ; autres lieux de vente.
4. Photos des lieux et des régions.
5. Faut-il afficher les événements passés (grisés) ou les masquer ?

---

## 16. Update

**9 novembre 2026** — Analyse UX/UI et marketing de la carte : voir [`specs-update-carte.md`](specs-update-carte.md).

Priorités avant mise en ligne (P1) :
- Compteur de cafés par région visible sans survol (mobile) ; consigne d'usage au-dessus de la carte en mobile ; affordance des régions cliquables.
- Légende alignée sur les vraies couleurs et styles du trajet (mer / terre).
- Suivi analytique sans cookie (`region_open`, `cafe_open`, `buy_click`, `directions_click`).
- Meta description, `og:image` et JSON-LD alignés sur « De la Colombie à la Suisse ».
- Producteurs incarnés (photo, prénom, citation) et prochaine date de passage du camion.
