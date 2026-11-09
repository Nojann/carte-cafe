# Carte des origines

Landing page statique (Astro) qui raconte le trajet de nos cafés, des plantations de Colombie (Cauca, Nariño, Antioquia) jusqu'à nos food trucks en Suisse. Spécifications : `SPECS.md`, et `specs/specs-carte.md` pour la carte.

## Lancer
    npm install
    npm run dev        # http://localhost:4321/fr/
    npm run build      # site statique dans dist/

## Ajouter un café
1. Copier un fichier de `src/content/cafes/` et le modifier (textes en fr / en / es).
2. `region` : le slug d'une région de `src/content/regions/` (ex. `cauca`). Les `coordonnees` doivent tomber dans ce département.
3. `torrefactions` : une entrée par torréfaction proposée (niveau, usage, lien, prix, disponibilité).
4. Déposer la photo dans `public/images/` (même chemin que `photos[].src`).

Le build échoue si un champ obligatoire ou une traduction manque, si la région n'existe pas ou si le café tombe hors de son département.

## Ajouter une région de Colombie
Créer un fichier dans `src/content/regions/` avec le nom officiel (`nom`, écrit comme en Colombie) et le code ISO 3166-2 du département (`iso`, ex. `CO-HUI` pour le Huila). Son contour est pris dans `src/data/colombia-departamentos.geo.json`.

## Ajouter un lieu de vente (food truck)
Copier un fichier de `src/content/lieux/`. Type `marche`, `evenement` (avec `dates` : il disparaît de la carte une fois passé, au build suivant) ou `emplacement`. `exemple: true` affiche la mention « Exemple fictif ».

## Contours des départements colombiens
`src/data/colombia-departamentos.geo.json` vient de Natural Earth *Admin 1 – States, Provinces* (10m, domaine public), filtré sur la Colombie et simplifié. Pour le régénérer :

    curl -LO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
    # garder adm0_a3 == "COL", propriétés réduites à { nombre: name, iso: iso_3166_2 } → co.geojson
    npx mapshaper co.geojson -filter "!!nombre && iso != 'CO-SAP'" -simplify 8% keep-shapes \
      -filter-islands min-area=20km2 -o precision=0.001 format=geojson co-simple.geojson

Les anneaux doivent être dans le sens attendu par d3-geo (sens horaire) : si chaque département couvre « toute la Terre » (`geoArea` ≈ 12,57), inverser l'ordre des points de chaque anneau.

## Où modifier quoi
- Nom de marque, Instagram, ville de la torréfaction : `src/site.config.ts`
- E-mail et téléphone de contact : variables `CONTACT_EMAIL` et `PHONE_NUMBER` (`docs/configuration-github.md`)
- Position et taille des loupes Colombie / Suisse : `INSETS` dans `src/lib/map.ts`
- Trajet du café (ports, points de passage maritimes, Rhin) : `src/data/route.ts`
- Textes de l'interface (3 langues) : `src/i18n/ui.ts`
- Couleurs et typographies : variables en haut de `src/styles/global.css`
- Nom de domaine : `site` dans `astro.config.mjs`

## Coordonnées de contact (anti-spam)
L'e-mail et le téléphone ne sont écrits ni dans le dépôt ni en clair dans le HTML. Ils viennent des variables `CONTACT_EMAIL` et `PHONE_NUMBER` : dans `.env` en local (copier `.env.example`), et dans des secrets GitHub en production. Ils ne sont décodés qu'au clic sur « Afficher l'e-mail » / « Afficher le numéro ».
Mise en place pas à pas : **`docs/configuration-github.md`**.

Le contact apparaît sur l'accueil (section entre « Tous nos cafés » et « Notre démarche », `src/components/Contact.astro`), sur la page `/[lang]/contact/` et dans le panier (« Commander par e-mail », panier recopié dans le message).

## Publier sur GitHub Pages
Le site est configuré pour `https://nojann.github.io/carte-cafe/` (`astro.config.mjs`).
1. Le dépôt doit s'appeler `carte-cafe` (sinon adapter `base`).
2. Pousser sur la branche `main` : `.github/workflows/deploy.yml` construit et publie le site.
3. Une seule fois : dépôt GitHub → Settings → Pages → Source : **GitHub Actions**.
4. Une seule fois : ajouter les secrets `CONTACT_EMAIL` et `PHONE_NUMBER` (`docs/configuration-github.md`).

Les chemins internes passent par `withBase()` (`src/lib/paths.ts`) : l'utiliser pour tout nouveau lien ou image.
