import React from 'react';
import type { EventItem } from '../services/informativoService';

interface Props {
  data: EventItem[];
}

const Events: React.FC<Props> = ({ data }) => {
  return (
    <section className="events-section section" id="eventos">
      <h2 className="section-title">Próximos Eventos</h2>
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav">◀ Anterior</button>
          <h3>Julio 2025</h3>
          <button className="calendar-nav">Siguiente ▶</button>
        </div>
        <div className="events-list">
          {data.map((event, index) => (
            <div key={index} className="event-card">
              <div className="event-date">{event.date}</div>
              <h4>{event.title}</h4>
              <p>{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
