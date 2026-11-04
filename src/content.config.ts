import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Les deux collections ont le même format : une fiche = un fichier Markdown.
//  - frontmatter : titre, ordre d'affichage, images (le slider), détails (année, dimensions, matériaux, prix…)
//  - corps       : texte de présentation
const project = (folder: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.md', base: `./src/content/${folder}` }),
    schema: z.object({
      title: z.string(),
      // Position dans la page (1 = en premier). LiteEditor n'a pas de champ numérique : on accepte aussi du texte.
      order: z.coerce.number().default(999),
      images: z.array(z.string()).default([]),
      details: z.array(z.string()).default([]),
    }),
  });

// Pages libres (ex. À propos) : titre + texte Markdown, images insérées dans le texte.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string() }),
});

export const collections = {
  pages,
  galerie: project('galerie'),
  chantiers: project('chantiers'),
};
