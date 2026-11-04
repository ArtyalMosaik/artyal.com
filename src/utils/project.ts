import { readFileSync } from 'node:fs';
import { getCollection } from 'astro:content';
import { assetUrl } from './assets';

/**
 * Conversion Markdown -> HTML historique du site (ancien js/gallery.js & js/chantier.js).
 * Volontairement conservée à l'identique : les retours à la ligne du texte pilotent l'espacement
 * affiché (chaque ligne vide devient un <br />), ce qui garantit un rendu strictement identique.
 * Elle s'exécute désormais au build, plus dans le navigateur.
 */
export function legacyMarkdownToHtml(markdown: string): string {
  markdown = markdown.replace(/^#### (.*$)/gim, '<h6>$1</h6>');
  markdown = markdown.replace(/^### (.*$)/gim, '<h5>$1</h5>');
  markdown = markdown.replace(/^## (.*$)/gim, '<h4>$1</h4>');
  markdown = markdown.replace(/^# (.*$)/gim, '<h3>$1</h3>');
  markdown = markdown.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  markdown = markdown.replace(/__(.*)__/gim, '<strong>$1</strong>');
  markdown = markdown.replace(/\*(.*)\*/gim, '<em>$1</em>');
  markdown = markdown.replace(/_(.*)_/gim, '<em>$1</em>');
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
  markdown = markdown.replace(/\n$/gim, '<br />');
  markdown = markdown.replace(/^\>(.*)$/gim, '<blockquote>$1</blockquote>');
  markdown = markdown.replace(/<\/blockquote>\n<blockquote>/gim, '<br>');
  return markdown.trim();
}

/** Nombre de retours à la ligne entre le texte et les détails quand le corps n'en porte pas (ex. après une sauvegarde dans LiteEditor). */
const DEFAULT_GAP = { galerie: 6, chantiers: 9 } as const;

/** Reconstitue le texte historique (corps + lignes « > détail ») puis le convertit en HTML. */
function renderBody(body: string, details: string[], collection: keyof typeof DEFAULT_GAP): string {
  let text = body.startsWith('\n') ? body : `\n${body}`;
  if (details.length) {
    if (!text.endsWith('\n\n')) text = text.trimEnd() + '\n'.repeat(DEFAULT_GAP[collection]);
    text += details.map((d) => `>${d}`).join('\n');
  }
  return legacyMarkdownToHtml(text);
}

/**
 * Corps brut du fichier Markdown. `entry.body` est tronqué par Astro, or les lignes vides finales
 * font partie de la mise en page historique (espace entre le texte et les détails).
 */
function rawBody(filePath: string | undefined, fallback: string): string {
  if (!filePath) return fallback;
  const raw = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  return raw.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

export interface ProjectView {
  id: string;
  title: string;
  html: string;
  images: string[];
  /** Les fiches paires ont l'image à gauche, les impaires à droite. */
  side: 'img-left' | 'img-right';
}

export async function getProjects(collection: keyof typeof DEFAULT_GAP): Promise<ProjectView[]> {
  const entries = await getCollection(collection);
  entries.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
  return entries.map((entry, index) => ({
    id: entry.id,
    title: entry.data.title.trim(),
    html: renderBody(rawBody(entry.filePath, entry.body ?? ''), entry.data.details, collection),
    images: entry.data.images.map(assetUrl),
    side: index % 2 === 0 ? 'img-left' : 'img-right',
  }));
}
