// Réglages généraux du site — valeurs EXEMPLE à remplacer.
export const site = {
  brand: 'Café La Casita',
  shopUrl: {
    fr: 'https://boutique.example.com/fr/',
    en: 'https://boutique.example.com/en/',
    es: 'https://boutique.example.com/es/',
  },
  // Point d'arrivée des tracés sur la carte (lieu de torréfaction)
  roastery: { name: 'Lausanne', lat: 46.52, lng: 6.63 },
  contactEmail: 'contact@example.com',
  instagram: 'https://www.instagram.com/',
  // Paramètres ajoutés aux liens « Acheter » pour suivre les clics venant de la carte
  utm: { utm_source: 'carte-origines', utm_medium: 'landing' },
};
