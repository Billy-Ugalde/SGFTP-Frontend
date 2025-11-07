import React from 'react';
import type { SchoolItem } from '../../services/informativeService';
import schoolsStyles from '../styles/Schools.module.css';

interface Props {
  data: SchoolItem[];
  /** Descripción opcional editable desde backend: participating_schools.description */
  description?: string;
}

const Schools: React.FC<Props> = ({ data, description }) => {
  return (
    <section className={`${schoolsStyles.schoolsSection} section`}>
      <h2 className={schoolsStyles.sectionTitle}>Escuelas Participantes</h2>

      {/* ✅ si viene descripción del backend, la mostramos; si no, el texto original */}
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {description && description.trim()
          ? description
          : 'Reconocemos el esfuerzo de las escuelas que participan activamente en nuestros programas de reciclaje'}
      </p>

      <div className={schoolsStyles.schoolsGrid}>
        {data.map((school, index) => (
          <div className={schoolsStyles.schoolCard} key={index}>
            <div className={schoolsStyles.schoolHeader}>
              {/* Mantiene el markup/clases originales */}
              <div className={schoolsStyles.schoolImg}>🏫 {school.name}</div>
            </div>

            <div className={schoolsStyles.schoolContent}>
              <h3>{school.name}</h3>
              <p>{school.description}</p>

              <div className={schoolsStyles.schoolStats}>
                <div className={schoolsStyles.statItem}>
                  <div className={schoolsStyles.statNumber}>{school.kgRecycled}</div>
                  <div className={schoolsStyles.statLabel}>kg reciclados</div>
                </div>
                <div className={schoolsStyles.statItem}>
                  <div className={schoolsStyles.statNumber}>{school.students}</div>
                  <div className={schoolsStyles.statLabel}>estudiantes</div>
                </div>
                <div className={schoolsStyles.statItem}>
                  <div className={schoolsStyles.statNumber}>{school.participation}%</div>
                  <div className={schoolsStyles.statLabel}>participación</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Schools;
