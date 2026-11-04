import site from '../data/site.json';

/** Réglages généraux (éditables dans LiteEditor : src/data/site.json). Les champs vides sont ignorés. */
export interface Site {
  homeBackground: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
}

export const settings: Site = {
  homeBackground: 'public/images/accueil/fond.webp',
  email: '',
  phone: '',
  instagram: '',
  facebook: '',
  ...site,
};

/** « +33 7 77 20 95 00 » -> « +33777209500 » pour le lien tel: */
export const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
