# Référencement (SEO) — ce qui est en place et ce qu'il reste à faire

> Document de travail. La première partie décrit ce que le code fait déjà ; la suite liste des conseils, du plus rentable au plus ambitieux. État au 9 novembre 2026.

---

## 1. Déjà en place dans le code

| Élément | Rôle | Où le modifier |
|---|---|---|
| Titre et description par page et par langue | Ce qui s'affiche dans les résultats Google | `src/i18n/ui.ts` (clés `meta.*`) |
| URL canonique | Évite que Google voie des doublons (paramètres, ancres…) | `src/layouts/Layout.astro` |
| `hreflang` fr / en / es + `x-default` | Google montre la bonne langue à chacun ; `x-default` = page de choix de langue (accueil) ou version française | `src/layouts/Layout.astro` |
| Plan du site `sitemap.xml` | Liste des pages à indexer, avec leurs traductions | `src/pages/sitemap.xml.ts` (ajouter toute nouvelle page publique dans `pages`) |
| `robots.txt` | Autorise l'exploration et indique le sitemap | `src/pages/robots.txt.ts` |
| `noindex` sur le panier et `/coolors` | Pages sans intérêt dans les résultats | prop `noindex` de `Layout` |
| Partage réseaux sociaux (Open Graph, Twitter) | Titre, texte et image quand le lien est partagé (WhatsApp, Instagram, LinkedIn…) | `Layout.astro` ; image : prop `image` (défaut : portrait du couple de producteurs, 2400×1258) |
| Données structurées `Organization` + `WebSite` | Google identifie la marque, son logo et son Instagram | `siteJsonLd` dans `src/lib/jsonld.ts` |
| Données structurées `Product` / `Offer` | Prix, disponibilité et photo de chaque café, éligibles aux résultats enrichis | `productJsonLd` dans `src/lib/jsonld.ts` |
| Un seul `<h1>` par page, titres hiérarchisés, textes alternatifs sur les images | Compréhension du contenu, accessibilité | composants et pages |
| Images WebP avec `srcset`, dimensions et chargement différé ; vidéo chargée après la page | Vitesse (Core Web Vitals) | `public/images/`, `src/scripts/hero-video.ts` |

Le sitemap et le `lastmod` sont regénérés à chaque build (au moins une fois par jour grâce au rebuild quotidien de `deploy.yml`).

---

## 2. À faire tout de suite (hors code, gratuit)

1. **Google Search Console** : ajouter le site (propriété « préfixe d'URL » `https://nojann.github.io/carte-cafe/`), puis soumettre `https://nojann.github.io/carte-cafe/sitemap.xml`. Faire de même dans **Bing Webmaster Tools** (alimente aussi DuckDuckGo, Ecosia…).
2. **Profil d'établissement Google (Google Business Profile)** pour la torréfaction / le food truck à Lausanne : c'est ce qui fait apparaître la marque sur Google Maps et dans les recherches locales (« café de spécialité Lausanne »). Y mettre le lien du site.
3. **Liens entrants** : lien vers le site dans la bio Instagram, sur les pages des marchés et événements (Marché de Lausanne, Fête du café de Genève…), chez les partenaires et revendeurs. Quelques liens de sites locaux pèsent plus que beaucoup de liens quelconques.
4. **Tester** une page avec le [test des résultats enrichis](https://search.google.com/test/rich-results) et l'aperçu de partage (ex. [opengraph.xyz](https://www.opengraph.xyz/)).

---

## 3. Domaine propre (fortement conseillé)

Aujourd'hui le site vit sous `nojann.github.io/carte-cafe/`. Avec un domaine à soi (ex. `lacasita.ch`) :
- la marque est visible dans l'URL et l'autorité du site n'est pas partagée avec github.io ;
- le `robots.txt` est réellement lu (les robots ne le cherchent qu'à la racine du domaine — sous `/carte-cafe/` il est ignoré) ;
- les URL sont plus courtes.

Côté code : changer `site` (le domaine) et `base` (`'/'`) dans `astro.config.mjs`, ajouter un fichier `public/CNAME`, puis déclarer le domaine dans Search Console. Les anciennes URL github.io redirigent automatiquement si le domaine est configuré dans les réglages GitHub Pages.

---

## 4. Contenu (le levier principal)

- **Mots que les gens tapent** : « café de spécialité », « café colombien », « torréfaction artisanale Lausanne », « acheter café en grains Suisse »… Les placer naturellement dans les titres de page (`meta.title`), les descriptions et les intertitres. Le titre de l'accueil (« D'où viennent nos cafés ? ») est joli mais ne contient aucun de ces mots.
- **Descriptions** de 140 à 160 caractères, une par page, qui donnent envie de cliquer (le panier et le contact en ont une très courte).
- **Une page par café** (ex. `/fr/cafes/narino-honey/`) : aujourd'hui les cafés sont des ancres (`#narino-honey`) d'une même page, que Google n'indexe pas séparément. Une page dédiée par café (histoire, producteur, notes, prix) peut se positionner sur des recherches précises (« café honey Nariño »). Penser à l'ajouter au sitemap.
- **Pages manquantes** : mentions légales (le lien du pied de page pointe vers `#`), page 404 personnalisée (`src/pages/404.astro`), éventuellement une page « À propos » ou par région.
- **Contenu régulier** : un court article par nouvelle récolte, nouvel événement ou visite de producteur donne à Google des raisons de revenir et crée des pages sur des recherches de niche.
- **Avis clients** : seulement s'ils sont réels (les données structurées `AggregateRating` inventées sont sanctionnées).
- Retirer les mentions « exemple fictif » et les contenus factices avant de soumettre le site à Google.

---

## 5. Données structurées à ajouter quand les informations seront réelles

- `LocalBusiness` (ou `CafeOrCoffeeShop`) pour la torréfaction / le food truck : adresse, horaires, téléphone, coordonnées GPS.
- `Event` pour chaque événement (`src/content/lieux/` de type `evenement`) : nom, dates, lieu — peut apparaître dans les résultats « événements ».
- `BreadcrumbList` sur les pages secondaires (Accueil › Boutique).
- Dans les `Offer` : `shippingDetails` et `hasMerchantReturnPolicy` une fois la livraison définie (Google les demande pour les fiches marchandes).

---

## 6. Image de partage

L'image par défaut est le portrait du couple de producteurs (format paysage). Pour aller plus loin : une image dédiée de 1200×630 px avec le logo, en JPEG ou PNG (certains réseaux gèrent mal le WebP), passée via la prop `image` de `Layout` — par exemple une image par page ou par café.

---

## 7. Multilingue

- Garder les trois langues complètes et à jour (le build refuse déjà une fiche à moitié traduite).
- La page racine redirige selon la langue du navigateur ; les robots, eux, suivent les liens `hreflang` et la liste des langues de cette page : ne pas les supprimer.
- Si une langue est ajoutée (allemand, italien…), elle sera automatiquement incluse dans les `hreflang` et le sitemap via `src/i18n/ui.ts` — penser à compléter `ogLocales` dans `Layout.astro`.

---

## 8. Vérifications périodiques

- **Search Console**, une fois par mois : pages indexées / exclues, erreurs, requêtes qui amènent des visiteurs (à réutiliser dans les textes).
- **Lighthouse** (outils de développement de Chrome, onglet Lighthouse) ou [PageSpeed Insights](https://pagespeed.web.dev/) après chaque grosse modification : viser plus de 90 en Performance et SEO.
- Vérifier qu'une nouvelle page publique est bien ajoutée au sitemap (`src/pages/sitemap.xml.ts`) et qu'une page privée reçoit `noindex`.
