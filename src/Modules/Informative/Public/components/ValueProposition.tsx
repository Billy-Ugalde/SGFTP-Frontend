import React from 'react';
import type { ValuePropositionData } from '../../services/informativeService';

type ImpactItem = { label: string; value?: string };
type DimensionItem = { title: string; description?: string };

type ValuePropositionDataBackend = ValuePropositionData & {
  /** Ahora esta sección SOLO consume backend */
  impactItems: ImpactItem[];
  dimensionItems: DimensionItem[];
};

interface Props {
  data: ValuePropositionDataBackend;
}

const ValueProposition: React.FC<Props> = ({ data }) => {
  const { sectionTitle, mission, vision, impactItems, dimensionItems } = data;

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
          <h3>Impacto</h3>
          <div className="impact-list">
            {impactItems.map((item, idx) => (
              <div key={idx} className="impact-item">
                <div className="impact-title">{item.label}</div>
                {item.value ? <div className="impact-sub">{item.value}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="info-card">
          <h3>Dimensiones</h3>
          <div className="impact-list">
            {dimensionItems.map((item, idx) => (
              <div key={idx} className="impact-item">
                <div className="impact-title">{item.title}</div>
                {item.description ? <div className="impact-sub">{item.description}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
