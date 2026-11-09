// Panier : stocké dans le navigateur (localStorage), rien n'est envoyé à un serveur.
// Une ligne = un article « café:torréfaction:poids » et une quantité ; les prix ne sont jamais
// stockés, la page panier les relit dans le catalogue généré au build.

export type CartLine = { id: string; qty: number };

const KEY = 'cart';
export const MAX_QTY = 20;
const CHANGE = 'cart:change';

let memory: CartLine[] = []; // repli si le stockage est bloqué (navigation privée, cookies refusés…)

function isLine(x: unknown): x is CartLine {
  const l = x as CartLine;
  return !!l && typeof l.id === 'string' && Number.isInteger(l.qty) && l.qty > 0;
}

export function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return memory;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLine).map((l) => ({ id: l.id, qty: Math.min(l.qty, MAX_QTY) })) : [];
  } catch {
    return memory;
  }
}

export function writeCart(lines: CartLine[]) {
  memory = lines.filter((l) => l.qty > 0);
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {}
  window.dispatchEvent(new CustomEvent(CHANGE));
}

export function addToCart(id: string, qty = 1) {
  const lines = readCart();
  const line = lines.find((l) => l.id === id);
  if (line) line.qty = Math.min(line.qty + qty, MAX_QTY);
  else lines.push({ id, qty: Math.min(qty, MAX_QTY) });
  writeCart(lines);
}

export function setQty(id: string, qty: number) {
  writeCart(readCart().map((l) => (l.id === id ? { ...l, qty: Math.max(0, Math.min(qty, MAX_QTY)) } : l)));
}

/** Appelle `fn` à chaque changement du panier, y compris depuis un autre onglet. */
export function onCartChange(fn: () => void) {
  window.addEventListener(CHANGE, fn);
  window.addEventListener('storage', (e) => {
    if (e.key === KEY || e.key === null) fn();
  });
}

export const cartCount = () => readCart().reduce((n, l) => n + l.qty, 0);

/** Prix et disponibilité d'un formulaire produit, indexés par « torréfaction:poids ». */
type Offers = Record<string, { price: string; disponible: boolean }>;

/**
 * Formulaires produit (`form[data-product]`) : champs `roast` et `size`, attribut `data-offers` (JSON).
 * Met à jour le prix affiché et désactive les formats épuisés quand la sélection change.
 */
function syncForm(form: HTMLFormElement) {
  const offers: Offers = JSON.parse(form.dataset.offers!);
  const data = new FormData(form);
  const roast = String(data.get('roast'));
  for (const el of form.querySelectorAll<HTMLInputElement | HTMLOptionElement>('input[name=size], select[name=size] option')) {
    const offer = offers[`${roast}:${el.value}`];
    el.disabled = !offer?.disponible;
    // Format absent pour cette torréfaction : masqué.
    (el instanceof HTMLOptionElement ? el : el.closest('label'))?.toggleAttribute('hidden', !offer);
  }
  // Format sélectionné devenu indisponible : on bascule sur le premier disponible.
  const sizeEl = form.elements.namedItem('size');
  const current = offers[`${roast}:${data.get('size')}`];
  if (!current?.disponible) {
    const first = Object.keys(offers).find((k) => k.startsWith(`${roast}:`) && offers[k].disponible);
    if (first) {
      const size = first.split(':')[1];
      if (sizeEl instanceof HTMLSelectElement) sizeEl.value = size;
      else if (sizeEl instanceof RadioNodeList) sizeEl.value = size;
      else if (sizeEl instanceof HTMLInputElement) sizeEl.checked = sizeEl.value === size;
    }
  }
  const offer = offers[`${roast}:${new FormData(form).get('size')}`];
  const priceEl = form.querySelector<HTMLElement>('[data-price]');
  if (priceEl && offer) priceEl.textContent = offer.price;
  const submit = form.querySelector<HTMLButtonElement>('[type=submit]');
  if (submit) submit.disabled = !offer?.disponible;
}

export function weightLabel(g: number, lang: string) {
  return g >= 1000
    ? new Intl.NumberFormat(lang, { style: 'unit', unit: 'kilogram' }).format(g / 1000)
    : new Intl.NumberFormat(lang, { style: 'unit', unit: 'gram' }).format(g);
}

export function initCart() {
  const counts = [...document.querySelectorAll<HTMLElement>('[data-cart-count]')];
  const links = [...document.querySelectorAll<HTMLElement>('[data-cart-link]')];
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  const toastText = toast?.querySelector<HTMLElement>('[data-toast-text]');
  const lang = document.documentElement.lang;
  let toastTimer = 0;

  const refresh = () => {
    const n = cartCount();
    for (const c of counts) {
      c.textContent = String(n);
      c.hidden = n === 0;
    }
    for (const l of links) l.setAttribute('aria-label', l.dataset.label!.replace('{n}', String(n)));
  };

  function confirm(message: string) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast.hidden = true), 5000);
  }
  toast?.querySelector('[data-toast-close]')?.addEventListener('click', () => (toast.hidden = true));

  const added = (template: string | undefined, name: string, g: number) =>
    (template ?? '{item}').replace('{item}', `${name} (${weightLabel(g, lang)})`);

  // Boutons d'ajout rapide : article fixe dans data-item.
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-add-to-cart][data-item]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.item!;
    addToCart(id);
    confirm(added(btn.dataset.added, btn.dataset.name ?? '', Number(id.split(':')[2])));
  });

  // Formulaires produit : torréfaction et format choisis.
  const forms = [...document.querySelectorAll<HTMLFormElement>('form[data-product]')];
  for (const form of forms) {
    syncForm(form);
    form.addEventListener('change', () => syncForm(form));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const size = Number(data.get('size'));
      addToCart(`${form.dataset.product}:${data.get('roast')}:${size}`);
      confirm(added(form.dataset.added, form.dataset.name ?? '', size));
    });
  }

  refresh();
  onCartChange(refresh);
}
