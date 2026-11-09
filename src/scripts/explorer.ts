// Interactions de la carte : régions de Colombie, cafés, lieux de vente et torréfaction en Suisse,
// zoom guidé dans la loupe Colombie, panneau, liste synchronisée, liens profonds.
// Pas de pan/zoom libre : la molette et le pincement font défiler la page.
const ZOOM = 2.2;
const ZOOM_MS = 750; // = --zoom-duration dans global.css
const MOBILE_SHEET_DELAY_MS = 100; // hors desktop : courte pause après le zoom avant de passer au panneau
const ROASTERY = 'torrefaction'; // slug et ancre de la fiche torréfaction

type Kind = 'region' | 'cafe' | 'place' | 'roastery';
type Selection = { kind: Kind; slug: string };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const hashOf = ({ kind, slug }: Selection) =>
  kind === 'region' ? `region-${slug}` : kind === 'place' ? `lieu-${slug}` : slug;

/** Vrai si l'élément porte une date de fin (événement) déjà passée. */
const isPast = (el: HTMLElement) => !!el.dataset.ends && new Date(el.dataset.ends) < new Date();

export function initExplorer() {
  const root = document.querySelector<HTMLElement>('[data-explorer]');
  if (!root) return;

  const mapEl = root.querySelector<HTMLElement>('[data-map]')!;
  const stage = root.querySelector<HTMLElement>('[data-stage]')!; // loupe Colombie
  const overviewBtn = root.querySelector<HTMLButtonElement>('[data-overview]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]')!;
  const shapes = [...root.querySelectorAll<SVGAElement>('[data-region-shape]')];
  const labels = [...root.querySelectorAll<HTMLElement>('[data-region-label]')];
  const roasteryPin = mapEl.querySelector<HTMLAnchorElement>('[data-roastery]');
  const backBtn = root.querySelector<HTMLButtonElement>('[data-tomap]')!;

  // Événements terminés depuis le dernier build : retirés de la carte et des fiches.
  for (const el of root.querySelectorAll<HTMLElement>('[data-ends]')) if (isPast(el)) el.remove();

  const trucks = [...mapEl.querySelectorAll<HTMLAnchorElement>('[data-place]')];
  const sheets = [...root.querySelectorAll<HTMLElement>('[data-sheet]')];
  const cards = [...document.querySelectorAll<HTMLElement>('[data-card]')];
  const langLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]')];

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const isWide = matchMedia('(min-width: 1000px)'); // = breakpoint de .explorer__body

  let current: Selection | null = null;
  let runId = 0; // incrémenté à chaque sélection : annule le défilement prévu
  let originCard: HTMLElement | null = null; // carte de la liste d'où l'on vient (« Voir sur la carte »)

  const sheetOf = (s: Selection) => sheets.find((el) => el.dataset.kind === s.kind && el.dataset.sheet === s.slug);
  const shapeOf = (slug: string) => shapes.find((m) => m.dataset.region === slug);
  const truckOf = (slug: string) => trucks.find((m) => m.dataset.place === slug);
  const regionOfCafe = (slug: string) => sheetOf({ kind: 'cafe', slug })?.dataset.cafeRegion ?? '';
  const exists = (s: Selection) => !!sheetOf(s);

  function parseHash(hash: string): Selection | null {
    const h = decodeURIComponent(hash.replace(/^#/, ''));
    if (!h) return null;
    const s: Selection =
      h === ROASTERY
        ? { kind: 'roastery', slug: ROASTERY }
        : h.startsWith('region-')
          ? { kind: 'region', slug: h.slice(7) }
          : h.startsWith('lieu-')
            ? { kind: 'place', slug: h.slice(5) }
            : { kind: 'cafe', slug: h };
    return exists(s) ? s : null;
  }

  /** Zoom de la loupe Colombie : le point (x, y), en % de la loupe, est amené au centre. */
  function setView(x = 50, y = 50, k = 1) {
    const clamp = (v: number) => Math.min(0, Math.max(100 - 100 * k, v));
    const tx = clamp(50 - k * x);
    const ty = clamp(50 - k * y);
    stage.style.setProperty('--k', String(k));
    stage.style.transform = k === 1 ? '' : `translate(${tx}%, ${ty}%) scale(${k})`;
  }
  const zoomToRegion = (slug: string) => {
    const s = shapeOf(slug);
    if (s) setView(Number(s.dataset.x), Number(s.dataset.y), ZOOM);
  };

  function highlightRegion(slug: string | null) {
    mapEl.classList.toggle('has-region', !!slug);
    for (const s of shapes) s.classList.toggle('is-active', s.dataset.region === slug);
    for (const l of labels) l.classList.toggle('is-active', l.dataset.regionLabel === slug);
  }

  function setTruck(slug: string | null) {
    for (const el of trucks) {
      const on = !!slug && el.dataset.place === slug;
      el.classList.toggle('is-active', on);
      if (on) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    }
  }

  function setRoastery(on: boolean) {
    roasteryPin?.classList.toggle('is-active', on);
    if (on) roasteryPin?.setAttribute('aria-current', 'true');
    else roasteryPin?.removeAttribute('aria-current');
  }

  function updateHash(s: Selection | null) {
    const hash = s ? (s.kind === 'roastery' ? `#${ROASTERY}` : `#${hashOf(s)}`) : '';
    history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
    for (const a of langLinks) a.hash = hash;
  }

  const behavior = (): ScrollBehavior => (reducedMotion.matches ? 'auto' : 'smooth');

  function select(sel: Selection, { focus = true } = {}) {
    if (!exists(sel)) return;
    const id = ++runId;
    current = sel;
    root!.classList.add('has-selection', 'has-explored');
    hint.hidden = true;
    overviewBtn.hidden = false;
    backBtn.hidden = false;

    const sheet = sheetOf(sel)!;
    for (const s of sheets) s.hidden = s !== sheet;
    const cafe = sel.kind === 'cafe' ? sel.slug : null;
    const region = sel.kind === 'region' ? sel.slug : cafe ? regionOfCafe(cafe) : null;
    highlightRegion(region);
    setTruck(sel.kind === 'place' ? sel.slug : null);
    setRoastery(sel.kind === 'roastery');
    for (const c of cards) c.classList.toggle('is-active', c.dataset.card === cafe);
    if (region) zoomToRegion(region);
    else setView();
    updateHash(sel);
    if (focus) sheet.querySelector<HTMLElement>('.sheet__title')!.focus({ preventScroll: true });

    // Hors desktop, la carte et le panneau sont empilés : on laisse voir le zoom,
    // puis on défile jusqu'au panneau.
    if (!isWide.matches) {
      void wait(reducedMotion.matches ? 0 : ZOOM_MS + MOBILE_SHEET_DELAY_MS).then(() => {
        if (id === runId) sheet.scrollIntoView({ behavior: behavior(), block: 'start' });
      });
    }
  }

  function reset() {
    const last = current;
    current = null;
    runId++;
    root!.classList.remove('has-selection');
    hint.hidden = false;
    overviewBtn.hidden = true;
    backBtn.hidden = true;
    for (const s of sheets) s.hidden = true;
    highlightRegion(null);
    setTruck(null);
    setRoastery(false);
    for (const c of cards) c.classList.remove('is-active');
    setView();
    updateHash(null);
    if (!last) return;
    // Venu de la liste « Tous nos cafés » : on y revient, à la carte d'origine.
    if (originCard) {
      const card = originCard;
      originCard = null;
      card.scrollIntoView({ behavior: behavior(), block: 'center' });
      card.querySelector<HTMLElement>('[data-show]')?.focus({ preventScroll: true });
      return;
    }
    const back =
      last.kind === 'roastery'
        ? roasteryPin
        : last.kind === 'place'
          ? truckOf(last.slug)
          : shapeOf(last.kind === 'cafe' ? regionOfCafe(last.slug) : last.slug);
    back?.focus({ preventScroll: true });
  }

  /** Échap : fiche café → sa région → vue d'ensemble. */
  function up() {
    if (current?.kind === 'cafe') select({ kind: 'region', slug: regionOfCafe(current.slug) });
    else reset();
  }

  const same = (s: Selection) => current?.kind === s.kind && current.slug === s.slug;

  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement | SVGElement>(
      '[data-region],[data-place],[data-goto],[data-goto-place],[data-roastery],[data-show],[data-close],[data-tomap]',
    );
    if (!el || (!root.contains(el) && !el.hasAttribute('data-show'))) return;
    e.preventDefault();
    const d = el.dataset;
    if (d.close !== undefined) return reset();
    if (d.tomap !== undefined) {
      mapEl.scrollIntoView({ behavior: behavior(), block: 'start' });
      return;
    }
    if (d.show) {
      // Liste sous la carte : en desktop on remonte à la carte, ailleurs select() défile jusqu'à la fiche.
      originCard = el.closest<HTMLElement>('[data-card]');
      if (isWide.matches) root.scrollIntoView({ behavior: behavior(), block: 'start' });
      select({ kind: 'cafe', slug: d.show }, { focus: false });
      return;
    }
    const sel: Selection =
      d.roastery !== undefined
        ? { kind: 'roastery', slug: ROASTERY }
        : d.goto
          ? { kind: 'cafe', slug: d.goto }
          : d.gotoPlace
            ? { kind: 'place', slug: d.gotoPlace }
            : d.place
              ? { kind: 'place', slug: d.place }
              : { kind: 'region', slug: d.region! };
    if (mapEl.contains(el)) originCard = null; // nouveau départ depuis la carte
    // Un second clic sur l'élément actif de la carte le désélectionne.
    if (same(sel) && (d.place || d.roastery !== undefined || d.regionShape !== undefined)) return reset();
    select(sel);
  });

  overviewBtn.addEventListener('click', reset);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current) up();
  });

  // Survol : une carte de café ou une région allume la région (et son libellé) sur la carte.
  const hoverRegion = (slug: string, on: boolean) => {
    shapeOf(slug)?.classList.toggle('is-hover', on);
    labels.find((l) => l.dataset.regionLabel === slug)?.classList.toggle('is-hover', on);
  };
  for (const c of cards) {
    const region = () => regionOfCafe(c.dataset.card!);
    c.addEventListener('mouseenter', () => hoverRegion(region(), true));
    c.addEventListener('mouseleave', () => hoverRegion(region(), false));
  }
  for (const s of shapes) {
    const slug = s.dataset.region!;
    s.addEventListener('mouseenter', () => hoverRegion(slug, true));
    s.addEventListener('mouseleave', () => hoverRegion(slug, false));
    s.addEventListener('focus', () => hoverRegion(slug, true));
    s.addEventListener('blur', () => hoverRegion(slug, false));
  }

  // Liens profonds : /fr/#cauca-inza, /fr/#region-cauca, /fr/#lieu-marche-lausanne
  const fromHash = () => {
    const s = parseHash(location.hash);
    if (s && !same(s)) select(s, { focus: false });
  };
  window.addEventListener('hashchange', fromHash);

  root.classList.add('is-ready');
  for (const s of sheets) s.hidden = true;
  fromHash();
  if (current) root.scrollIntoView({ block: 'start' });
}
