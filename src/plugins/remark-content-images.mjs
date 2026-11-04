import path from 'node:path';
import { visit } from 'unist-util-visit';
import { imageVariants } from './images.mjs';

/**
 * LiteEditor écrit les images d'un document avec un chemin relatif au fichier Markdown
 * (ex. ../../../public/images/a-propos/photo.jpg). Ce plugin le convertit en URL du site et,
 * pour les images de public/images, les remplace par les versions WebP optimisées (srcset).
 */
export default function remarkContentImages({ base = '/', sizes = '(max-width: 600px) 75vw, 50vw' } = {}) {
  const publicDir = path.resolve('public');
  const prefix = base.replace(/\/?$/, '/');
  return async (tree, file) => {
    if (!file.path) return;
    const images = [];
    visit(tree, 'image', (node) => images.push(node));
    for (const node of images) {
      if (/^([a-z]+:|\/)/i.test(node.url)) continue;
      const abs = path.resolve(path.dirname(file.path), decodeURI(node.url));
      const rel = path.relative(publicDir, abs);
      if (rel.startsWith('..')) continue;
      const publicPath = 'public/' + rel.split(path.sep).join('/');
      const variants = await imageVariants(base, publicPath);
      if (variants) {
        node.url = variants.src;
        node.data = {
          ...node.data,
          hProperties: {
            srcSet: variants.srcset,
            sizes,
            // Dimensions réelles : le navigateur réserve la place avant le chargement (pas de saut de mise en page)
            width: variants.width,
            height: variants.height,
            loading: 'lazy',
            decoding: 'async',
          },
        };
      } else {
        node.url = encodeURI(prefix + rel.split(path.sep).join('/'));
      }
    }
  };
}
