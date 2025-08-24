import React from 'react';
import type { InvolveSection } from '../services/informativoService';

interface Props {
  data: InvolveSection;
}

const Involve: React.FC<Props> = ({ data }) => {
  return (
    <section className="forms-section section" id="involve">
      <h2 className="section-title">{data.title}</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>{data.description}</p>
      <div className="forms-grid">
        {data.cards.map((card, index) => (
          <div className="form-card" key={index}>
            <div className="form-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <button className="form-btn">{card.buttonText}</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Involve;
