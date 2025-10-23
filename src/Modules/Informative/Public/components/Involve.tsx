import React from 'react';
import type { InvolveSection } from '../../services/informativeService';

interface Props {
  data: InvolveSection;
  /** Se dispara cuando el usuario hace click en el botón del card "Voluntariado" */
  onVolunteerClick?: () => void;
}

const Involve: React.FC<Props> = ({ data, onVolunteerClick }) => {
  return (
    <section className="forms-section section" id="involve">
      <h2 className="section-title">{data.title}</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>{data.description}</p>

      <div className="forms-grid">
        {data.cards.map((card, index) => {
          const isVolunteer =
            (card.title ?? '').trim().toLowerCase() === 'voluntariado' ||
            (card.buttonText ?? '').toLowerCase().includes('voluntario');

          const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
            // Evita que algún handler externo intercepte el click y cambie de ruta
            e.preventDefault();
            e.stopPropagation();

            if (isVolunteer && onVolunteerClick) {
              onVolunteerClick(); // abre el modal del formulario
            }
            // Si tenés lógica para otros cards (donaciones/aliados), podés agregarla aquí
          };

          return (
            <div className="form-card" key={index}>
              <div className="form-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>

              <button
                type="button"
                className="form-btn"
                onClick={handleClick}
              >
                {card.buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Involve;
