import React from 'react';
import type { EntrepreneurItem } from '../services/informativeService';

interface Props {
  data: EntrepreneurItem[];
}

const Entrepreneurs: React.FC<Props> = ({ data }) => {
  return (
    <section className="entrepreneurs-section section" id="entrepreneurs">
      <h2 className="section-title">Emprendedores Locales</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Apoyamos y promovemos el talento local, dando visibilidad a emprendimientos que preservan nuestras tradiciones
      </p>
      <div className="entrepreneurs-grid">
        {data.map((item, index) => (
          <div className="entrepreneur-card" key={index}>
            <div className="entrepreneur-img">{item.image}</div>
            <div className="entrepreneur-content">
              <span className="entrepreneur-type">{item.type}</span>
              <h3>{item.name}</h3>
              <p><strong>{item.role}:</strong> {item.person}</p>
              <p>{item.description}</p>
              <div className="contact-info">
                {item.contacts.map((contact, i) => (
                  <a key={i} href={contact.link} className="contact-btn" target="_blank" rel="noopener noreferrer">
                    {contact.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Entrepreneurs;
