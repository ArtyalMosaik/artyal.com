import type { APIRoute, GetStaticPaths } from 'astro';
import { renderVariant, usedImages, widthsFor } from '../../../plugins/images.mjs';

// Pré-génère au build les versions WebP de chaque image utilisée (une par largeur utile).
export const getStaticPaths = (async () => {
  const paths: { params: { width: string; path: string } }[] = [];
  for (const rel of usedImages()) {
    for (const width of await widthsFor(rel)) paths.push({ params: { width: String(width), path: rel } });
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const buffer = await renderVariant(params.path!, Number(params.width));
  return new Response(new Uint8Array(buffer), { headers: { 'Content-Type': 'image/webp' } });
};
