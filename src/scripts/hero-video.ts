// Vidéo du bandeau : chargée seulement après la page, jamais si l'utilisateur
// réduit les animations ou économise ses données. Sinon, le poster suffit.

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

function shouldPlay(): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  if (conn?.saveData) return false;
  const slow = conn?.effectiveType && /(^|-)(2g|3g)$/.test(conn.effectiveType);
  if (slow && matchMedia('(max-width: 899px)').matches) return false;
  return true;
}

export function initHeroVideo() {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (!video?.dataset.src || !shouldPlay()) return;

  const start = () => {
    video.src = video.dataset.src!;

    // Lecture uniquement quand le bandeau est visible.
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }).observe(video);
  };

  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 200));
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}
