import { defineConfig, defineElement, f } from 'liteditor'

const images = f.list('Images', f.image('Image'), {
  description: "Photos du diaporama, dans l'ordre d'affichage",
})

const project = defineElement({
  label: 'Fiche œuvre / chantier',
  description:
    "Une fiche de la Galerie ou des Chantiers : titre, texte, photos et note. Les fiches alternent automatiquement image à gauche / image à droite, dans l'ordre de la page.",
  fields: {
    title: f.text('Titre', { description: "Nom de l'œuvre ou du chantier" }),
    description: f.longText('Description', { description: 'Texte de présentation' }),
    footnote: f.longText('Note', {
      description:
        'Une ligne par information, en italique sous le texte : année, dimensions, matériaux, prix ou « Vendue »…',
    }),
    images,
  },
  display: { title: 'title', description: 'description', images: 'images' },
})

const slider = defineElement({
  label: 'Diaporama',
  description: "Diaporama d'images à insérer n'importe où dans le texte d'une page (ex. À propos)",
  fields: { images },
  display: { images: 'images' },
})

export default defineConfig({
  content_path: 'src/content',
  assets_path: 'public/images',
  settings_file: 'src/data/site.json',
  schema: {
    logo: f.image('Logo', {
      description: "Affiché dans l'en-tête de toutes les pages et utilisé comme icône de l'onglet du navigateur (SVG ou PNG conseillé).",
    }),
    siteName: f.text('Nom du site', { description: "Titre affiché dans l'en-tête de toutes les pages." }),
    siteDescription: f.longText('Description du site', {
      description:
        'Résumé affiché par Google et lors des partages sur les réseaux sociaux (Facebook, Instagram…). Utilisé pour les pages sans description propre.',
    }),
    home: f.object('Accueil', {
      linkPage: f.page('Page du lien', {
        description: "Page vers laquelle mène le lien au centre de l'accueil.",
        extra: [{ value: '/contact', label: 'Contact' }],
      }),
      link: f.text('Texte du lien', {
        description: "Lien vers la galerie au centre de l'accueil (la flèche « &gt; » est ajoutée automatiquement).",
      }),
      name: f.text('Nom', {
        description: "Nom affiché en bas de l'accueil. Laisser vide pour masquer.",
      }),
      subtitle: f.text('Sous-titre', {
        description: "Ligne sous le nom en bas de l'accueil. Laisser vide pour masquer.",
      }),
      background: f.image('Image de fond', {
        description:
          "Photo plein écran de la page d'accueil. Les tailles pour mobile, tablette et grand écran sont générées automatiquement : une grande photo (≥ 2560 px de large) convient.",
      }),
    }),
    email: f.text('E-mail de contact', {
      description: 'Affiché sur la page Contact (lien mailto). Laisser vide pour masquer.',
    }),
    phone: f.text('Téléphone', {
      description: 'Affiché tel quel sur la page Contact, ex. +33 7 77 20 95 00. Laisser vide pour masquer.',
    }),
    instagram: f.link('Lien Instagram', {
      description: "Icône affichée sur l'accueil et la page Contact. Laisser vide pour masquer.",
    }),
    facebook: f.link('Lien Facebook', {
      description: "Icône affichée sur l'accueil et la page Contact. Laisser vide pour masquer.",
    }),
    copyright: f.text('Texte du pied de page', {
      description: 'Affiché en bas de chaque page, suivi de « Site réalisé par Alexis Rossfelder ».',
    }),
  },
  elements: { project, slider },
  frontmatter: {
    title: f.text('Titre', {
      description: "Titre de la page (affiché en en-tête si « Afficher le titre » est coché, et utilisé dans l'onglet du navigateur)",
    }),
    menu: f.text('Texte dans le menu', {
      description: 'Nom du lien dans la barre du haut. Laisser vide pour ne pas afficher la page dans le menu.',
    }),
    menu_order: f.text('Position dans le menu', {
      description: '1 = en premier (après Accueil). Contact reste toujours en dernier.',
    }),
    show_title: f.bool('Afficher le titre', {
      description: 'Affiche le titre en en-tête de la page. À laisser décoché pour les pages de fiches (Galerie, Chantiers).',
    }),
    description: f.longText('Description', {
      description: 'Résumé de la page pour les moteurs de recherche (facultatif)',
    }),
  },
})
