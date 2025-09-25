import React from 'react';
import type { SchoolItem } from '../../services/informativeService';

interface Props {
  data: SchoolItem[];
  /** Descripción opcional editable desde backend: participating_schools.description */
  description?: string;
}

const Schools: React.FC<Props> = ({ data, description }) => {
  return (
    <section className="schools-section section">
      <h2 className="section-title">Escuelas Participantes</h2>

      {/* ✅ si viene descripción del backend, la mostramos; si no, el texto original */}
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {description && description.trim()
          ? description
          : 'Reconocemos el esfuerzo de las escuelas que participan activamente en nuestros programas de reciclaje'}
      </p>

      <div className="schools-grid">
        {data.map((school, index) => (
          <div className="school-card" key={index}>
            <div className="school-header">
              {/* Mantiene el markup/clases originales */}
              <div className="school-img">🏫 {school.name}</div>
            </div>

            <div className="school-content">
              <h3>{school.name}</h3>
              <p>{school.description}</p>

              <div className="school-stats">
                <div className="stat-item">
                  <div className="stat-number">{school.kgRecycled}</div>
                  <div className="stat-label">kg reciclados</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{school.students}</div>
                  <div className="stat-label">estudiantes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{school.participation}%</div>
                  <div className="stat-label">participación</div>
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
