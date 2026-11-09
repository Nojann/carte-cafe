# La landing page « Carte des origines » — guide pour la réunion

> Document de travail non technique. Il décrit, dans l'ordre où le visiteur les découvre, chaque élément de la page, ce qu'il apporte et les points à trancher ensemble.
> État au 6 novembre 2026. Les cafés, prix, liens et textes marqués « exemple » sont **fictifs** et servent seulement à montrer le rendu.

---

## 1. En une phrase

Une page unique qui montre sur une carte du monde **d'où vient chacun de nos cafés**, raconte l'histoire de chaque origine et renvoie vers la boutique pour l'acheter.

**Objectifs :**
- Rendre visible notre travail d'approvisionnement (producteurs, régions, traçabilité).
- Donner envie : chaque café devient un voyage, pas seulement une référence.
- Générer des ventes : chaque fiche mène à la boutique, et on peut mesurer ces clics.

**Pour qui :** clients et curieux, en français, anglais et espagnol, sur ordinateur comme sur téléphone.

---

## 2. Arrivée sur le site et choix de la langue

- Le visiteur est **envoyé automatiquement dans sa langue** (celle de son navigateur) : français, anglais ou espagnol. Si sa langue n'est pas proposée, il arrive sur la version française.
- En haut à droite, trois boutons **FR / EN / ES** permettent de changer de langue à tout moment. Si un café est ouvert, il reste ouvert dans la nouvelle langue.
- Toutes les fiches café doivent exister dans les trois langues : il est impossible de publier une fiche à moitié traduite (le site refuse de se construire).

**À discuter :** faut-il d'autres langues (allemand, italien… vu la torréfaction à Lausanne) ? Qui relit les traductions ?

---

## 3. Barre du haut

| Élément | Rôle |
|---|---|
| Nom de la marque (« Café La Casita ») | Retour en haut de la page |
| **La carte** | Descend directement jusqu'à la carte |
| **Notre démarche** | Descend jusqu'au bloc « Notre démarche » |
| **Boutique** | Lien vers la boutique en ligne |
| **FR / EN / ES** | Changement de langue |

---

## 4. Le bandeau d'accueil (en-tête)

Ce que voit le visiteur en premier, avant de faire défiler :

- Petite étiquette : **« Carte des origines »**
- Grand titre : **« Chaque tasse a une *adresse.* »**
- Sous-titre : « Nos cafés viennent de fermes et de coopératives que nous connaissons. Partez à leur rencontre, d'un point de la carte à l'autre. »
- Bouton : **« Explorer la carte ↓ »**

**But :** poser la promesse (traçabilité, relation humaine) en quelques secondes et inviter à descendre vers la carte.

**À discuter :** le titre et le sous-titre nous ressemblent-ils ? Ajoute-t-on une photo ou une illustration ?

---

## 5. La carte interactive (cœur de la page)

### Ce qu'on voit au départ
- Un titre **« Nos origines »** et un compteur, par exemple **« 5 cafés, 5 pays »** (calculé automatiquement).
- Une **carte du monde** stylisée :
  - les **pays d'où viennent nos cafés sont mis en couleur**, les autres restent neutres ;
  - une bande horizontale signale la **« Ceinture du café »** (la zone tropicale où pousse le café) — un petit élément pédagogique ;
  - un **point par café**, avec son nom et son pays ;
  - un repère **« Notre torréfaction · Lausanne »**.
- À côté (ou en dessous sur téléphone), une phrase d'invitation : « Choisissez un point sur la carte pour découvrir l'histoire du café. »

### Quand on clique sur un café
1. Une **ligne se dessine depuis l'origine jusqu'à notre torréfaction**, avec un **petit cargo** qui fait le trajet (environ 2 secondes). Cela matérialise le voyage du café.
2. Arrivée à Lausanne, puis la carte **zoome sur la région d'origine**.
3. La **fiche du café** s'affiche (voir section 6).
- Sur téléphone, le visiteur voit d'abord l'animation sur la carte, puis la page glisse vers la fiche.
- Un bouton **« Vue monde »** permet de revenir à la carte entière ; recliquer sur le même point ou appuyer sur Échap fait la même chose.
- Les cafés **épuisés** restent sur la carte mais apparaissent grisés avec la mention « Épuisé ».

