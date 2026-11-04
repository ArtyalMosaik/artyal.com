import type { APIRoute, GetStaticPaths } from 'astro';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { BACKGROUND_WIDTHS } from '../../../utils/background';
import { settings } from '../../../utils/site';

// Génère au build une version de l'image de fond de l'accueil par largeur d'écran.
export const getStaticPaths = (() =>
  BACKGROUND_WIDTHS.map((width) => ({ params: { width: String(width) } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const source = settings.homeBackground;
  if (!source || !existsSync(source)) {
    throw new Error(`Image de fond introuvable : « ${source} » (réglage « Image de fond de l'accueil »)`);
  }
  const buffer = await sharp(source)
    .rotate() // respecte l'orientation EXIF des photos
    .resize({ width: Number(params.width), withoutEnlargement: true })
    .webp()
    .toBuffer();
  return new Response(new Uint8Array(buffer), { headers: { 'Content-Type': 'image/webp' } });
};
