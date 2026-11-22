import { getCollection } from 'astro:content';
import { pageUrl } from './assets';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
}

/** Barre du haut : Accueil, puis les pages de contenu qui ont un « menu » (triées par menu_order), puis Contact. */
export async function getMenu(home = false): Promise<MenuItem[]> {
  const pages = (await getCollection('pages')).filter((p) => p.data.menu?.trim());
  pages.sort((a, b) => a.data.menu_order - b.data.menu_order || a.id.localeCompare(b.id));
  return [
    { id: 'home', label: 'Accueil', href: home ? '#' : pageUrl('index.html') },
    ...pages.map((p) => ({ id: p.id, label: p.data.menu!.trim(), href: pageUrl(`pages/${p.id}.html`) })),
    { id: 'contact', label: 'Contact', href: pageUrl('pages/contact.html') },
  ];
}
