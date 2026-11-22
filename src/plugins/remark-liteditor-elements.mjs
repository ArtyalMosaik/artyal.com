import path from 'node:path';
import { load } from 'js-yaml';
import { visit } from 'unist-util-visit';
import { imageVariants } from './images.mjs';
import { renderProjectText } from './legacy-markdown.mjs';

const PREFIX = 'liteditor-element:';
const SIZES = '(max-width: 600px) calc(100vw - 64px), 800px';
// Largeur affichée du slider d'une fiche : toute la largeur moins les marges (mobile), 2/3 de celle-ci sinon
const PROJECT_SIZES = '(max-width: 600px) calc(100vw - 64px), calc((100vw - 64px) * 0.667)';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** URL du site pour un chemin d'image relatif au fichier Markdown (même logique que remark-content-images). */
async function resolveImage(url, file, base) {
  const publicDir = path.resolve('public');
  const prefix = base.replace(/\/?$/, '/');
  if (/^([a-z]+:|\/)/i.test(url)) return { src: url };
  const rel = path.relative(publicDir, path.resolve(path.dirname(file.path), decodeURI(url)));
  if (rel.startsWith('..')) return { src: url };
  const variants = await imageVariants(base, 'public/' + rel.split(path.sep).join('/'));
  return variants ?? { src: encodeURI(prefix + rel.split(path.sep).join('/')) };
}

async function sliderHtml(urls, file, base, { sizes = SIZES, eagerFirst = false } = {}) {
  const images = await Promise.all((urls ?? []).map((url) => resolveImage(url, file, base)));
  const items = images
    .map(
      (image, i) =>
        `<img class="item" src="${esc(image.src)}"${image.srcset ? ` srcset="${esc(image.srcset)}" sizes="${sizes}"` : ''} loading="${eagerFirst && i === 0 ? 'eager' : 'lazy'}" decoding="async" alt="Image ${i + 1}" style="transition-duration: 0ms; transform: translateX(${i * 100}%);">`,
    )
    .join('');
  return `<div class="slider no-select">${items}<div class="controls"><div class="prev no-select">&lt;</div><div class="next no-select">&gt;</div></div></div>`;
}

// Un rendu par type d'élément (clé de `elements` dans .liteditor).
// `index` = rang de l'élément parmi ceux du même type dans la page (0 pour le premier).
const renderers = {
  slider: (data, file, base) => sliderHtml(data.images, file, base),

  // Fiche galerie / chantier : texte d'un côté, diaporama de l'autre ; le côté alterne selon le rang.
  async project(data, file, base, index) {
    const side = index % 2 === 0 ? 'img-left' : 'img-right';
    const slider = await sliderHtml(data.images, file, base, { sizes: PROJECT_SIZES, eagerFirst: index < 2 });
    const text = renderProjectText(String(data.description ?? ''), String(data.footnote ?? ''));
    return `<section class="${side}"><div class="content"><h2>${esc(String(data.title ?? '').trim())}</h2><div class="description">${text}</div></div>${slider}</section>`;
  },
};

/** Remplace les blocs ```liteditor-element:<type> du Markdown par le HTML de l'élément. */
export default function remarkLiteditorElements({ base = '/' } = {}) {
  return async (tree, file) => {
    if (!file.path) return;
    const found = [];
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang?.startsWith(PREFIX)) found.push({ node, index, parent });
    });
    const counts = {};
    for (const { node } of found) {
      const type = node.lang.slice(PREFIX.length).trim();
      const render = renderers[type];
      if (!render) continue; // type inconnu : le bloc reste visible tel quel
      const index = (counts[type] = (counts[type] ?? -1) + 1);
      node.type = 'html';
      node.value = await render(load(node.value) ?? {}, file, base, index);
      delete node.lang;
      delete node.meta;
    }
  };
}
