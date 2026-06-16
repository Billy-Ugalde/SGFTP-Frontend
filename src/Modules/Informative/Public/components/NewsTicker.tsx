import React from 'react';
import styles from '../styles/NewsTicker.module.css';

interface NewsTickerProps {
  /** Número de árboles plantados (calculado desde actividades) */
  trees?: number;
  /** Kg de reciclaje recolectados (calculado desde actividades) */
  recycledKg?: number;
  /** Cantidad de talleres realizados (calculado desde actividades) */
  workshops?: number;
  /** Número de estudiantes alcanzados (editable desde módulo informativo) */
  students?: string;
}

const fmt = (n: number) => n.toLocaleString('es-CR');

const NewsTicker: React.FC<NewsTickerProps> = ({
  trees,
  recycledKg,
  workshops,
  students,
}) => {
  const ITEMS = [
    'Tamarindo Park Foundation',
    'Desarrollo Sostenible · Guanacaste',
    trees     != null && trees     > 0 ? `${fmt(trees)} Árboles Plantados`      : null,
    recycledKg != null && recycledKg > 0 ? `${fmt(recycledKg)} KG Reciclados`   : null,
    workshops != null && workshops  > 0 ? `${workshops} Talleres Realizados`    : null,
    students  && students !== '0'        ? `${students} Estudiantes Alcanzados`  : null,
    'Ferias de Artesanos Locales',
    'Voluntariado Activo',
    'tamarindoparkfoundation.org',
  ].filter(Boolean) as string[];

  return (
    <div className={styles.tickerWrap} aria-hidden="true">
      <div className={styles.ticker}>
        <div className={styles.tickerInner}>
          {ITEMS.map((text, i) => (
            <div key={i} className={styles.tickItem}>
              <div className={styles.tickDot} />
              {text}
            </div>
          ))}
        </div>
        <div className={styles.tickerInner}>
          {ITEMS.map((text, i) => (
            <div key={i} className={styles.tickItem}>
              <div className={styles.tickDot} />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
