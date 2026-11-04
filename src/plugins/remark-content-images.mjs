import path from 'node:path';
import { visit } from 'unist-util-visit';

/**
 * LiteEditor écrit les images d'un document avec un chemin relatif au fichier Markdown
 * (ex. ../../../public/images/a-propos/photo.jpg). Ce plugin le convertit en URL du site
 * (/images/a-propos/photo.jpg, préfixée par `base`).
 */
export default function remarkContentImages({ base = '/' } = {}) {
  const publicDir = path.resolve('public');
  return (tree, file) => {
    if (!file.path) return;
    visit(tree, 'image', (node) => {
      if (/^([a-z]+:|\/)/i.test(node.url)) return;
      const abs = path.resolve(path.dirname(file.path), decodeURI(node.url));
      const rel = path.relative(publicDir, abs);
      if (rel.startsWith('..')) return;
      node.url = encodeURI(base.replace(/\/?$/, '/') + rel.split(path.sep).join('/'));
    });
  };
}
