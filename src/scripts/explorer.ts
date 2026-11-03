// Interactions de la carte : sélection d'un café, zoom, fiche, liste synchronisée, liens profonds.
const ZOOM = 2.4;
const ZOOM_MS = 750; // = --zoom-duration dans global.css
const DRAW_MS = 1600; // durée du tracé origine → torréfaction
const ARRIVAL_PAUSE_MS = 400;
const MOBILE_SHEET_DELAY_MS = 700; // mobile : pause après le zoom avant de passer à la fiche

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise<number>((r) => requestAnimationFrame(r));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function initExplorer() {
  const root = document.querySelector<HTMLElement>('[data-explorer]');
  if (!root) return;

  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const worldBtn = root.querySelector<HTMLButtonElement>('[data-world]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]')!;
  const markers = [...root.querySelectorAll<HTMLAnchorElement>('[data-marker]')];
  const sheets = [...root.querySelectorAll<HTMLElement>('[data-sheet]')];
  const cards = [...document.querySelectorAll<HTMLElement>('[data-card]')];
  const langLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]')];
  const routes = [...root.querySelectorAll<SVGPathElement>('[data-route]')];
  const reveals = [...root.querySelectorAll<SVGPathElement>('[data-reveal]')];
  const mapEl = root.querySelector<HTMLElement>('[data-map]')!;
  const ship = root.querySelector<SVGGElement>('[data-ship]')!;
  const destination = root.querySelector<HTMLElement>('[data-destination]')!;
  const slugs = new Set(sheets.map((s) => s.dataset.sheet!));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const isWide = matchMedia('(min-width: 1000px)') // = breakpoint de .explorer__body;

  let current: string | null = null;
  let zoomed = false;
  let runId = 0; // incrémenté à chaque sélection : annule l'animation en cours

  const markerOf = (slug: string) => markers.find((m) => m.dataset.marker === slug);
  const cardOf = (slug: string) => cards.find((c) => c.dataset.card === slug);

  function setView(x = 50, y = 50, k = 1) {
    // Le point (x, y) en % de la carte est amené au centre, sans laisser de vide sur les bords.
    const clamp = (v: number) => Math.min(0, Math.max(100 - 100 * k, v));
    const tx = clamp(50 - k * x);
    const ty = clamp(50 - k * y);
    zoomed = k > 1;
    stage.style.setProperty('--k', String(k));
    stage.style.transform = k === 1 ? '' : `translate(${tx}%, ${ty}%) scale(${k})`;
  }

  function hideRoutes() {
    for (const r of routes) r.classList.remove('is-visible');
    for (const r of reveals) r.style.strokeDashoffset = '1';
    ship.classList.remove('is-visible');
    root!.classList.remove('is-sailing');
    destination.classList.remove('is-highlight', 'is-arrived');
  }

  function placeShip(route: SVGPathElement, length: number, at: number) {
    const a = route.getPointAtLength(Math.max(0, at - 1));
    const b = route.getPointAtLength(Math.min(length, at + 1));
    const p = route.getPointAtLength(at);
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    const flip = Math.abs(angle) > 90 ? ' scale(1 -1)' : ''; // le cargo reste à l'endroit
    ship.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle})${flip}`);
  }

  /** Vue monde → tracé animé origine → torréfaction (avec cargo) → zoom sur l'origine. */
  async function playRoute(slug: string): Promise<boolean> {
    const id = ++runId;
    hideRoutes();
    const route = routes.find((r) => r.dataset.route === slug)!;
    const reveal = reveals.find((r) => r.dataset.reveal === slug)!;
    const m = markerOf(slug)!;
    const zoomIn = () => setView(Number(m.dataset.x), Number(m.dataset.y), ZOOM);
    route.classList.add('is-visible');

    if (reducedMotion.matches) {
      reveal.style.strokeDashoffset = '0';
      zoomIn();
      return true;
    }
    if (zoomed) {
      setView();
      await wait(ZOOM_MS);
      if (id !== runId) return false;
    }

    const length = route.getTotalLength();
    placeShip(route, length, 0);
    ship.classList.add('is-visible');
    root!.classList.add('is-sailing'); // masque le libellé du pays sur mobile
    destination.classList.add('is-highlight');
    const start = performance.now();
    for (;;) {
      const now = await nextFrame();
      if (id !== runId) return false;
      const t = Math.min(1, (now - start) / DRAW_MS);
      const e = easeInOut(t);
      reveal.style.strokeDashoffset = String(1 - e);
      placeShip(route, length, e * length);
      if (t >= 1) break;
    }
    ship.classList.remove('is-visible');
    root!.classList.remove('is-sailing');
    destination.classList.add('is-arrived');
    await wait(ARRIVAL_PAUSE_MS);
    if (id !== runId) return false;
    zoomIn();
    await wait(ZOOM_MS);
    return id === runId;
  }

  function updateHash(slug: string | null) {
    const hash = slug ? `#${slug}` : '';
    history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
    for (const a of langLinks) a.hash = hash;
  }

  function select(slug: string, { focus = true } = {}) {
    if (!slugs.has(slug)) return;
    current = slug;
    root!.classList.add('has-selection');
    hint.hidden = true;
    worldBtn.hidden = false;

    for (const s of sheets) s.hidden = s.dataset.sheet !== slug;
    for (const m of markers) {
      const on = m.dataset.marker === slug;
      m.classList.toggle('is-active', on);
      if (on) m.setAttribute('aria-current', 'true');
      else m.removeAttribute('aria-current');
    }
    for (const c of cards) c.classList.toggle('is-active', c.dataset.card === slug);

    const sheet = sheets.find((s) => s.dataset.sheet === slug)!;
    const behavior: ScrollBehavior = reducedMotion.matches ? 'auto' : 'smooth';

    // Mobile : la carte et la fiche sont empilées. On montre d'abord la carte pendant
    // l'animation, puis on passe à la fiche après une courte pause.
    if (!isWide.matches) {
      const r = mapEl.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) mapEl.scrollIntoView({ behavior, block: 'center' });
    }
    const run = playRoute(slug);
    const id = runId;
    updateHash(slug);

    if (focus) sheet.querySelector<HTMLElement>('.sheet__title')!.focus({ preventScroll: true });

    if (!isWide.matches) {
      void run.then(async (done) => {
        if (!done) return;
        if (!reducedMotion.matches) await wait(MOBILE_SHEET_DELAY_MS);
        if (id === runId && current === slug) sheet.scrollIntoView({ behavior, block: 'start' });
      });
    }
  }

  function reset() {
    const last = current;
    current = null;
    root!.classList.remove('has-selection');
    hint.hidden = false;
    worldBtn.hidden = true;
    for (const s of sheets) s.hidden = true;
    for (const m of markers) {
      m.classList.remove('is-active');
      m.removeAttribute('aria-current');
    }
    for (const c of cards) c.classList.remove('is-active');
    runId++;
    hideRoutes();
    setView();
    updateHash(null);
    if (last) markerOf(last)?.focus({ preventScroll: true });
  }

  // Marqueurs, flèches précédent/suivant, liens « Voir sur la carte »
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-marker],[data-goto],[data-show],[data-close]');
    if (!el) return;
    e.preventDefault();
    if (el.hasAttribute('data-close')) return reset();
    const slug = el.dataset.marker ?? el.dataset.goto ?? el.dataset.show!;
    if (el.hasAttribute('data-show')) {
      // Sur mobile, select() se charge lui-même de montrer la carte puis la fiche
      if (isWide.matches) root.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      select(slug, { focus: false });
      markerOf(slug)?.focus({ preventScroll: true });
      return;
    }
    if (el.hasAttribute('data-marker') && slug === current) return reset();
    select(slug);
  });

  worldBtn.addEventListener('click', reset);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current) reset();
  });

  // Survol synchronisé carte ↔ liste
  const hover = (slug: string, on: boolean) => {
    markerOf(slug)?.classList.toggle('is-hover', on);
    cardOf(slug)?.classList.toggle('is-hover', on);
  };
  for (const el of [...markers, ...cards]) {
    const slug = el.dataset.marker ?? el.dataset.card!;
    el.addEventListener('mouseenter', () => hover(slug, true));
    el.addEventListener('mouseleave', () => hover(slug, false));
  }

  // Liens profonds : /fr/#ethiopie-guji ouvre directement la fiche
  const fromHash = () => {
    const slug = decodeURIComponent(location.hash.slice(1));
    if (slugs.has(slug)) select(slug, { focus: false });
  };
  window.addEventListener('hashchange', fromHash);

  root.classList.add('is-ready');
  for (const s of sheets) s.hidden = true;
  fromHash();
  if (current) root.scrollIntoView({ block: 'start' });
}
