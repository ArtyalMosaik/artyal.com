import site from '../data/site.json';
import { pageUrl } from './assets';

/** Réglages généraux (éditables dans LiteEditor : src/data/site.json). Les champs vides sont ignorés. */
export interface Site {
  logo: string;
  siteName: string;
  siteDescription: string;
  homeLinkPage: string;
  homeLink: string;
  homeName: string;
  homeSubtitle: string;
  homeBackground: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  copyright: string;
}

export const settings: Site = {
  logo: 'public/res/logo.svg',
  siteName: 'ARTYAL Mozaïk',
  siteDescription: 'Portfolio de Yaëlle Lohé, artiste mosaïste. Découvrez ses créations en mosaïque.',
  homeLinkPage: 'gallery',
  homeLink: 'Découvrez les projets',
  homeName: 'Yaëlle Lohé',
  homeSubtitle: 'Artiste Mosaïste',
  homeBackground: 'public/images/accueil/fond.webp',
  email: '',
  phone: '',
  instagram: '',
  facebook: '',
  copyright: 'Copyright © Yaëlle Lohé - Artiste Mosaïste',
  ...site,
};

/** Valeur d'un réglage « page » (slug, « /contact » ou URL externe) -> URL du site. */
export const pageLink = (value: string) =>
  /^https?:\/\//.test(value)
    ? value
    : pageUrl(`pages/${value.replace(/^\//, '').replace(/\.html$/, '')}.html`);

/** « +33 7 77 20 95 00 » -> « +33777209500 » pour le lien tel: */
export const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
