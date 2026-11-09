# Spécifications — mise à jour du 6 novembre 2026

Complète `specs/SPECS.md`. Décisions prises après relecture de la landing page (voir `docs/landing-page.md`).

## Décisions

| Sujet | Décision | Impact |
|---|---|---|
| Prix | **CHF uniquement** | Passer `prix.devise` à `CHF` dans toutes les fiches ; montants à saisir en CHF. |
| Disponibilité | **Mise à jour à la main** | Champ `disponible` dans chaque fiche, puis republication. Pas de synchro avec la boutique. |
| Langues | **FR / EN / ES** suffisent | Pas de changement. |
| Animation du trajet | **Gardée telle quelle** | Tracé + cargo + zoom à chaque clic (~2 s). |
| Textes éditoriaux | **Fournis par Robin** | Accroche, « Notre démarche », histoires des cafés : rédigés par Robin ; intégration et traductions côté dev. |
| Charte graphique | **Aligner sur la marque** | Remplacer la charte « chiva colombienne » par l'identité de la marque. |
| Éléments de marque fournis | **Logo, couleurs, site de référence** | Pas de typographie imposée : en proposer une cohérente avec le site de référence. |
| Photos | **Photos propres** (visites / producteurs, droits OK) | À déposer dans `public/images/cafes/`. Le drapeau reste en repli tant qu'une photo manque. |
| Mentions légales | **Page dédiée** sur le site | Nouvelle page trilingue (`/fr/mentions-legales`, etc.), texte fourni par Robin ; lien du footer à corriger (actuellement `#`). |

## Reporté à plus tard

- **Mesure d'audience** (Plausible / Umami, sans cookie) : non mise en place. En attendant, seuls les liens UTM vers la boutique permettent de mesurer les clics.
- **Nom de domaine** : on reste sur GitHub Pages (`nojann.github.io/carte-cafe`) pour l'instant.

## Éléments attendus de Robin

- [x] Logo (SVG ou PNG HD) -> /public/images/logo.png
- [ ] Codes couleur de la marque
- [x] URL du site de référence (boutique) -> www.cafelacasitadelabuelo.com
- [ ] Liste réelle des cafés + fiches (FR/EN/ES), prix en CHF, liens boutique
- [x] Photos des cafés -> public/images
- [ ] Textes : accroche, « Notre démarche », histoires
- [ ] Texte des mentions légales
- [ ] Adresse de contact et compte Instagram réels

## Travaux de développement découlant de ces décisions

1. Nouvelle charte : variables CSS (`src/styles/global.css`), logo dans l'en-tête et le footer, typographie.
2. Page « Mentions légales » trilingue + lien footer.
3. Fiches d'exemple en CHF (en attendant les vraies données).
4. Retirer la mention « Données présentées à titre d'exemple » une fois les vraies données en place.
