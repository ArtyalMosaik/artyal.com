import site from '../data/site.json';
import { pageUrl } from './assets';

/** Réglages généraux (éditables dans LiteEditor : src/data/site.json). Les champs vides sont ignorés. */
export interface Site {
  logo: string;
  siteName: string;
  siteDescription: string;
  home: {
    linkPage: string;
    link: string;
    name: string;
    subtitle: string;
    background: string;
  };
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  copyright: string;
}

const defaults: Site = {
  logo: 'public/res/logo.svg',
  siteName: 'ARTYAL Mozaïk',
  siteDescription: 'Portfolio de Yaëlle Lohé, artiste mosaïste. Découvrez ses créations en mosaïque.',
  home: {
    linkPage: 'pages/gallery',
    link: 'Découvrez les projets',
    name: 'Yaëlle Lohé',
    subtitle: 'Artiste Mosaïste',
    background: 'public/images/accueil/fond.webp',
  },
  email: '',
  phone: '',
  instagram: '',
  facebook: '',
  copyright: 'Copyright © Yaëlle Lohé - Artiste Mosaïste',
};

export const settings: Site = {
  ...defaults,
  ...site,
  home: { ...defaults.home, ...site.home },
};

/** Valeur d'un réglage « page » (slug, « /contact » ou URL externe) -> URL du site. */
export const pageLink = (value: string) =>
  /^https?:\/\//.test(value)
    ? value
    : pageUrl(`pages/${value.replace(/^\//, '').replace(/^pages\//, '').replace(/\.html$/, '')}.html`);

/** « +33 7 77 20 95 00 » -> « +33777209500 » pour le lien tel: */
export const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
