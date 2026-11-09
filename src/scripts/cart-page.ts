// Page panier : affiche les lignes du panier à partir du catalogue embarqué dans la page.
import type { CatalogItem } from '../lib/cafes';
import { MAX_QTY, onCartChange, readCart, setQty, weightLabel, writeCart } from './cart';

type Strings = { remove: string; removeItem: string; qty: string; less: string; more: string; shop: string };

const json = <T>(root: HTMLElement, sel: string): T => JSON.parse(root.querySelector(sel)!.textContent!);

/** Crée un élément avec ses attributs ; le texte passe par textContent (jamais d'HTML injecté). */
function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, text?: string) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initCartPage() {
  const root = document.querySelector<HTMLElement>('[data-cart]');
  if (!root) return;
  const catalog = json<Record<string, CatalogItem>>(root, '[data-catalog]');
  const s = json<Strings>(root, '[data-strings]');
  const lang = document.documentElement.lang;

  const list = root.querySelector<HTMLElement>('[data-cart-lines]')!;
  const empty = root.querySelector<HTMLElement>('[data-cart-empty]')!;
  const full = root.querySelector<HTMLElement>('[data-cart-full]')!;
  const subtotal = root.querySelector<HTMLElement>('[data-cart-subtotal]')!;
  const notice = root.querySelector<HTMLElement>('[data-cart-notice]')!;

  const money = (n: number, devise: string) => new Intl.NumberFormat(lang, { style: 'currency', currency: devise }).format(n);

  function render() {
    const lines = readCart();
    // Articles retirés du catalogue ou épuisés depuis l'ajout : on les enlève et on prévient.
    const valid = lines.filter((l) => catalog[l.id]?.disponible);
    if (valid.length !== lines.length) {
      notice.hidden = false;
      writeCart(valid); // déclenche un nouveau rendu, identique, une fois l'écouteur posé
    }

    empty.hidden = valid.length > 0;
    full.hidden = valid.length === 0;

    // Garde le focus sur le même contrôle après un nouveau rendu (boutons − / +).
    const focused = document.activeElement as HTMLElement | null;
    const focusKey = focused?.dataset.focusKey;

    list.replaceChildren(
      ...valid.map(({ id, qty }) => {
        const item = catalog[id];
        const weight = weightLabel(item.poids_g, lang);
        const li = el('li', { class: 'cart-line' });

        const media = el('a', { class: 'cart-line__media', href: `${s.shop}#${item.slug}`, tabindex: '-1', 'aria-hidden': 'true' });
        if (item.photo) media.append(el('img', { src: item.photo, alt: '', width: '160', height: '100', loading: 'lazy' }));
        li.append(media);

        const info = el('div', { class: 'cart-line__info' });
        const title = el('a', { class: 'cart-line__title', href: `${s.shop}#${item.slug}` }, item.nom);
        info.append(title, el('p', { class: 'cart-line__meta' }, `${item.roast} · ${weight}`));
        info.append(el('p', { class: 'cart-line__unit' }, money(item.montant, item.devise)));
        li.append(info);

        const stepper = el('div', { class: 'stepper', role: 'group', 'aria-label': `${s.qty} : ${item.nom}, ${weight}` });
        const less = el('button', { type: 'button', class: 'icon-btn', 'aria-label': s.less, 'data-focus-key': `${id}:less` }, '−');
        const value = el('output', { class: 'stepper__value', 'aria-live': 'polite' }, String(qty));
        const more = el('button', { type: 'button', class: 'icon-btn', 'aria-label': s.more, 'data-focus-key': `${id}:more` }, '+');
        less.addEventListener('click', () => setQty(id, qty - 1));
        more.addEventListener('click', () => setQty(id, qty + 1));
        if (qty <= 1) less.setAttribute('disabled', '');
        if (qty >= MAX_QTY) more.setAttribute('disabled', '');
        stepper.append(less, value, more);
        li.append(stepper);

        li.append(el('p', { class: 'cart-line__total' }, money(item.montant * qty, item.devise)));

        const remove = el('button', { type: 'button', class: 'link cart-line__remove', 'aria-label': s.removeItem.replace('{item}', `${item.nom}, ${weight}`) }, s.remove);
        remove.addEventListener('click', () => {
          setQty(id, 0);
          // Le bouton disparaît : on rend le focus à la ligne suivante, ou au titre.
          (list.querySelector<HTMLElement>('.cart-line__title') ?? document.querySelector<HTMLElement>('h1'))?.focus();
        });
        li.append(remove);
        return li;
      }),
    );

    if (focusKey) list.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focusKey)}"]`)?.focus();

    // Une seule devise aujourd'hui (CHF) : sous-total dans la devise du premier article.
    const devise = valid[0] ? catalog[valid[0].id].devise : 'CHF';
    subtotal.textContent = money(valid.reduce((sum, l) => sum + catalog[l.id].montant * l.qty, 0), devise);
  }

  render();
  onCartChange(render);
}
