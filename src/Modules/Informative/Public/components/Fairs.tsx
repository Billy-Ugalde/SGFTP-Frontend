import React, { useEffect, useRef, useState } from 'react';
import { useActiveFairsPublic, type PublicFair } from '../../../Fairs/Services/FairsServices';

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const hasTime = iso.includes('T');
  const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = hasTime ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
  return time ? `${date} · ${time}` : date;
};

const splitDateTime = (iso: string) => {
  const d = new Date(iso);
  const hasTime = iso.includes('T');
  return {
    date: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: hasTime ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
  };
};

const nextDateOf = (datefairs: PublicFair['datefairs']) => {
  if (!datefairs || datefairs.length === 0) return null;
  const today = new Date().setHours(0, 0, 0, 0);
  const sorted = [...datefairs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const upcoming = sorted.find(x => new Date(x.date).getTime() >= today) ?? sorted[0];
  return upcoming?.date ?? null;
};

const Fairs: React.FC = () => {
  const { data, isLoading, isError } = useActiveFairsPublic();
  const fairs = data ?? [];

  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const cardStep = () => {
    const el = trackRef.current;
    if (!el) return 360; // fallback
    const card = el.querySelector<HTMLElement>('.fairs-carousel__card');
    const gap = 16;
    return (card?.clientWidth ?? 320) + gap;
  };

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
  };

  // autoplay
  useEffect(() => {
    if (!fairs.length) return;
    const id = window.setInterval(() => {
      if (paused) return;
      const el = trackRef.current;
      if (!el) return;
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (nearEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardStep(), behavior: 'smooth' });
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, [fairs.length, paused]);

  if (isLoading) {
    return (
      <section id="fairs" className="section">
        <h2 className="section-title">Ferias</h2>
        <div className="info-card">Cargando ferias…</div>
      </section>
    );
  }
  if (isError) {
    return (
      <section id="fairs" className="section">
        <h2 className="section-title">Ferias</h2>
        <div className="info-card">Error al cargar las ferias.</div>
      </section>
    );
  }
  if (!fairs.length) {
    return (
      <section id="fairs" className="section">
        <h2 className="section-title">Ferias</h2>
        <div className="info-card" style={{ textAlign: 'center' }}>No hay ferias activas por ahora.</div>
      </section>
    );
  }

  return (
    <section id="fairs" className="section fairs-carousel">
      <h2 className="section-title">Ferias</h2>

      <div
        className="fairs-carousel__wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          className="fairs-carousel__btn fairs-carousel__btn--prev"
          onClick={() => scroll(-1)}
          aria-label="Anterior"
        >
          ‹
        </button>

        <div className="fairs-carousel__track" ref={trackRef}>
          {fairs.map((fair) => {
            const prox = nextDateOf(fair.datefairs);
            const datesAsc = [...(fair.datefairs ?? [])].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            const multi = datesAsc.length > 1;

            return (
              <article key={fair.id_fair} className="fairs-carousel__card fairs-card--soft">
                <div className="fairs-soft__top">
                  <h3 className="fairs-soft__title">{fair.name}</h3>
                </div>

                <div className="fairs-soft__row">
                  <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 14.5 9A2.5 2.5 0 0 1 12 11.5Z"/></svg>
                  <span>{fair.location}</span>
                </div>

                {multi ? (
                  <>
                    <div className="fairs-soft__dates">
                      {datesAsc.map(df => {
                        const st = splitDateTime(df.date);
                        return (
                          <span className="fairs-soft__chip" key={df.id_date}>
                            <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 15H5V10h14zm0-11H5V6h14z"/></svg>
                            <span className="fairs-soft__chip-main">{st.date}</span>
                            {st.time && <span className="fairs-soft__chip-sub">{st.time}</span>}
                          </span>
                        );
                      })}
                    </div>
                    <div className="fairs-soft__dates-count">{datesAsc.length} fechas</div>
                  </>
                ) : (
                  <div className="fairs-soft__date">
                    <div className="fairs-soft__date-icon">
                      <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 15H5V10h14zm0-11H5V6h14z"/></svg>
                    </div>
                    <div className="fairs-soft__date-text">{formatDate(prox)}</div>
                    <div className="fairs-soft__date-sub">{datesAsc.length} fecha</div>
                  </div>
                )}

                <div className="fairs-soft__row">
                  <svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm2 4h14v10H5z"/></svg>
                  <span>{fair.stand_capacity} stands disponibles</span>
                </div>

                <button className="fairs-soft__cta" type="button">Participar</button>
              </article>
            );
          })}
        </div>

        <button
          className="fairs-carousel__btn fairs-carousel__btn--next"
          onClick={() => scroll(1)}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default Fairs;
