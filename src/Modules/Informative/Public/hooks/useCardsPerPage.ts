import { useEffect, useState } from 'react';

export function useCardsPerPage(desktop = 3, mobileBreakpoint = 768): number {
  const [perPage, setPerPage] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth <= mobileBreakpoint ? 1 : desktop
  );

  useEffect(() => {
    const onResize = () =>
      setPerPage(window.innerWidth <= mobileBreakpoint ? 1 : desktop);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [desktop, mobileBreakpoint]);

  return perPage;
}
