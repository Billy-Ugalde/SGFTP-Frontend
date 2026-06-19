const KEY = '__pv_scroll_y';

/** Guardar la posición actual de scroll antes de navegar fuera de PublicView. */
export const saveScrollForReturn = (): void => {
  sessionStorage.setItem(KEY, String(Math.round(window.scrollY)));
};

/**
 * Leer y consumir el scroll guardado.
 * Retorna el valor Y guardado, o null si no hay nada guardado.
 * El valor se elimina de sessionStorage al leerlo (uso único).
 */
export const consumeSavedScroll = (): number | null => {
  const raw = sessionStorage.getItem(KEY);
  if (raw === null) return null;
  sessionStorage.removeItem(KEY);
  const y = parseInt(raw, 10);
  return isNaN(y) || y <= 0 ? null : y;
};

/**
 * Salta a la posición Y sin animación, neutralizando `scroll-behavior: smooth`
 * del documento para que la restauración sea completamente instantánea.
 */
export const instantScrollTo = (y: number): void => {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, y);
  html.style.scrollBehavior = prev;
};

