import React from 'react';
import { Heart, HandCoins, Package, Gift, ArrowRight } from 'lucide-react';
import styles from '../styles/BecomeDonorCTA.module.css';

interface Props {
  onButtonClick: () => void;
}

const BecomeDonorCTA: React.FC<Props> = ({ onButtonClick }) => {
  const donationTypes = [
    {
      icon: <HandCoins size={24} />,
      title: 'Dinero',
      description: 'Contribuciones económicas para financiar nuestros proyectos'
    },
    {
      icon: <Package size={24} />,
      title: 'Artículos',
      description: 'Donaciones de materiales, equipos o artículos útiles'
    },
    {
      icon: <Gift size={24} />,
      title: 'Ropa y Alimentos',
      description: 'Ayuda directa para las familias de nuestra comunidad'
    },
    {
      icon: <Heart size={24} />,
      title: 'Otros',
      description: 'Cualquier tipo de apoyo que puedas brindar'
    }
  ];

  const benefits = [
    'Transparencia total en el uso de las donaciones',
    'Recibos para efectos fiscales (empresas y aliados estratégicos)',
    'Reconocimiento en nuestros canales de comunicación',
    'Informes periódicos sobre el impacto de tu donación'
  ];

  return (
    <section className={styles.ctaSection} id="become-donor">
      <div className={styles.ctaContainer}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaHeader}>
            <h2 className={styles.ctaTitle}>¿Quieres Hacer una Donación?</h2>
            <p className={styles.ctaSubtitle}>
              Tu apoyo nos ayuda a continuar con nuestros proyectos sociales, ambientales y culturales
            </p>
          </div>

          <div className={styles.typesGrid}>
            <h3 className={styles.sectionSubtitle}>Tipos de Donaciones que Aceptamos</h3>
            <div className={styles.donationTypesGrid}>
              {donationTypes.map((type, index) => (
                <div key={index} className={styles.typeCard}>
                  <div className={styles.typeIcon}>{type.icon}</div>
                  <h4 className={styles.typeTitle}>{type.title}</h4>
                  <p className={styles.typeDesc}>{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.benefitsSection}>
            <h3 className={styles.sectionSubtitle}>¿Qué obtienes al donar?</h3>
            <ul className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <li key={index} className={styles.benefitItem}>
                  <span className={styles.benefitCheck}>✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <button className={styles.ctaButton} onClick={onButtonClick}>
            <span>Quiero Hacer una Donación</span>
            <ArrowRight size={20} />
          </button>

          <p className={styles.disclaimer}>
            * Tanto personas como empresas u organizaciones pueden realizar donaciones.
            Puedes elegir el área de impacto: cultural, ambiental o social.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BecomeDonorCTA;
