import React from 'react';
import styles from '../styles/NewsTicker.module.css';

const ITEMS = [
  'Tamarindo Park Foundation',
  'Desarrollo Sostenible · Guanacaste',
  'Ferias de Artesanos Locales',
  'Voluntariado Activo',
  'Protección del Medio Ambiente',
];

const NewsTicker: React.FC = () => (
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

export default NewsTicker;
