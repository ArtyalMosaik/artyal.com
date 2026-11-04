// Optimisation des photos au build : versions WebP redimensionnées de chaque image de public/images
// utilisée par le contenu (src/content/**/*.md). Module sans dépendance Astro : utilisé par la config
// (plugin Markdown), les pages et la route qui génère les fichiers (src/pages/img/…).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/** Largeurs candidates (px). Les versions plus larges que l'image source ne sont pas générées. */
export const WIDTHS = [480, 800, 1200, 1600, 2400];
export const WEBP_QUALITY = 80;

const IMAGE_RE = /public\/images\/[^\s)"'<>]+?\.(?:jpe?g|png|webp|avif|tiff?)/gi;
const PUBLIC_DIR = path.resolve('public');
const CONTENT_DIR = path.resolve('src/content');

/** Chemin sous public/ -> chemin de variante : « public/images/a/b.jpg » -> « images/a/b.jpg » (ou null). */
export function toPublicRel(p) {
  const rel = p.replace(/^\/?public\//, '');
  const abs = path.join(PUBLIC_DIR, rel);
  return rel.startsWith('images/') && fs.existsSync(abs) ? rel : null;
}

const sizeCache = new Map();
/** Dimensions réelles (orientation EXIF comprise) de l'image source. */
async function sourceSize(rel) {
  if (!sizeCache.has(rel)) {
    const meta = await sharp(path.join(PUBLIC_DIR, rel)).metadata();
    const swap = (meta.orientation ?? 1) >= 5;
    sizeCache.set(rel, {
      width: (swap ? meta.height : meta.width) ?? WIDTHS[0],
      height: (swap ? meta.width : meta.height) ?? WIDTHS[0],
    });
  }
  return sizeCache.get(rel);
}

/** Largeurs à générer pour une image : celles inférieures à la source, plus la source si elle est ≤ 2400. */
export async function widthsFor(rel) {
  const { width: w } = await sourceSize(rel);
  const list = WIDTHS.filter((x) => x < w);
  if (w <= WIDTHS[WIDTHS.length - 1]) list.push(w);
  return list;
}

export const variantUrl = (base, rel, width) =>
  encodeURI(`${base.replace(/\/?$/, '/')}img/${width}/${rel}.webp`);

/** { src, srcset, width, height } pour une image de public/ ; null si l'image n'est pas optimisable. */
export async function imageVariants(base, publicPath) {
  const rel = toPublicRel(publicPath);
  if (!rel) return null;
  const widths = await widthsFor(rel);
  const { width, height } = await sourceSize(rel);
  return {
    width,
    height,
    src: variantUrl(base, rel, widths.find((w) => w >= 800) ?? widths[widths.length - 1]),
    srcset: widths.map((w) => `${variantUrl(base, rel, w)} ${w}w`).join(', '),
  };
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.md')) yield full;
  }
}

/** Toutes les images référencées par le contenu (frontmatter ou corps, chemins absolus ou relatifs au fichier). */
export function usedImages() {
  const found = new Set();
  for (const file of walk(CONTENT_DIR)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(IMAGE_RE)) {
      const rel = toPublicRel(m[0]);
      if (rel) found.add(rel);
    }
  }
  return [...found];
}

/** Redimensionne + convertit en WebP. */
export function renderVariant(rel, width) {
  return sharp(path.join(PUBLIC_DIR, rel))
    .rotate() // respecte l'orientation EXIF
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}
