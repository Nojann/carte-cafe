# Carte des origines

Landing page statique (Astro) qui montre sur une carte du monde l'origine des cafés. Spécifications : `SPECS.md`.

## Lancer
    npm install
    npm run dev        # http://localhost:4321/fr/
    npm run build      # site statique dans dist/

## Ajouter un café
1. Copier un fichier de `src/content/cafes/` et le modifier (textes en fr / en / es).
2. Déposer la photo dans `public/images/cafes/` (même chemin que `photos[].src`).
3. Si le pays est nouveau, l'ajouter dans `src/lib/countries.ts`.

Le build échoue si un champ obligatoire ou une traduction manque.

## Où modifier quoi
- Nom de marque, boutique, contact : `src/site.config.ts`
- Textes de l'interface (3 langues) : `src/i18n/ui.ts`
- Couleurs et typographies : variables en haut de `src/styles/global.css`
- Nom de domaine : `site` dans `astro.config.mjs`

## Publier sur GitHub Pages
Le site est configuré pour `https://nojann.github.io/carte-cafe/` (`astro.config.mjs`).
1. Le dépôt doit s'appeler `carte-cafe` (sinon adapter `base`).
2. Pousser sur la branche `main` : `.github/workflows/deploy.yml` construit et publie le site.
3. Une seule fois : dépôt GitHub → Settings → Pages → Source : **GitHub Actions**.

Les chemins internes passent par `withBase()` (`src/lib/paths.ts`) : l'utiliser pour tout nouveau lien ou image.
