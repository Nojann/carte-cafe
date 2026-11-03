// Préfixe les chemins internes avec le `base` d'Astro (ex. /carte-cafe pour GitHub Pages).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const withBase = (path: string) => `${base}${path.startsWith('/') ? path : `/${path}`}`;
export const basePath = base;
