import React from 'react';
import type { NewsletterSection } from '../services/informativoService';

interface Props {
  data: NewsletterSection;
}

const Newsletter: React.FC<Props> = ({ data }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Gracias por suscribirte! Te mantendremos informado sobre nuestras actividades.');
  };

  return (
    <section className="newsletter">
      <div className="section">
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>{data.title}</h2>
        <p>{data.description}</p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="newsletter-input"
            placeholder="Tu correo electrónico"
            required
          />
          <button type="submit" className="newsletter-btn">
            Suscribirse
          </button>
        </form>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
          {data.disclaimer}
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
