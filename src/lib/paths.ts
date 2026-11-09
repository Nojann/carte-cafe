// Préfixe les chemins internes avec le `base` d'Astro (ex. /carte-cafe pour GitHub Pages).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const withBase = (path: string) => `${base}${path.startsWith('/') ? path : `/${path}`}`;
export const basePath = base;

export const homePath = (lang: string) => withBase(`/${lang}/`);
export const shopPath = (lang: string) => withBase(`/${lang}/boutique/`);
export const cartPath = (lang: string) => withBase(`/${lang}/panier/`);
export const contactPath = (lang: string) => withBase(`/${lang}/contact/`);
export const legalPath = (lang: string) => withBase(`/${lang}/mentions-legales/`);
