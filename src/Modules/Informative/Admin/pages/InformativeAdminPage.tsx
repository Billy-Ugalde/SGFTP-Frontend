import React, { useEffect, useState } from 'react';
import '../styles/informative-admin-page.css';
import { useNavigate } from 'react-router-dom';
import {
  getHeroSection,
  getValueProposition,
  getInvolucrateSection,
  getImpactSection,
  getDimensionesSection,
  getNewsletter,
} from '../../services/informativeService';

import type {
  InvolveSection,
  ImpactSection,
  DimensionSection,
} from '../../services/informativeService';

const InformativeAdminPage: React.FC = () => {
  const navigate = useNavigate();

  const [hero, setHero] = useState({ title: '', subtitle: '', description: '' });

  const [propuesta, setPropuesta] = useState({
    sectionTitle: '',
    mission: { title: '', content: '' },
    vision: { title: '', content: '' },
  });

  const [involucrate, setInvolucrate] = useState<InvolveSection>({
     id: '',
    title: '',
    description: '',
    cards: [],
  });

  const [impacto, setImpacto] = useState<ImpactSection>({
    title: '',
    items: [],
  });

  const [dimensiones, setDimensiones] = useState<DimensionSection>({
    title: '',
    dimensiones: [],
  });

  const [mantente, setMantente] = useState({
    title: '',
    description: '',
    disclaimer: '',
    placeholder: '',
    buttonText: '',
  });

  useEffect(() => {
    getHeroSection().then(setHero);
    getValueProposition().then(setPropuesta);
    getInvolucrateSection().then(setInvolucrate);
    getImpactSection().then(setImpacto);
    getDimensionesSection().then(setDimensiones);
    getNewsletter().then(setMantente);
  }, []);

  const handleSave = () => {
    localStorage.setItem('heroSection', JSON.stringify(hero));
    localStorage.setItem('valueProposition', JSON.stringify(propuesta));
    localStorage.setItem('involucrateSection', JSON.stringify(involucrate));
    localStorage.setItem('impactSection', JSON.stringify(impacto));
    localStorage.setItem('dimensionesSection', JSON.stringify(dimensiones));
    localStorage.setItem('mantenteInformadoSection', JSON.stringify(mantente));
    alert('Cambios guardados correctamente');
  };

  return (
    <section className="section" style={{ minHeight: '100vh', background: 'var(--light-cream)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title">Editar Contenido del Informative</h2>
        <button
          className="newsletter-btn"
          onClick={() => navigate('/admin/dashboard')}
          style={{ backgroundColor: 'var(--primary-dark)' }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* === HERO === */}
      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h3 className="section-subtitle">Sección Hero</h3>
        <input className="info-input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
        <input className="info-input" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        <textarea className="info-input" value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} />
      </div>

      {/* === PROPUESTA DE VALOR === */}
      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h3 className="section-subtitle">Nuestra Propuesta de Valor</h3>
        <input
          className="info-input"
          value={propuesta.sectionTitle}
          onChange={(e) => setPropuesta({ ...propuesta, sectionTitle: e.target.value })}
        />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <input
              className="info-input"
              value={propuesta.mission.title}
              onChange={(e) => setPropuesta({ ...propuesta, mission: { ...propuesta.mission, title: e.target.value } })}
            />
            <textarea
              className="info-input"
              value={propuesta.mission.content}
              onChange={(e) => setPropuesta({ ...propuesta, mission: { ...propuesta.mission, content: e.target.value } })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input
              className="info-input"
              value={propuesta.vision.title}
              onChange={(e) => setPropuesta({ ...propuesta, vision: { ...propuesta.vision, title: e.target.value } })}
            />
            <textarea
              className="info-input"
              value={propuesta.vision.content}
              onChange={(e) => setPropuesta({ ...propuesta, vision: { ...propuesta.vision, content: e.target.value } })}
            />
          </div>
        </div>
      </div>

      {/* === INVOLÚCRATE === */}
      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h3 className="section-subtitle">¡Involúcrate con Nosotros!</h3>
        <input className="info-input" value={involucrate.title} onChange={(e) => setInvolucrate({ ...involucrate, title: e.target.value })} />
        <textarea className="info-input" value={involucrate.description} onChange={(e) => setInvolucrate({ ...involucrate, description: e.target.value })} />
        {involucrate.cards.map((card, idx) => (
          <div key={card.id} style={{ marginTop: '1rem' }}>
            <input
              className="info-input"
              value={card.title}
              onChange={(e) => {
                const cards = [...involucrate.cards];
                cards[idx].title = e.target.value;
                setInvolucrate({ ...involucrate, cards });
              }}
            />
            <textarea
              className="info-input"
              value={card.description}
              onChange={(e) => {
                const cards = [...involucrate.cards];
                cards[idx].description = e.target.value;
                setInvolucrate({ ...involucrate, cards });
              }}
            />
            <input
              className="info-input"
              value={card.buttonText}
              onChange={(e) => {
                const cards = [...involucrate.cards];
                cards[idx].buttonText = e.target.value;
                setInvolucrate({ ...involucrate, cards });
              }}
            />
          </div>
        ))}
      </div>

      {/* === IMPACTO === */}
      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h3 className="section-subtitle">Impacto</h3>
        <input className="info-input" value={impacto.title} onChange={(e) => setImpacto({ ...impacto, title: e.target.value })} />
        {impacto.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
            <input
              className="info-input"
              value={item.label}
              onChange={(e) => {
                const items = [...impacto.items];
                items[idx].label = e.target.value;
                setImpacto({ ...impacto, items });
              }}
            />
            <input
              className="info-input"
              value={item.value}
              onChange={(e) => {
                const items = [...impacto.items];
                items[idx].value = e.target.value;
                setImpacto({ ...impacto, items });
              }}
            />
          </div>
        ))}
      </div>

      {/* === DIMENSIONES === */}
      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h3 className="section-subtitle">Dimensiones</h3>
        <input className="info-input" value={dimensiones.title} onChange={(e) => setDimensiones({ ...dimensiones, title: e.target.value })} />
        {dimensiones.dimensiones.map((dim, idx) => (
          <div key={idx} style={{ marginTop: '1rem' }}>
            <input
              className="info-input"
              value={dim.title}
              onChange={(e) => {
                const dimensionesArray = [...dimensiones.dimensiones];
                dimensionesArray[idx].title = e.target.value;
                setDimensiones({ ...dimensiones, dimensiones: dimensionesArray });
              }}
            />
            <textarea
              className="info-input"
              value={dim.description}
              onChange={(e) => {
                const dimensionesArray = [...dimensiones.dimensiones];
                dimensionesArray[idx].description = e.target.value;
                setDimensiones({ ...dimensiones, dimensiones: dimensionesArray });
              }}
            />
          </div>
        ))}
      </div>

      {/* === MANTENTE INFORMADO === */}
      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h3 className="section-subtitle">Mantente Informado</h3>
        <input className="info-input" value={mantente.title} onChange={(e) => setMantente({ ...mantente, title: e.target.value })} />
        <input className="info-input" value={mantente.description} onChange={(e) => setMantente({ ...mantente, description: e.target.value })} />
        <input className="info-input" value={mantente.placeholder} onChange={(e) => setMantente({ ...mantente, placeholder: e.target.value })} />
        <input className="info-input" value={mantente.buttonText} onChange={(e) => setMantente({ ...mantente, buttonText: e.target.value })} />
        <textarea className="info-input" value={mantente.disclaimer} onChange={(e) => setMantente({ ...mantente, disclaimer: e.target.value })} />
      </div>

      {/* BOTÓN GUARDAR */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
       className="newsletter-btn admin-dashboard-save-btn"
  onClick={handleSave}
        >
          Guardar Cambios
        </button>
      </div>
    </section>
  );
};

export default InformativeAdminPage;
