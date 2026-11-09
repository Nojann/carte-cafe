// Réglages généraux du site — valeurs EXEMPLE à remplacer.
// L'adresse e-mail de contact n'est PAS ici : variable CONTACT_EMAIL (voir src/lib/contact.ts).
export const site = {
  brand: 'Café La Casita',
  // Point d'arrivée des tracés sur la carte (lieu de torréfaction)
  roastery: { name: 'Lausanne', lat: 46.52, lng: 6.63 },
  instagram: 'https://www.instagram.com/cafe_lacasitadelabuelo/',
  // Mentions légales (Impressum, art. 3 al. 1 let. s LCD) — À COMPLÉTER avant la mise en ligne.
  // Les champs optionnels laissés vides ('') ne sont pas affichés. E-mail et téléphone : secrets CONTACT_EMAIL / PHONE_NUMBER.
  legal: {
    company: '[À COMPLÉTER : raison sociale]',
    legalForm: '[À COMPLÉTER : raison individuelle, Sàrl…]',
    owner: '[À COMPLÉTER : prénom nom du responsable]',
    street: '[À COMPLÉTER : rue et numéro]',
    postcode: '[NPA]',
    city: '[Localité]',
    /** Numéro IDE (CHE-xxx.xxx.xxx), optionnel. */
    uid: '',
    /** Numéro TVA, seulement si assujetti. */
    vat: '',
    /** Inscription au registre du commerce (ex. « Registre du commerce du canton de Vaud »), optionnel. */
    register: '',
    /** Date de dernière mise à jour de la page (AAAA-MM-JJ). */
    updated: '2026-11-09',
  },
};
