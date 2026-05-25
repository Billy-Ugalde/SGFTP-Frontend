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

const SectionIndicator: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('hero');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={styles.indicator} aria-label="Navegación de secciones">
      <div className={styles.line} aria-hidden="true" />
      {CHAPTERS.map(({ id, label }) => (
        <button
          key={id}
          className={`${styles.item} ${activeId === id ? styles.itemActive : ''}`}
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
