import React from 'react';
import { Sprout, Users, CalendarDays, Star } from 'lucide-react';
import styles from '../styles/BecomeVolunteerCTA.module.css';

interface Props {
  onButtonClick: () => void;
}

const BecomeVolunteerCTA: React.FC<Props> = ({ onButtonClick }) => {
  const benefits = [
    { icon: <Sprout size={26} />,       title: 'Genera Impacto',    description: 'Contribuye directamente al bienestar de tu comunidad' },
    { icon: <Users size={26} />,        title: 'Conoce Personas',   description: 'Conecta con otros voluntarios y amplía tu red de contactos' },
    { icon: <CalendarDays size={26} />, title: 'Horarios Flexibles', description: 'Participa en actividades que se ajusten a tu disponibilidad' },
    { icon: <Star size={26} />,         title: 'Desarrollo Personal', description: 'Aprende nuevas habilidades y gana experiencia valiosa' },
  ];

  const steps = [
    { title: 'Regístrate', text: 'Completa el formulario de registro' },
    { title: 'Explora',    text: 'Explora las actividades disponibles' },
    { title: 'Participa',  text: 'Inscríbete en las que te interesen' },
  ];

  return (
    <section className={styles.ctaSection} id="become-volunteer">
      <div className={styles.ctaContainer}>

        <div className={styles.volIntro}>
          <div>
            <div className={styles.ctaKicker}>07 — Voluntariado</div>
            <h2 className={styles.ctaTitle}>
              <strong>¿Quieres ser</strong><br /><em>voluntario?</em>
            </h2>
            <p className={styles.ctaLead}>
              Únete a nuestro equipo de voluntarios y ayuda a construir un futuro mejor para tu comunidad
            </p>
            <button className={styles.ctaButton} onClick={onButtonClick}>
              Registrarme como voluntario →
            </button>
          </div>

          <div className={styles.benefitsCol}>
            <div className={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <div key={index} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>{benefit.icon}</div>
                  <h4 className={styles.benefitTitle}>{benefit.title}</h4>
                  <p className={styles.benefitDesc}>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.stepsWrapper}>
          <p className={styles.stepsTitle}>¿Cómo participar?</p>
          <div className={styles.stepsList}>
            {steps.map((step, index) => (
              <div key={index} className={styles.stepItem}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default BecomeVolunteerCTA;
