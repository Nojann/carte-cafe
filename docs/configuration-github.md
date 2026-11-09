# Configuration GitHub — publication du site et coordonnées de contact

> Ce qu'il faut régler **une seule fois** sur GitHub pour que le site se publie avec l'e-mail et le téléphone de contact.
> État au 9 novembre 2026.

---

## 1. Pourquoi des « secrets » GitHub ?

L'adresse e-mail et le numéro de téléphone ne sont **jamais écrits dans le code** : un dépôt public est lu en permanence par des robots qui collectent des coordonnées pour envoyer du spam.

Ils sont donc stockés dans GitHub comme **secrets**, puis transmis au moment de la construction du site :

```
Secrets GitHub (CONTACT_EMAIL, PHONE_NUMBER)
        │
        ▼  .github/workflows/deploy.yml (job « build »)
npm run build
        │   src/lib/contact.ts : chaque valeur est inversée puis encodée (base64)
        ▼
dist/ : le HTML ne contient ni « @ », ni « mailto: », ni le numéro en clair
        │
        ▼  dans le navigateur
src/scripts/contact.ts : décodage seulement après un vrai clic
                         sur « Afficher l'e-mail » / « Afficher le numéro »
```

> **À savoir** : ce n'est pas un secret au sens strict. Une fois le site publié, n'importe quel visiteur peut afficher l'adresse en cliquant. Le but est d'empêcher la **collecte automatique**, pas de cacher l'information aux humains.

---

## 2. Activer GitHub Pages (une seule fois)

1. Ouvrir le dépôt sur GitHub → **Settings** → **Pages**.
2. **Build and deployment** → **Source** : choisir **GitHub Actions**.

Le site est publié à l'adresse `https://nojann.github.io/carte-cafe/` (réglée dans `astro.config.mjs` : le `base` doit correspondre au nom du dépôt).

---

## 3. Ajouter les secrets de contact (une seule fois)

1. Ouvrir le dépôt → **Settings** → **Secrets and variables** → **Actions**.
2. Onglet **Secrets** → bouton **New repository secret**.
3. Créer les deux secrets suivants :

| Nom (exactement) | Valeur | Exemple |
|---|---|---|
| `CONTACT_EMAIL` | l'adresse e-mail de contact | `bonjour@cafe-la-casita.ch` |
| `PHONE_NUMBER` | le numéro, **au format international** | `+41 79 123 45 67` |

Points d'attention :
- **Nom exact**, en majuscules : sinon le workflow ne trouve pas la valeur.
- **Pas de guillemets** autour de la valeur.
- Le téléphone peut contenir chiffres, espaces, `+`, `(`, `)`, `.` et `-`. Le format international (`+41 …`) permet d'appeler depuis l'étranger, et le lien `tel:` fonctionne sur tous les téléphones.
- Utiliser l'onglet **Secrets**, pas **Variables** : les variables apparaissent en clair dans les journaux des Actions.

Une fois enregistré, un secret ne peut plus être relu sur GitHub, seulement remplacé (**Update**).

---

## 4. Publier

Le workflow `.github/workflows/deploy.yml` reconstruit et publie le site :
- à chaque **push sur `main`** ;
- **chaque nuit à 4 h** (pour retirer les événements passés) ;
- **à la demande** : onglet **Actions** → « Déploiement GitHub Pages » → **Run workflow**.

⚠️ **Changer un secret ne republie pas le site.** Après avoir ajouté ou modifié `CONTACT_EMAIL` ou `PHONE_NUMBER`, relancer le workflow à la main (**Run workflow**), ou attendre le rebuild de la nuit.

---

## 5. Vérifier que tout fonctionne

1. Onglet **Actions** → ouvrir le dernier « Déploiement GitHub Pages » → job **build**.
2. Dans le journal de l'étape de build, chercher `[contact]` :
   - **aucune ligne `[contact]`** : les deux valeurs ont bien été prises en compte ;
   - `[contact] CONTACT_EMAIL absente ou invalide…` : le secret manque, est mal nommé ou n'a pas de `@` ;
   - `[contact] PHONE_NUMBER absente ou invalide…` : le secret manque, est mal nommé, contient des lettres ou compte moins de 6 chiffres.
3. Sur le site publié, page **Contact** : les cartes « Par e-mail » et « Par téléphone » sont présentes et révèlent les bonnes coordonnées au clic.

Si une valeur manque, **le site se publie quand même** : la carte correspondante est simplement masquée (Instagram et les food trucks restent affichés).

---

## 6. En local

1. Copier le modèle : `cp .env.example .env`.
2. Renseigner les valeurs dans **`.env`** (ignoré par git) :
   ```
   CONTACT_EMAIL=bonjour@cafe-la-casita.ch
   PHONE_NUMBER=+41 79 123 45 67
   ```
3. Relancer `npm run dev` : les variables ne sont lues qu'au démarrage.

⚠️ Ne jamais mettre de vraies valeurs dans **`.env.example`** : ce fichier est publié sur GitHub et sert seulement de modèle.

---

## 7. Cas particuliers

- **Fork ou pull request venant d'un fork** : GitHub ne transmet pas les secrets. Le build passe, mais sans e-mail ni téléphone. C'est normal.
- **Changer d'adresse ou de numéro** : mettre à jour le secret (§ 3), puis relancer le workflow (§ 4).
- **Retirer le téléphone du site** : supprimer le secret `PHONE_NUMBER`, puis relancer le workflow.
- **Ajouter une nouvelle coordonnée protégée** : la déclarer dans `env.schema` (`astro.config.mjs`), la passer dans le bloc `env:` du job `build` (`deploy.yml`), puis l'encoder dans `src/lib/contact.ts`.

---

## Fichiers concernés

| Fichier | Rôle |
|---|---|
| `.github/workflows/deploy.yml` | transmet les secrets au build (`env:` du job `build`) |
| `astro.config.mjs` | déclare `CONTACT_EMAIL` et `PHONE_NUMBER` (`env.schema`, facultatifs) |
| `src/lib/contact.ts` | lit, vérifie et encode les valeurs au build |
| `src/components/ContactReveal.astro` | bouton « Afficher… » (valeur encodée, lien piège) |
| `src/scripts/contact.ts` | décodage après un vrai clic, délai minimal, bouton « Copier » |
| `src/components/Contact.astro` | section de l'accueil et contenu de la page `/contact/` |
| `.env.example` | modèle pour le fichier `.env` local |
