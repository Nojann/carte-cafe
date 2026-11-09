// Colibri du bandeau : vol stationnaire entrecoupé de petits élans dans la zone
// du titre. Si on le touche (tap, clic ou survol à la souris), il s'enfuit puis
// revient se poser ailleurs. En mouvement réduit, il reste immobile et un tap
// le déplace sans animation.

type Point = { x: number; y: number };
type Zone = { x0: number; y0: number; x1: number; y1: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const tr = (p: Point) => `translate(${p.x}px, ${p.y}px)`;

export function initHummingbird() {
  const bird = document.querySelector<HTMLElement>('[data-hummingbird]');
  const host = bird?.parentElement;
  const title = host?.querySelector<HTMLElement>('.hero__title');
  const body = bird?.querySelector<HTMLElement>('.hummingbird__body');
  if (!bird || !host || !title || !body) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let zone: Zone = { x0: 0, y0: 0, x1: 0, y1: 0 };
  let pos: Point = { x: 0, y: 0 };
  let anim: Animation | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fleeing = false;
  let inView = true;
  let intersecting = true;

  // Zone de vol = boîte du titre, relative au conteneur, oiseau compris.
  const measure = () => {
    const h = host.getBoundingClientRect();
    const t = title.getBoundingClientRect();
    const w = bird.offsetWidth;
    const bh = bird.offsetHeight;
    const x0 = Math.max(0, t.left - h.left);
    const x1 = Math.max(x0, Math.min(t.right - h.left, host.clientWidth) - w);
    const y0 = t.top - h.top - bh * 0.4;
    const y1 = Math.max(y0, t.bottom - h.top - bh * 0.6);
    zone = { x0, y0, x1, y1 };
  };

  const clamp = (p: Point): Point => ({
    x: Math.min(zone.x1, Math.max(zone.x0, p.x)),
    y: Math.min(zone.y1, Math.max(zone.y0, p.y)),
  });

  // Point aléatoire assez loin du point actuel pour que le déplacement se voie.
  const pick = (): Point => {
    const minDist = Math.hypot(zone.x1 - zone.x0, zone.y1 - zone.y0) * 0.25;
    let p = pos;
    for (let i = 0; i < 8; i++) {
      p = { x: rand(zone.x0, zone.x1), y: rand(zone.y0, zone.y1) };
      if (Math.hypot(p.x - pos.x, p.y - pos.y) >= minDist) break;
    }
    return p;
  };

  const current = (): Point => {
    const m = new DOMMatrix(getComputedStyle(bird).transform);
    return { x: m.m41, y: m.m42 };
  };

  const place = (p: Point, opacity = 1) => {
    bird.style.transform = tr(p);
    bird.style.opacity = String(opacity);
  };

  const face = (dx: number) => {
    if (Math.abs(dx) > 2) body.style.scale = dx < 0 ? '-1 1' : '';
  };

  const flyTo = (
    to: Point,
    { from = current(), duration = 700, easing = 'cubic-bezier(0.22, 0.8, 0.24, 1)', fromOpacity = 1, toOpacity = 1 } = {},
  ) => {
    face(to.x - from.x);
    anim?.cancel();
    const a = bird.animate(
      [
        { transform: tr(from), opacity: fromOpacity },
        { transform: tr(to), opacity: toOpacity },
      ],
      { duration, easing, fill: 'forwards' },
    );
    anim = a;
    pos = to;
    return a.finished
      .then(() => {
        place(to, toOpacity);
        a.cancel();
        if (anim === a) anim = null;
      })
      .catch(() => {});
  };

  const schedule = () => {
    clearTimeout(timer);
    if (!inView || fleeing || reduced.matches) return;
    timer = setTimeout(async () => {
      await flyTo(pick(), { duration: rand(600, 900) });
      schedule();
    }, rand(1800, 4000));
  };

  const flee = async () => {
    if (fleeing) return;
    if (reduced.matches) {
      measure();
      pos = pick();
      place(pos);
      return;
    }
    fleeing = true;
    clearTimeout(timer);

    // Fuite vers le haut, du côté opposé au centre du titre.
    const from = current();
    const dir = from.x < (zone.x0 + zone.x1) / 2 ? -1 : 1;
    const out = { x: from.x + dir * rand(120, 220), y: from.y - rand(100, 180) };
    await flyTo(out, { from, duration: 450, easing: 'cubic-bezier(0.5, 0, 0.9, 0.4)', toOpacity: 0 });

    await wait(1000);
    measure();
    const target = pick();
    const side = Math.random() < 0.5 ? -1 : 1;
    const entry = { x: target.x + side * 160, y: target.y - 60 };
    await flyTo(target, { from: entry, duration: 850, fromOpacity: 0 });

    fleeing = false;
    schedule();
  };

  const updateInView = () => {
    inView = intersecting && !document.hidden;
    bird.classList.toggle('is-paused', !inView);
    if (inView) schedule();
    else clearTimeout(timer);
  };

  bird.addEventListener('pointerdown', flee);
  bird.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') flee();
  });

  // Titre redimensionné (polices chargées, rotation, fenêtre) : on reste dans la zone.
  new ResizeObserver(() => {
    measure();
    if (fleeing) return;
    anim?.cancel();
    anim = null;
    pos = clamp(pos);
    place(pos);
  }).observe(title);

  new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting;
    updateInView();
  }).observe(title);
  document.addEventListener('visibilitychange', updateInView);
  reduced.addEventListener('change', schedule);

  measure();
  pos = { x: zone.x1, y: zone.y0 + (zone.y1 - zone.y0) * 0.35 };
  place(pos);
  schedule();
}
