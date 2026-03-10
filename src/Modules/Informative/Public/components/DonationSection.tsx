import React from 'react';
import styles from '../styles/DonationSection.module.css';

interface Props {
  onDonateClick: () => void;
}

const DonationSection: React.FC<Props> = ({ onDonateClick }) => {
  return (
    <section className={styles.donationSection} id="donaciones">
      <div className={styles.content}>
        <p className={styles.eyebrow}>Contribuye con nosotros</p>

        <h2 className={styles.title}>Haz la diferencia con tu donación</h2>

        <div className={styles.divider} />

        <p className={styles.description}>
          Tu apoyo impulsa el desarrollo cultural, ambiental y social de nuestra comunidad.
          Víveres, ropa, dinero u otros artículos — cada contribución suma.
          Únete a nuestra red de donantes y aliados estratégicos.
        </p>

        <button
          type="button"
          className={styles.donateBtn}
          onClick={onDonateClick}
        >
          Donar ahora
        </button>
      </div>
    </section>
  );
};

export default DonationSection;
