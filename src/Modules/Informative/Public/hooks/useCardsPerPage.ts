import { useEffect, useState } from 'react';

export function useCardsPerPage(desktop = 3, mobileBreakpoint = 768): number {
  const mq = typeof window !== 'undefined'
    ? window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
    : null;

  const [perPage, setPerPage] = useState<number>(() =>
    mq ? (mq.matches ? 1 : desktop) : desktop
  );

  useEffect(() => {
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setPerPage(e.matches ? 1 : desktop);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [desktop, mobileBreakpoint]);

  return perPage;
}
