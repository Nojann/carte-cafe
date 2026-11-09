// Boutons « Afficher l'adresse e-mail » / « Afficher le numéro » : décodés seulement après une vraie interaction.
// Protections contre les robots (en plus de l'encodage fait au build, src/lib/contact.ts) :
// - clic réel uniquement (event.isTrusted) : un .click() lancé par un script ne révèle rien ;
// - délai minimal depuis le chargement : un robot qui clique tout de suite attend… ou part ;
// - lien piège invisible : s'il est activé, la révélation est désactivée sur la page.
import type { CatalogItem } from '../lib/cafes';
import { readCart, weightLabel } from './cart';

const MIN_DELAY_MS = 1500;
const loadedAt = performance.now();
let trapped = false;

const decode = (b64: string) => {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return [...new TextDecoder().decode(bytes)].reverse().join('');
};

/** Corps du mail de commande, à partir du panier et du catalogue embarqué dans la page panier. */
function cartBody(intro: string) {
  const raw = document.querySelector('[data-catalog]')?.textContent;
  if (!raw) return intro;
  const catalog: Record<string, CatalogItem> = JSON.parse(raw);
  const lang = document.documentElement.lang;
  const lines = readCart()
    .filter((l) => catalog[l.id]?.disponible)
    .map(({ id, qty }) => {
      const item = catalog[id];
      return `- ${qty} × ${item.nom} — ${item.roast} — ${weightLabel(item.poids_g, lang)}`;
    });
  return lines.length ? `${intro}\n\n${lines.join('\n')}\n` : intro;
}

function hrefFor(box: HTMLElement, value: string) {
  if (box.dataset.kind === 'phone') return `tel:${value.replace(/[^\d+]/g, '')}`;
  const { subject, cartIntro } = box.dataset;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (cartIntro !== undefined) params.set('body', cartBody(cartIntro));
  // URLSearchParams encode les espaces en « + », que les clients mail n'interprètent pas toujours.
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${value}${query ? `?${query}` : ''}`;
}

function reveal(box: HTMLElement) {
  const parts = box.dataset.parts?.split('.').map(decode);
  if (!parts?.length) return;
  const value = parts.join('@'); // e-mail : partie locale + domaine ; téléphone : un seul morceau

  const link = box.querySelector<HTMLAnchorElement>('[data-contact-link]')!;
  link.href = hrefFor(box, value);
  link.querySelector('[data-contact-value]')!.textContent = value;

  const copy = box.querySelector<HTMLButtonElement>('[data-contact-copy]');
  const status = box.querySelector<HTMLElement>('[data-contact-status]');
  if (copy && navigator.clipboard) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(value);
        if (status) {
          status.textContent = copy.dataset.copied ?? '';
          window.setTimeout(() => (status.textContent = ''), 2500);
        }
      } catch {}
    });
  }

  box.classList.add('is-revealed');
  box.querySelector<HTMLElement>('[data-contact-reveal]')!.hidden = true;
  box.querySelector<HTMLElement>('[data-contact-result]')!.hidden = false;
  link.focus();
}

export function initContact() {
  const boxes = document.querySelectorAll<HTMLElement>('[data-contact-box]');
  if (!boxes.length) return;

  for (const box of boxes) {
    box.querySelector('[data-contact-trap]')?.addEventListener('click', (e) => {
      e.preventDefault();
      trapped = true;
    });

    const btn = box.querySelector<HTMLButtonElement>('[data-contact-reveal]');
    btn?.addEventListener('click', (e) => {
      if (!e.isTrusted || trapped || btn.getAttribute('aria-busy') === 'true') return;
      const wait = MIN_DELAY_MS - (performance.now() - loadedAt);
      if (wait <= 0) return reveal(box);
      btn.setAttribute('aria-busy', 'true');
      window.setTimeout(() => {
        btn.removeAttribute('aria-busy');
        if (!trapped) reveal(box);
      }, wait);
    });
  }
}
