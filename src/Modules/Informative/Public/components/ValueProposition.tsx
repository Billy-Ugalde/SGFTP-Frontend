import React, { useEffect, useState } from 'react';
import type { ValuePropositionData } from '../../services/informativeService';
import { getImpactSection, getDimensionesSection } from '../../services/informativeService';

interface Props {
  data: ValuePropositionData;
}

type ImpactItem = { label: string; value: string };
type DimensionItem = { title: string; description: string };

const ValueProposition: React.FC<Props> = ({ data }) => {
  const { mission, vision, sectionTitle } = data;

  const [impactItems, setImpactItems] = useState<ImpactItem[]>([]);
  const [dimensionItems, setDimensionItems] = useState<DimensionItem[]>([]);

  useEffect(() => {
    getImpactSection().then((res) => {
      setImpactItems(res.items || []);
    });

    getDimensionesSection().then((res) => {
      setDimensionItems(res.dimensiones || []);
    });
  }, []);

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
            {(impactItems.length ? impactItems : (data.impact?.tags || []).map(t => ({ label: t, value: '' }))).map((item, idx) => (
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
            {(dimensionItems.length ? dimensionItems : (data.dimensions?.tags || []).map(t => ({ title: t, description: '' }))).map((item, idx) => (
              <div key={idx} className="impact-item">
                <div className="impact-title">{('title' in item ? item.title : '') || ''}</div>
                {('description' in item && item.description) ? <div className="impact-sub">{item.description}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
