import React from 'react';
import { Heart, Users, Calendar, Award, ArrowRight } from 'lucide-react';
import styles from '../styles/BecomeVolunteerCTA.module.css';

interface Props {
  onButtonClick: () => void;
}

const BecomeVolunteerCTA: React.FC<Props> = ({ onButtonClick }) => {
  const benefits = [
    {
      icon: <Heart size={24} />,
      title: 'Genera Impacto',
      description: 'Contribuye directamente al bienestar de tu comunidad'
    },
    {
      icon: <Users size={24} />,
      title: 'Conoce Personas',
      description: 'Conecta con otros voluntarios y amplía tu red de contactos'
    },
    {
      icon: <Calendar size={24} />,
      title: 'Horarios Flexibles',
      description: 'Participa en actividades que se ajusten a tu disponibilidad'
    },
    {
      icon: <Award size={24} />,
      title: 'Desarrollo Personal',
      description: 'Aprende nuevas habilidades y gana experiencia valiosa'
    }
  ];

  const steps = [
    'Completa el formulario de registro',
    'Explora las actividades disponibles',
    'Inscríbete en las que te interesen'
  ];

  return (
    <section className={styles.ctaSection} id="become-volunteer">
      <div className={styles.ctaContainer}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaHeader}>
            <h2 className={styles.ctaTitle}>¿Quieres Ser Voluntario?</h2>
            <p className={styles.ctaSubtitle}>
              Únete a nuestro equipo de voluntarios y ayuda a construir un futuro mejor para tu comunidad
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
            <span>Registrarme como Voluntario</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BecomeVolunteerCTA;