### Petits plus
- **Lien partageable** : l'adresse de la page change selon le café ouvert (par ex. `…/fr/#ethiopie-guji`). Envoyer ce lien ouvre directement la bonne fiche — utile pour Instagram, newsletter, QR code sur un sachet.
- Les personnes qui ont désactivé les animations sur leur appareil (sensibilité au mouvement) voient directement le résultat, sans animation.
- La carte reste utilisable au clavier et avec un lecteur d'écran.

**À discuter :**
- L'animation du cargo : bon niveau de « spectacle » ou trop long ?
- Le trajet dessiné est **symbolique** (une courbe), pas la vraie route maritime. Est-ce assumé ?
- Lausanne est-il bien le point d'arrivée qu'on veut montrer ?
- Idée possible : un QR code par sachet renvoyant vers la fiche du café.

---

## 6. La fiche café

Chaque fiche contient, de haut en bas :

| Élément | Exemple (Éthiopie) | Obligatoire ? |
|---|---|---|
| Photo | Cerises de café séchant à Guji | Oui (sinon le **drapeau du pays** s'affiche à la place) |
| Pays · Région | Éthiopie · Guji, Oromia | Oui |
| Nom du café | Éthiopie Guji Hambela | Oui |
| Notes de dégustation (étiquettes) | Fraise · Myrtille · Jasmin · Chocolat au lait | Oui |
| Histoire (petit texte) | « Dans les hauts plateaux de Guji, environ 600 familles… » | Non |
| Producteur | Station de lavage Buku Sayisa | Non |
| Altitude | 1 950 – 2 250 m | Non |
| Variétés | Heirloom | Non |
| Process (méthode de traitement) | Nature, Lavé, Honey, Semi-lavé, Anaérobie | Non |
| Récolte | 2025-2026 | Non |
| Distance jusqu'à Lausanne | ≈ 5 500 km (calculée automatiquement, à vol d'oiseau) | Automatique |
| Profil : acidité, corps, douceur | Notes sur 5, sous forme de points | Non |
| Prix | 14,90 € les 250 g | Non |
| Bouton | **« Acheter ce café »** (ou « Voir sur la boutique » si épuisé) | Oui |

- Des flèches **← →** permettent de passer au café précédent / suivant. Les cafés sont rangés **d'ouest en est** (du Costa Rica à l'Indonésie), comme un tour du monde.
- Une croix ferme la fiche et ramène à la vue monde.
- Les éléments optionnels non renseignés disparaissent simplement de la fiche.

**À discuter :**
- **Photos** : aucune vraie photo n'est encore en place (les drapeaux s'affichent). Qui les fournit ? Droits d'utilisation ?
- Les informations producteurs sont-elles toutes publiables (accord des producteurs) ?
- Prix affiché en euros alors que la torréfaction est en Suisse : quelle devise ?
- Le profil acidité / corps / douceur parle-t-il à nos clients ?

---

## 7. La liste « Tous nos cafés »

Sous la carte, tous les cafés sont présentés sous forme de **cartes** :
- pays · région, nom, notes de dégustation ;
- lien **« Voir sur la carte »** (remonte à la carte et ouvre la fiche) ;
- lien **« Acheter ce café »**, ou badge **« Épuisé »**.

Survoler une carte de la liste fait réagir le point correspondant sur la carte, et inversement.

**But :** permettre à ceux qui ne veulent pas jouer avec la carte de tout voir d'un coup d'œil, et rendre le contenu lisible par les moteurs de recherche.

---

## 8. Le bloc « Notre démarche »

