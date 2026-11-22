/**
 * Convertit un chemin d'image repo-relatif LiteEditor (ex: "public/images/galerie/reflet/img.jpg")
 * en URL servable par le site (ex: "/images/galerie/reflet/img.jpg", préfixée par BASE_URL).
 */
export function assetUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\/?public\//, '');
  return encodeURI(`${import.meta.env.BASE_URL}${cleaned}`);
}

/** URL d'une page du site (chemin sans slash initial), préfixée par BASE_URL. */
export function pageUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}
