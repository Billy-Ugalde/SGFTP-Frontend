import React from 'react';
import type { InvolveSection } from '../../services/informativeService';
import involveStyles from '../styles/Involve.module.css';

interface Props {
  data: InvolveSection;
  /** Se dispara cuando el usuario hace click en el botón del card "Voluntariado" */
  onVolunteerClick?: () => void;
  onEntrepreneurClick?: () => void;
  onDonorClick?: () => void;
}

const Involve: React.FC<Props> = ({ data, onVolunteerClick, onEntrepreneurClick, onDonorClick }) => {
  return (
    <section className={involveStyles.involveSection} id="involve">
      {data.cards.map((card, index) => {
        const isVolunteer =
          (card.title ?? '').trim().toLowerCase() === 'voluntariado' ||
          (card.buttonText ?? '').toLowerCase().includes('voluntario');

        const isEntrepreneur =
          (card.title ?? '').trim().toLowerCase() === 'emprendedores' ||
          (card.buttonText ?? '').toLowerCase().includes('emprendedor');

        const isDonor =
          (card.title ?? '').trim().toLowerCase() === 'donaciones' ||
          (card.buttonText ?? '').toLowerCase().includes('donar') ||
          (card.buttonText ?? '').toLowerCase().includes('donación');

        const handleAction = () => {
          if (isVolunteer && onVolunteerClick) onVolunteerClick();
          else if (isEntrepreneur && onEntrepreneurClick) onEntrepreneurClick();
          else if (isDonor && onDonorClick) onDonorClick();
        };

        const num = String(index + 1).padStart(2, '0');

        return (
          <div
            key={index}
            className={involveStyles.invBand}
            onClick={handleAction}
          >
            <div className={involveStyles.invBandOver} />
            <div className={involveStyles.invBandContent}>
              <div className={involveStyles.invBandNum} aria-hidden="true">{num}</div>
              <div className={involveStyles.invBandText}>
                <div className={involveStyles.invBandLabel}>{card.title}</div>
                <h3 className={involveStyles.invBandTitle}>{card.title}</h3>
                <p className={involveStyles.invBandDesc}>{card.description}</p>
              </div>
              <button
                type="button"
                className={involveStyles.invBandCta}
                onClick={(e) => { e.stopPropagation(); handleAction(); }}
              >
                {card.buttonText}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default Involve;
