# Déploiement sur Cloudflare Pages — alternative à GitHub Pages

> Publier le site gratuitement sur Cloudflare Pages, sans GitHub Actions (utile si les Actions sont bloquées, par exemple compte GitHub verrouillé pour un problème de facturation).
> État au 9 novembre 2026.

---

## 1. Principe

Par défaut, le site est construit pour GitHub Pages, dans un sous-dossier : `https://nojann.github.io/carte-cafe/`.
Sur Cloudflare Pages, il est servi **à la racine** d'un domaine : `https://carte-cafe.pages.dev/`.

Deux variables d'environnement, lues par `astro.config.mjs` **au moment du build**, règlent cette différence :

| Variable | Rôle | GitHub Pages (défaut) | Cloudflare Pages |
|---|---|---|---|
| `SITE_URL` | domaine public (URL canoniques, hreflang, sitemap) | `https://nojann.github.io` | `https://carte-cafe.pages.dev` |
| `BASE_PATH` | sous-chemin du site | `/carte-cafe` | `/` |

⚠️ **Sans `BASE_PATH=/`, la page reste vide sur Cloudflare** : l'accueil redirige vers `/carte-cafe/fr/`, qui n'existe pas à la racine du domaine.

Les coordonnées de contact restent fournies par `CONTACT_EMAIL` et `PHONE_NUMBER` (voir `docs/configuration-github.md`, § 1 et § 3 pour le format).

Cloudflare Pages gratuit : bande passante illimitée, 500 builds par mois.

---

## 2. Méthode A — connexion au dépôt GitHub (recommandée)

Cloudflare récupère le code via sa propre application GitHub et construit le site **sur ses serveurs** : GitHub Actions n'est pas utilisé.

### Mise en place (une seule fois)

1. Se connecter sur https://dash.cloudflare.com (compte gratuit).
2. **Workers & Pages** → **Create** → onglet **Pages** → **Connect to Git**.
3. Autoriser l'application Cloudflare sur GitHub, puis choisir le dépôt `Nojann/carte-cafe`.
4. Réglages du build :

   | Champ | Valeur |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

5. **Environment variables** (production) :

   | Nom | Valeur |
   |---|---|
   | `NODE_VERSION` | `24` (Astro 7 exige Node ≥ 22.23) |
   | `SITE_URL` | `https://carte-cafe.pages.dev` (l'adresse réellement attribuée, voir ci-dessous) |
   | `BASE_PATH` | `/` |
   | `CONTACT_EMAIL` | l'adresse e-mail de contact (type **Secret**) |
   | `PHONE_NUMBER` | le numéro au format international (type **Secret**) |

6. **Save and Deploy**.

L'adresse est `https://<nom-du-projet>.pages.dev`. Si `carte-cafe` est déjà pris, Cloudflare ajoute un suffixe : reporter alors l'adresse exacte dans `SITE_URL` et relancer un déploiement.

### Publication

- **À chaque push sur `main`** : build et publication automatiques.
- **À la demande** : projet → **Deployments** → **Retry deployment** (ou « Create deployment »).
- ⚠️ **Changer une variable ne republie pas le site** : relancer un déploiement ensuite.

### Rebuild quotidien (retrait des événements passés)

Le cron de `.github/workflows/deploy.yml` (4 h chaque nuit) ne s'applique pas ici. Pour le remplacer :

1. Projet Cloudflare → **Settings** → **Builds** → **Deploy hooks** → **Add deploy hook** (branche `main`). Copier l'URL obtenue.
2. Sur un service de cron gratuit, par exemple https://cron-job.org : créer une tâche
   - URL : celle du deploy hook ;
   - méthode : **POST** ;
   - horaire : tous les jours à **04:00**.

⚠️ L'URL du deploy hook permet de déclencher des builds : ne pas la publier (ni dans le dépôt, ni ailleurs).

---

## 3. Méthode B — envoi depuis sa machine (dépannage)

Le site est construit en local, puis seul le dossier `dist/` est envoyé à Cloudflare avec **Wrangler**, l'outil en ligne de commande de Cloudflare. Ni GitHub ni Cloudflare n'ont besoin d'accéder au code.

```bash
# 1. Construire pour un site servi à la racine
SITE_URL=https://carte-cafe.pages.dev BASE_PATH=/ npm run build

# 2. Une seule fois : se connecter (ouvre le navigateur)
npx wrangler login

# 3. Envoyer dist/ (crée le projet au premier envoi)
npx wrangler pages deploy dist --project-name=carte-cafe
```

- `CONTACT_EMAIL` et `PHONE_NUMBER` sont lus dans le fichier **`.env`** local (voir `docs/configuration-github.md`, § 6).
- `SITE_URL` et `BASE_PATH`, eux, doivent être passés **sur la ligne de commande** comme ci-dessus : `astro.config.mjs` ne lit pas le fichier `.env`.
- Pas de publication automatique : ni au push, ni chaque nuit. Relancer les deux commandes (build + deploy) à chaque mise à jour.

---

## 4. Vérifier que tout fonctionne

1. Ouvrir `https://carte-cafe.pages.dev/` : redirection vers `/fr/` (ou `/en/`, `/es/` selon la langue du navigateur) et carte affichée.
2. Code source d'une page : les liens `canonical` / `hreflang` commencent par l'adresse `pages.dev`, sans `/carte-cafe`.
3. Journal du build (méthode A : projet → **Deployments** → le déploiement → **Build log**) : aucune ligne `[contact]` si l'e-mail et le téléphone sont bien pris en compte (détail des messages : `docs/configuration-github.md`, § 5).
4. Page **Contact** : les cartes « Par e-mail » et « Par téléphone » révèlent les bonnes coordonnées au clic.

### Dépannage

| Symptôme | Cause probable |
|---|---|
| Page blanche, ou boucle de redirection | `BASE_PATH=/` absent au build |
| Liens canoniques en `nojann.github.io` | `SITE_URL` absent au build |
| Build en échec sur la version de Node | `NODE_VERSION=24` absent |
| Cartes e-mail / téléphone absentes | `CONTACT_EMAIL` / `PHONE_NUMBER` absents ou invalides |

---

## 5. Revenir à GitHub Pages

Rien à modifier dans le code : sans `SITE_URL` ni `BASE_PATH`, le build revient aux valeurs GitHub Pages. Le workflow `.github/workflows/deploy.yml` reste en place et reprend dès que les Actions fonctionnent.

⚠️ Si les deux sites restent en ligne en même temps, les moteurs de recherche voient du contenu en double : n'en garder qu'un comme adresse officielle (voir `docs/seo.md`).

---

## Fichiers concernés

| Fichier | Rôle |
|---|---|
| `astro.config.mjs` | lit `SITE_URL` et `BASE_PATH` (valeurs GitHub Pages par défaut) |
| `src/lib/paths.ts` | `withBase()` : préfixe les chemins internes avec `BASE_PATH` |
| `.env` | `CONTACT_EMAIL` et `PHONE_NUMBER` en local (méthode B) |
