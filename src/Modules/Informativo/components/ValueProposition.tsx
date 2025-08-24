import React from 'react';
import type { ValuePropositionData } from '../services/informativoService';

interface Props {
  data: ValuePropositionData;
}

const ValueProposition: React.FC<Props> = ({ data }) => {
  const { mission, vision, impact, dimensions, sectionTitle } = data;

  return (
    <section className="info-section section">
      <h2 className="section-title">{sectionTitle}</h2>
      <div className="info-cards">
        <div className="info-card">
          <h3>{mission.title}</h3>
          <p>{mission.content}</p>
        </div>
        <div className="info-card">
          <h3>{vision.title}</h3>
          <p>{vision.content}</p>
        </div>
        <div className="info-card">
          <h3>{impact.title}</h3>
          <div className="impact-list">
            {impact.tags.map((tag, index) => (
              <span key={index} className="impact-item">{tag}</span>
            ))}
          </div>
        </div>
        <div className="info-card">
          <h3>{dimensions.title}</h3>
          <div className="impact-list">
            {dimensions.tags.map((tag, index) => (
              <span key={index} className="impact-item">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