Trois engagements numérotés (textes **d'exemple**, à réécrire avec nos mots) :
1. **Des relations directes** — acheter aux mêmes producteurs saison après saison.
2. **Une traçabilité complète** — savoir de quelle ferme, à quelle altitude, avec quel process.
3. **Torréfié pour révéler l'origine** — mettre en valeur le terroir plutôt que le masquer.

**À discuter :** ces trois messages sont-ils les bons ? Sont-ils vrais pour tous nos cafés ? Qui rédige la version définitive ?

---

## 9. Le pied de page

- Nom de la marque
- Liens : **Boutique**, **Contact** (ouvre un e-mail), **Instagram**, **Mentions légales**
- Mention : « Données présentées à titre d'exemple. » (à retirer à la mise en ligne réelle)

**À faire :** l'adresse e-mail, le lien Instagram et la boutique sont des valeurs d'exemple ; la page **« Mentions légales » n'existe pas encore** (le lien ne mène nulle part).

---

## 10. Identité visuelle

- Palette vive inspirée des **« chivas » colombiennes** (bus peints de l'art populaire) : jaune, bleu, rouge du drapeau colombien, plus vert, rose et turquoise. Fond crème, contours épais foncés, ombres franches.
- Une typographie de titre expressive (Bricolage Grotesque).

**À discuter :** cette charte correspond-elle à notre image de marque, ou faut-il l'aligner sur l'existant (logo, sachets, boutique) ?

---

## 11. Ce qui se passe en coulisses (sans jargon)

- **Mesure des ventes** : chaque lien « Acheter » vers la boutique est marqué pour que l'outil de statistiques de la boutique sache que le clic vient de la carte, et de **quel café**. On pourra donc répondre à « combien de ventes la carte a-t-elle générées, et pour quel café ? ».
- **Référencement Google** : la page décrit nos cafés (nom, origine, prix, disponibilité) dans un format que les moteurs de recherche comprennent, et signale ses trois versions linguistiques.
- **Légèreté** : la carte est préparée à l'avance ; le visiteur ne télécharge pas d'outil de cartographie, la page s'affiche vite même sur mobile.
- **Hébergement** : site statique publié gratuitement sur GitHub Pages ; une mise à jour publiée met la page à jour en quelques minutes.

---

## 12. Ajouter ou modifier un café : qui fait quoi ?

Pour ajouter un café, il faut fournir :
1. Les informations de la fiche (tableau de la section 6), **en français, anglais et espagnol** pour les textes (nom, région, notes, histoire, légende photo).
2. La position du lieu (coordonnées GPS approximatives de la ferme ou de la région).
3. Une photo.
4. Le lien de la page produit dans la boutique, dans chaque langue.
5. Prix, poids, et si le café est disponible ou épuisé.

Aujourd'hui, la saisie se fait dans un fichier par café et demande une personne à l'aise avec ces fichiers. Une trentaine de pays producteurs sont déjà prévus ; un nouveau pays demande un petit ajout supplémentaire.

**À discuter :**
- Qui est responsable de tenir la carte à jour (nouvelles récoltes, ruptures de stock) ?
- La disponibilité doit-elle être mise à jour à la main ou, plus tard, synchronisée avec la boutique ?

---

## 13. Récapitulatif des décisions à prendre

| # | Sujet | Question |
|---|---|---|
| 1 | Contenu | Liste réelle des cafés à afficher au lancement |
| 2 | Contenu | Photos (source, droits) et accord des producteurs |
| 3 | Contenu | Textes définitifs : accroche, « Notre démarche », histoires |
| 4 | Langues | FR / EN / ES suffisent-elles ? Qui traduit et relit ? |
| 5 | Commerce | Devise affichée (EUR ou CHF), liens boutique réels |
| 6 | Marque | Validation de la charte graphique « chiva » |
| 7 | Expérience | Durée / style de l'animation du cargo |
| 8 | Légal | Rédaction des mentions légales, adresse de contact, Instagram |
| 9 | Organisation | Responsable des mises à jour et du suivi des ventes |
| 10 | Mise en ligne | Nom de domaine définitif (actuellement une adresse GitHub provisoire) |

## Boutique et panier

> Ajouté le 9 novembre 2026.

- **Page boutique** (`/fr/boutique/`, `/en/…`, `/es/…`) : un produit par café, choix de la torréfaction et du format (250 g, 500 g, 1 kg), bouton « Ajouter au panier ».
- **Ajout depuis la carte** : les boutons « Acheter » des fiches café, des fiches région et de la liste « Tous nos cafés » ajoutent directement au panier (fiche café : format au choix ; ailleurs : torréfaction principale en 250 g). Ils ne renvoient plus vers l'ancien site.
- **Page panier** (`/fr/panier/`) : quantités, suppression, sous-total. Le panier est gardé **dans le navigateur du visiteur** (aucune donnée envoyée) et partagé entre les langues.
- **Paiement** : pas encore branché. Le bouton affiche « Paiement — bientôt disponible » et invite à commander par e-mail.

**À faire :** valider les prix des formats 250 g et 500 g (valeurs d'exemple) ; choisir la solution de paiement.
