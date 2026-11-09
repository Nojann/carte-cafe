// Coordonnées de contact, protégées des robots :
// - jamais dans le dépôt : lues au build dans CONTACT_EMAIL et PHONE_NUMBER (.env ou secrets GitHub) ;
// - jamais en clair dans le HTML : chaque morceau est inversé puis encodé en base64,
//   et src/scripts/contact.ts ne le décode qu'après un vrai clic.
// Voir docs/configuration-github.md.
import { getSecret } from 'astro:env/server';

/** Morceaux encodés : [partie locale, domaine] pour un e-mail, [numéro] pour un téléphone. */
export type Encoded = string[];

const encode = (s: string) => Buffer.from([...s].reverse().join(''), 'utf8').toString('base64');

const warned = new Set<string>();
function warn(name: string, what: string) {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(`[contact] ${name} absente ou invalide : ${what} masqué (voir docs/configuration-github.md).`);
}

export function contactEmail(): Encoded | null {
  const email = getSecret('CONTACT_EMAIL')?.trim();
  const at = email?.lastIndexOf('@') ?? -1;
  if (!email || at < 1 || at === email.length - 1) {
    warn('CONTACT_EMAIL', 'le bouton e-mail est');
    return null;
  }
  return [encode(email.slice(0, at)), encode(email.slice(at + 1))];
}

export function contactPhone(): Encoded | null {
  const phone = getSecret('PHONE_NUMBER')?.trim();
  // Au moins 6 chiffres ; seuls chiffres, espaces, +, (, ), ., - sont admis.
  if (!phone || !/^\+?[\d\s().-]+$/.test(phone) || phone.replace(/\D/g, '').length < 6) {
    warn('PHONE_NUMBER', 'le bouton téléphone est');
    return null;
  }
  return [encode(phone)];
}
