# ARTYAL Mozaïk

Site vitrine de Yaëlle Lohé, artiste mosaïste — [artyal.com](https://artyal.com). Construit avec [Astro](https://astro.build) (site 100 % statique) et éditable avec LiteEditor via le fichier `.liteditor`.

## Structure

```
src/content/galerie/*.md      une fiche = une œuvre de la page Galerie
src/content/chantiers/*.md    une fiche = un projet de la page Chantiers et commandes
public/images/<page>/<fiche>/ photos des fiches (sélecteur d'images de LiteEditor)
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

## Commandes

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # génère ./dist
npm run preview
```

Le déploiement sur GitHub Pages se fait via `.github/workflows/deploy.yml` à chaque push sur `main`
(Settings → Pages → Source : **GitHub Actions**).
