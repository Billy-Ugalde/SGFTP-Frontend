import React from 'react';
import type { InvolveSection } from '../../services/informativeService';
import { HandHeart, Amphora } from 'lucide-react';
import involveStyles from '../styles/Involve.module.css';

interface Props {
  data: InvolveSection;
  /** Se dispara cuando el usuario hace click en el botón del card "Voluntariado" */
  onVolunteerClick?: () => void;
  onEntrepreneurClick?: () => void;
}

const Involve: React.FC<Props> = ({ data, onVolunteerClick, onEntrepreneurClick }) => {
  return (
    <section className={`${involveStyles.formsSection} section`} id="involve">
      <h2 className="section-title">{data.title}</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>{data.description}</p>

      <div className={involveStyles.formsGrid}>
        {data.cards.map((card, index) => {
          const isVolunteer =
            (card.title ?? '').trim().toLowerCase() === 'voluntariado' ||
            (card.buttonText ?? '').toLowerCase().includes('voluntario');

          const isEntrepreneur =
            (card.title ?? '').trim().toLowerCase() === 'emprendedores' ||
            (card.buttonText ?? '').toLowerCase().includes('emprendedor');

          const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
            // Evita que algún handler externo intercepte el click y cambie de ruta
            e.preventDefault();
            e.stopPropagation();

            if (isVolunteer && onVolunteerClick) {
              onVolunteerClick(); // abre el modal del formulario
            } else if (isEntrepreneur && onEntrepreneurClick) {
              onEntrepreneurClick(); 
            }
            // Si tenés lógica para otros cards (donaciones/aliados), podés agregarla aquí
          };

          const IconComponent = isVolunteer ? HandHeart : isEntrepreneur ? Amphora : null;

          return (
            <div className={involveStyles.formCard} key={index}>
              <div className={involveStyles.formIcon}>
                {IconComponent && <IconComponent size={32} strokeWidth={2} />}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>

              <button
                type="button"
                className={involveStyles.formBtn}
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
