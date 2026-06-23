import React from 'react';
import { Store, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import styles from '../styles/BecomeEntrepreneurCTA.module.css';

interface Props {
  onButtonClick: () => void;
}

const BecomeEntrepreneurCTA: React.FC<Props> = ({ onButtonClick }) => {
  const benefits = [
    {
      icon: <Store size={24} />,
      title: 'Participa en Ferias',
      description: 'Accede a eventos y ferias para promocionar tu emprendimiento'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Impulsa tu Negocio',
      description: 'Recibe visibilidad y conecta con nuevos clientes'
    },
    {
      icon: <Users size={24} />,
      title: 'Red de Apoyo',
      description: 'Forma parte de una comunidad de emprendedores locales'
    },
    {
      icon: <Award size={24} />,
      title: 'Certificación',
      description: 'Obtén reconocimiento y validación para tu emprendimiento'
    }
  ];

  const steps = [
    'Completa el formulario de registro',
    'Espera la aprobación de tu perfil',
    'Comienza a participar en ferias y eventos'
  ];

  return (
    <section className={styles.ctaSection} id="become-entrepreneur">
      <div className={styles.ctaContainer}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaHeader}>
            <div className="section-kicker">11 — Emprendimiento</div>
            <h2 className={styles.ctaTitle}>¿Tienes un Emprendimiento?</h2>
            <p className={styles.ctaSubtitle}>
              Únete a nuestra comunidad de emprendedores locales y lleva tu negocio al siguiente nivel
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{benefit.icon}</div>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitDesc}>{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.stepsSection}>
            <h3 className={styles.stepsTitle}>¿Cómo participar?</h3>
            <div className={styles.stepsList}>
              {steps.map((step, index) => (
                <div key={index} className={styles.stepItem}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <p className={styles.stepText}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <button className={styles.ctaButton} onClick={onButtonClick}>
            <span>Registrarme como Emprendedor</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BecomeEntrepreneurCTA;
