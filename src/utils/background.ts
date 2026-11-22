import { pageUrl } from './assets';

/** Largeurs générées au build à partir de l'image choisie dans les réglages généraux. */
export const BACKGROUND_WIDTHS = [320, 480, 640, 720, 800, 1024, 1080, 1280, 1600, 1920, 2560, 3840];

export const backgroundUrl = (width: number) => pageUrl(`res/main_image/main-${width}.webp`);

/**
 * CSS de l'image de fond de l'accueil : une image par plage d'écran (du plus petit au plus grand),
 * les plages ne se chevauchent pas.
 */
export function backgroundCss(): string {
  const bg = (w: number) => `main { background-image: url('${backgroundUrl(w)}'); }`;
  return [
    // Mobile (≤ 600px) : portrait 720, paysage 1080 ; haute densité : 1080 / 1280
    bg(720),
    `@media screen and (max-width: 600px) and (orientation: landscape) { ${bg(1080)} }`,
    `@media screen and (max-width: 600px) and (orientation: portrait) and (min-resolution: 192dpi) { ${bg(1080)} }`,
    `@media screen and (max-width: 600px) and (orientation: landscape) and (min-resolution: 192dpi) { ${bg(1280)} }`,
    // Tablettes (601px – 1024px)
    `@media screen and (min-width: 601px) and (max-width: 1024px) and (orientation: portrait) { ${bg(1080)} }`,
    `@media screen and (min-width: 601px) and (max-width: 1024px) and (orientation: landscape) { ${bg(1280)} }`,
    // Grands écrans (≥ 1025px)
    `@media screen and (min-width: 1025px) and (orientation: portrait) { ${bg(1920)} }`,
    `@media screen and (min-width: 1025px) and (orientation: landscape) { ${bg(2560)} }`,
  ].join('\n');
}
