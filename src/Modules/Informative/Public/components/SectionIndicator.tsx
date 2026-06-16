import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/SectionIndicator.module.css';

const CHAPTERS = [
  { id: 'hero',          label: 'Inicio' },
  { id: 'propuesta',     label: 'Propuesta' },
  { id: 'stats',         label: 'Impacto' },
  { id: 'eventos',       label: 'Próximas' },
  { id: 'proyectos',     label: 'Proyectos' },
  { id: 'realizadas',    label: 'Realizadas' },
  { id: 'fairs',         label: 'Ferias' },
  { id: 'emprendedores', label: 'Emprendedores' },
  { id: 'noticias',      label: 'Noticias' },
  { id: 'involve',       label: 'Involúcrate' },
];

const parseRgba = (s: string): { r: number; g: number; b: number; a: number } | null => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(',').map((p) => parseFloat(p.trim()));
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b, a };
};

const SectionIndicator: React.FC = () => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches;

  const [activeId, setActiveId] = useState<string>('hero');
  const [darkItems, setDarkItems] = useState<boolean[]>(() => CHAPTERS.map(() => true));
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isMobile) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-15% 0px -55% 0px' }
    );

    CHAPTERS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    // El indicador está oculto en mobile (<=960px) — no registrar listeners costosos
    const mq = window.matchMedia('(max-width: 960px)');
    if (mq.matches) return;

    let raf = 0;

    const isDarkBehind = (x: number, y: number): boolean => {
      const nav = navRef.current;
      const stack = document.elementsFromPoint(x, y) as HTMLElement[];
      let el: HTMLElement | null =
        stack.find((e) => !nav || !nav.contains(e)) ?? null;
      while (el) {
        const rgba = parseRgba(getComputedStyle(el).backgroundColor);
        if (rgba && rgba.a > 0.5) {
          const lum = 0.2126 * rgba.r + 0.7152 * rgba.g + 0.0722 * rgba.b;
          return lum < 128;
        }
        el = el.parentElement;
      }
      return false;
    };

    const evaluate = () => {
      raf = 0;
      const next = itemRefs.current.map((node) => {
        if (!node) return false;
        const r = node.getBoundingClientRect();
        return isDarkBehind(r.left + r.width / 2, r.top + r.height / 2);
      });
      setDarkItems((prev) =>
        prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next
      );
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(evaluate); };

    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav ref={navRef} className={styles.indicator} aria-label="Navegación de secciones">
      <div className={styles.line} aria-hidden="true" />
      {CHAPTERS.map(({ id, label }, i) => (
        <button
          key={id}
          ref={(el) => { itemRefs.current[i] = el; }}
          className={`${styles.item} ${activeId === id ? styles.itemActive : ''} ${darkItems[i] ? styles.dark : ''}`}
          onClick={() => scrollTo(id)}
          aria-label={`Ir a ${label}`}
          title={label}
        >
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default SectionIndicator;
