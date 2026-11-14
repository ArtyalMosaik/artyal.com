import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Pages libres (À propos, Galerie, Chantiers) : titre + texte Markdown ; images, diaporamas et fiches
// sont insérés dans le texte sous forme d'éléments LiteEditor (voir .liteditor et src/plugins/).
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    // Texte du lien dans la barre du haut (vide : la page n'apparaît pas dans le menu) et sa position (1 = en premier)
    menu: z.string().optional(),
    menu_order: z.coerce.number().default(999),
    // Affiche le titre en en-tête de la page (inutile pour les pages de fiches)
    show_title: z.boolean().default(false),
    description: z.string().optional(),
  }),
});

export const collections = { pages };
