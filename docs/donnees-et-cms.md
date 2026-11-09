# Mettre à jour les cafés — fonctionnement actuel et pistes de micro-CMS

> Document de travail. Il explique comment les fiches café deviennent des données du site, ce qui rend leur édition difficile aujourd'hui, et les options pour la simplifier.
> État au 9 novembre 2026. Les données réelles extraites du livret sont dans `specs/donnees-reelles-cafes.md`.

---

## 1. Comment ça marche aujourd'hui

Le site fonctionne déjà comme un micro-CMS : chaque fichier `.md` de `src/content/cafes/` est une fiche café, transformée en données au moment du build.

```
src/content/cafes/narino-honey.md   (une fiche par café, en YAML)
        │
        ▼  npm run build
src/content.config.ts   (vérifie chaque fiche : champs, types, 3 langues)
        │
        ▼
src/lib/cafes.ts        (vérifie la région et que les coordonnées tombent dans le département,
        │                puis trie les cafés)
        ▼
la carte, les fiches et la liste du site statique dans dist/
```

**Remplacer les données** : modifier, ajouter ou supprimer un `.md`, puis pousser sur `main`. Le workflow GitHub Actions reconstruit et publie le site. Si une fiche est mal remplie, le build échoue avec un message qui dit quoi corriger.

---

## 2. Ce qui rend l'édition pénible

Le mécanisme est en place. Le problème, c'est le format des fiches, difficile à remplir pour quelqu'un qui ne code pas :

- **Tout est en YAML.** Une indentation ratée suffit à casser le build.
- **Les 3 langues sont obligatoires** pour chaque texte. Impossible de publier une fiche en français seulement.
- **Des champs techniques sans équivalent dans le livret :** `profil` noté de 1 à 5, coordonnées GPS, liens par langue.
- **Le corps du `.md`, sous le frontmatter, n'est pas utilisé.** Les textes longs doivent donc aussi être écrits en YAML.

---

## 3. Deux améliorations possibles (cumulables)

### 3.1 Un format de fiche plus lisible

Sans dépendance, dans le code. On garde le principe d'un `.md` par café, mais plus simple :

```markdown
---
nom: Café Honey
region: narino
localite: Tangua
process: honey
varietes: [Bourbon rouge]
altitude: 1900-2400
score: 83.25
torrefactions:
  - moyenne, filtre, 70 CHF/kg
---
## Histoire
Le procédé Honey préserve une partie du mucilage…

## Notes
Fruits mûrs, caramel, miel, cacao
```

- Les coordonnées seraient déduites de la localité, avec une petite table Tangua → lat/lng.
- Les textes seraient écrits en titres Markdown plutôt qu'en YAML.
- L'anglais et l'espagnol deviendraient facultatifs : sans traduction, le site affiche le français.
- Le build vérifierait toujours tout.

### 3.2 Une interface d'édition web

Pour que José ou Emma modifient les fiches dans un formulaire, sans toucher au code. Chaque enregistrement crée un commit, qui republie le site.

| Outil | Hébergement | Remarque |
|---|---|---|
| **Pages CMS** | Service hébergé, connexion avec GitHub | Rien à installer : un fichier `.pages.yml` décrit les champs. Le plus simple avec GitHub Pages. |
| Decap CMS | Une page `/admin` dans le site | Sur GitHub Pages, il faut un service d'authentification OAuth en plus. |
| Keystatic | Intégration Astro | Le mode GitHub demande un serveur. En mode local, ça ne marche que sur la machine du développeur. |

---

## 4. Recommandation

- **Si c'est Robin qui édite :** l'option 3.1 suffit. C'est quelques heures de travail et ça reste 100 % statique.
- **Si José ou Emma doivent éditer seuls :** l'option 3.1 plus Pages CMS. Le formulaire écrit les `.md` simplifiés, et le build continue de tout vérifier.

**À décider :** qui met à jour les fiches ? La réponse décide s'il faut l'interface web. Ensuite, on met en place le nouveau format et on y migre les 3 vrais cafés du livret.
