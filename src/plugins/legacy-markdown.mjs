/**
 * Conversion Markdown -> HTML historique du site (ancien js/gallery.js & js/chantier.js).
 * Volontairement conservée : les lignes vides du texte pilotent l'espacement affiché (chacune devient un <br />).
 */
export function legacyMarkdownToHtml(markdown) {
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

/** Retours à la ligne entre la description et la note de bas de fiche. */
const GAP = 6;

/** Description + note (une ligne par information, en italique) -> HTML. */
export function renderProjectText(description, footnote) {
  let text = '\n' + description.trim();
  const lines = footnote.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length) text += '\n'.repeat(GAP) + lines.map((l) => '>' + l).join('\n');
  return legacyMarkdownToHtml(text);
}
