import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/StatsSection.module.css';

type StatItem = {
  key?: string;
  title: string;
  value: string;
  description?: string;
};

interface Props {
  items?: StatItem[];
}

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  reciclaje: 'Materiales recolectados y procesados',
  talleres:  'Realizados por medio de la fundación',
  poblacion: 'Estudiantes alcanzados en programas',
  personas:  'Voluntarios, donadores, emprendedores y aliados',
};

const ARBOLES_DESC =
  'Cada árbol es una acción concreta de transformación en el bosque seco tropical de Guanacaste.';

const parseValue = (val: string): { num: number; suffix: string } => {
  const trimmed = (val ?? '').trim();
  const match = trimmed.match(/^([\d,]+)\s*(.*)/);
  if (!match) return { num: 0, suffix: '' };
  return {
    num: parseInt(match[1].replace(/,/g, ''), 10),
    suffix: match[2].trim(),
  };
};

const StatsSection: React.FC<Props> = ({ items = [] }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const triggered = useRef(false);

  const arbolesItem = items.find(it => it.key === 'arboles');
  const gridItems   = items.filter(it => it.key !== 'arboles');

  /* ── Detectar visibilidad de la sección ── */
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSectionVisible(true); },
      { threshold: 0.35 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Arrancar la animación cuando la sección es visible y hay datos reales ── */
  useEffect(() => {
    const hasData = items.some(it => parseValue(it.value).num > 0);
    if (!sectionVisible || !hasData || triggered.current) return;
    triggered.current = true;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgress(Math.min(step / 60, 1));
      if (step >= 60) clearInterval(timer);
    }, 18);

    return () => clearInterval(timer);
  }, [sectionVisible, items]);

  const displayNum = (val: string): string => {
    const { num } = parseValue(val);
    return Math.round(num * progress).toLocaleString('en-US');
  };

  if (items.length === 0) return null;

  const heroBgNum = arbolesItem
    ? parseValue(arbolesItem.value).num.toLocaleString('en-US')
    : '';

  return (
    <section className={styles.statsSection} id="stats" ref={sectionRef}>

      {/* Número decorativo de fondo */}
      {heroBgNum && (
        <div className={styles.statsBgText} aria-hidden="true">{heroBgNum}</div>
      )}

      <div className={styles.statsInner}>

        {/* ── Columna izquierda: stat héroe (árboles) ── */}
        {arbolesItem && (
          <div className={styles.statsHero}>
            <div className={styles.statsKicker}>02 — Nuestro impacto</div>
            <div className={styles.statsHeroNum}>
              {displayNum(arbolesItem.value)}<em>+</em>
            </div>
            <div className={styles.statsHeroLabel}>
              {arbolesItem.title} — y contando
            </div>
            <p className={styles.statsHeroDesc}>
              {arbolesItem.description || ARBOLES_DESC}
            </p>
            <div className={styles.statsHeroAction}>
              <a href="#propuesta" className={styles.statsHeroLink}>
                Ver propuesta de valor
              </a>
            </div>
          </div>
        )}

        {/* ── Columna derecha: grid 2×2 ── */}
        <div className={styles.statsGrid}>
          {gridItems.map((item, i) => {
            const { suffix } = parseValue(item.value);
            const desc = item.description || DEFAULT_DESCRIPTIONS[item.key ?? ''] || '';
            return (
              <div key={item.key ?? i} className={styles.sg}>
                <div className={styles.sgNum}>
                  {displayNum(item.value)}
                  {suffix && <em>{suffix}</em>}
                </div>
                <div className={styles.sgLabel}>{item.title}</div>
                {desc && <div className={styles.sgDesc}>{desc}</div>}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default StatsSection;
