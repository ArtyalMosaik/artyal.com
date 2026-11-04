# ARTYAL Mozaïk

Site vitrine de Yaëlle Lohé, artiste mosaïste — [artyal.com](https://artyal.com). Construit avec [Astro](https://astro.build) (site 100 % statique) et éditable avec LiteEditor via le fichier `.liteditor`.

## Structure

```
src/content/galerie/*.md      une fiche = une œuvre de la page Galerie
src/content/chantiers/*.md    une fiche = un projet de la page Chantiers et commandes
src/content/pages/about.md    page À propos (texte + photos insérées dans le texte)
src/data/site.json            réglages généraux : e-mail, téléphone, Instagram, Facebook
public/images/                photos éditables (galerie, chantiers, a-propos) — sélecteur d'images de LiteEditor
public/res/                   logo, polices, icônes, image d'accueil (voir scripts/resize.sh)
src/pages/                    pages (URLs conservées : /pages/gallery.html, …)
src/styles/                   feuilles de style
src/scripts/slider.ts         slider d'images (clic / glisser)
```

Tout est calculé au build : les fiches sont lues dans les fichiers Markdown, le HTML des pages Galerie et
Chantiers est généré à l'avance (plus aucune lecture de fichier côté navigateur).

## Éditer une fiche

Frontmatter : `title`, `order` (position), `images` (liste), `details` (une ligne par info : année, dimensions, matériaux, prix).
Le corps du fichier est le texte de présentation ; `# Titre` y crée un intertitre. Les lignes vides du texte
sont conservées telles quelles à l'affichage (elles servent à l'espacement).

Ajouter une fiche : créer un `.md` dans `src/content/galerie/` ou `src/content/chantiers/` et choisir une `order`.

## Réglages généraux et page À propos

- **Général** (LiteEditor → réglages) : e-mail, téléphone et liens Instagram/Facebook, utilisés sur la page Contact
  et le pied de page de l'accueil. Un champ vide masque l'élément correspondant.
- **À propos** : `src/content/pages/about.md`. Texte en Markdown ; les photos s'insèrent depuis la barre d'outils
  de l'éditeur (dossier `public/images/a-propos/`).

## Images

Il suffit de déposer les photos d'origine dans `public/images/` (via LiteEditor) : au build, chaque image utilisée
par le contenu est convertie en WebP en plusieurs largeurs (480 → 2400 px, jamais agrandies) dans `dist/img/`.
Les pages utilisent `srcset` / `sizes` calculés d'après la largeur affichée (sliders, page À propos) et
`loading="lazy"` ; le navigateur télécharge la taille adaptée à l'écran. Voir `src/plugins/images.mjs`.
L'image de fond de l'accueil suit le même principe (`src/pages/res/main_image/`), sa taille dépend de l'écran.

## Commandes

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # génère ./dist
npm run preview
```

Le déploiement sur GitHub Pages se fait via `.github/workflows/deploy.yml` à chaque push sur `main`
(Settings → Pages → Source : **GitHub Actions**).
