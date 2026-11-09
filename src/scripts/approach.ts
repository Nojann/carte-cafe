// « Notre démarche » : l'étape qui croise le milieu de l'écran devient active,
// et la photo collante, le compteur et la frise de progression la suivent.

export function initApproach() {
  const root = document.querySelector<HTMLElement>('[data-journey]');
  if (!root) return;

  const steps = [...root.querySelectorAll<HTMLElement>('[data-journey-step]')];
  const imgs = [...root.querySelectorAll<HTMLElement>('[data-journey-img]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-journey-dot]')];
  const counter = root.querySelector<HTMLElement>('[data-journey-counter]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pad = (n: number) => String(n).padStart(2, '0');
  let current = -1;

  const activate = (i: number) => {
    if (i === current) return;
    current = i;
    steps.forEach((el, j) => el.classList.toggle('is-active', j === i));
    imgs.forEach((el, j) => el.classList.toggle('is-active', j === i));
    dots.forEach((el, j) => {
      el.classList.toggle('is-active', j === i);
      el.classList.toggle('is-done', j < i);
      if (j === i) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    if (counter) counter.textContent = `${pad(i + 1)} / ${pad(steps.length)}`;
    root.style.setProperty('--progress', String(steps.length > 1 ? i / (steps.length - 1) : 1));
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate(steps.indexOf(entry.target as HTMLElement));
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  steps.forEach((el) => io.observe(el));

  // Boutons plutôt que liens #… : l'explorateur de carte écoute les changements de hash.
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      steps[i].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
      activate(i);
    }),
  );

  // Photos de la colonne collante chargées dès que la section approche,
  // sauf si cette colonne est masquée (mobile) : chaque étape a alors sa photo.
  const media = root.querySelector<HTMLElement>('.journey__frame');
  const preload = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || !media?.offsetParent) return;
      imgs.forEach((img) => img.setAttribute('loading', 'eager'));
      preload.disconnect();
    },
    { rootMargin: '600px 0px' },
  );
  preload.observe(root);

  activate(0);
}
