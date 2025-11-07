import React from 'react';
import type { ValuePropositionData } from '../../services/informativeService';
import valuePropStyles from '../styles/ValueProposition.module.css';

type ImpactItem = { label: string; value?: string };
type DimensionItem = { title: string; description?: string };

type ValuePropositionDataBackend = ValuePropositionData & {
  impactItems: ImpactItem[];
  dimensionItems: DimensionItem[];
};

interface Props {
  data: ValuePropositionDataBackend;
}

const ValueProposition: React.FC<Props> = ({ data }) => {
  const { sectionTitle, mission, vision, impactItems, dimensionItems } = data;

  return (
    <section className={`${valuePropStyles.infoSection} section`}>
      <h2 className="section-title">{sectionTitle}</h2>

      <div className={valuePropStyles.infoCards}>
        <div className={valuePropStyles.infoCard}>
          <h3>{mission.title}</h3>
          <p>{mission.content}</p>
        </div>

        <div className={valuePropStyles.infoCard}>
          <h3>{vision.title}</h3>
          <p>{vision.content}</p>
        </div>

        <div className={valuePropStyles.infoCard}>
          <h3>Impacto</h3>
          <div className={valuePropStyles.impactList}>
            {impactItems.map((item, idx) => (
              <div key={idx} className={valuePropStyles.impactItem}>
                <div className={valuePropStyles.impactTitle}>{item.label}</div>
                {item.value ? <div className={valuePropStyles.impactSub}>{item.value}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className={valuePropStyles.infoCard}>
          <h3>Dimensiones</h3>
          <div className={valuePropStyles.impactList}>
            {dimensionItems.map((item, idx) => (
              <div key={idx} className={valuePropStyles.impactItem}>
                <div className={valuePropStyles.impactTitle}>{item.title}</div>
                {item.description ? <div className={valuePropStyles.impactSub}>{item.description}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;