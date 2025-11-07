import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useActiveFairsPublic, type PublicFair } from '../../../Fairs/Services/FairsServices';
import FairParticipationModal from './FairParticipationModal';
import fairsStyles from '../styles/Fairs.module.css';

interface Props {
  description?: string;
}

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

const Fairs: React.FC<Props> = ({ description }) => {
  const { data, isLoading, isError } = useActiveFairsPublic();
  const fairs = data ?? [];

  const [selectedFair, setSelectedFair] = useState<PublicFair | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fairsSorted = useMemo(() => {
    const toTime = (iso: string | null) =>
      iso ? new Date(iso).getTime() : Number.MAX_SAFE_INTEGER;

    return [...fairs].sort((a, b) => {
      const ta = toTime(nextDateOf(a.datefairs));
      const tb = toTime(nextDateOf(b.datefairs));
      if (ta !== tb) return ta - tb;
      return String(a.name).localeCompare(String(b.name));
    });
  }, [fairs]);

  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const cardStep = () => {
    const el = trackRef.current;
    if (!el) return 360; // fallback
    const card = el.querySelector<HTMLElement>(`.${fairsStyles.fairsCarouselCard}`);
    const gap = 16;
    return (card?.clientWidth ?? 320) + gap;
  };

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
  };

  const handleParticipate = (fair: PublicFair) => {
    setSelectedFair(fair);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFair(null);
  };

  useEffect(() => {
    if (!fairsSorted.length) return;
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
  }, [fairsSorted.length, paused]);

  if (isLoading) {
    return (
      <section id="fairs" className={fairsStyles.fairsSection}>
        <h2 className={`section-title ${fairsStyles.fairsSectionTitle}`}>Ferias</h2>
        <div className={fairsStyles.infoCard}>Cargando ferias…</div>
      </section>
    );
  }
  if (isError) {
    return (
      <section id="fairs" className={fairsStyles.fairsSection}>
        <h2 className={`section-title ${fairsStyles.fairsSectionTitle}`}>Ferias</h2>
        <div className={fairsStyles.infoCard}>Error al cargar las ferias.</div>
      </section>
    );
  }
  if (!fairsSorted.length) {
    return (
      <section id="fairs" className={fairsStyles.fairsSection}>
        <h2 className={`section-title ${fairsStyles.fairsSectionTitle}`}>Ferias</h2>
        <div className={fairsStyles.infoCard} style={{ textAlign: 'center' }}>No hay ferias activas por ahora.</div>
      </section>
    );
  }

  return (
    <>
      <section id="fairs" className={`section ${fairsStyles.fairsSection} ${fairsStyles.fairsCarousel}`}>
        <h2 className={`section-title ${fairsStyles.fairsSectionTitle}`}>Ferias</h2>

        {/* Descripción editable (no altera la lógica del carrusel) */}
        {description ? (
          <p style={{ textAlign: 'center', marginBottom: '2rem' }}>{description}</p>
        ) : null}

        <div
          className={fairsStyles.fairsCarouselWrap}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button
            className={`${fairsStyles.fairsCarouselBtn} ${fairsStyles.fairsCarouselBtnPrev}`}
            onClick={() => scroll(-1)}
            aria-label="Anterior"
          >
            ‹
          </button>

          <div className={fairsStyles.fairsCarouselTrack} ref={trackRef}>
            {fairsSorted.map((fair) => {
              const prox = nextDateOf(fair.datefairs);
              const datesAsc = [...(fair.datefairs ?? [])].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
              );
              const multi = datesAsc.length > 1;

              return (
                <article key={fair.id_fair} className={`${fairsStyles.fairsCarouselCard} ${fairsStyles.fairsCardSoft}`}>
                  <div className={fairsStyles.fairsSoftTop}>
                    <h3 className={fairsStyles.fairsSoftTitle}>{fair.name}</h3>
                  </div>

                  <div className={fairsStyles.fairsSoftRow}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2a7 7 0 0 1 7 7c0 3.87-7 13-7 13S5 12.87 5 9a7 7 0 0 1 7-7zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5z" />
                    </svg>
                    <span>{fair.location}</span>
                  </div>

                  {multi ? (
                    <>
                      <div className={fairsStyles.fairsSoftDates}>
                        {datesAsc.map(df => {
                          const st = splitDateTime(df.date);
                          return (
                            <div className={fairsStyles.fairsSoftChip} key={df.date}>
                              <div className={fairsStyles.fairsSoftChipMain}>{st.date}</div>
                              {st.time ? <div className={fairsStyles.fairsSoftChipSub}>{st.time}</div> : null}
                            </div>
                          );
                        })}
                      </div>
                      <div className={fairsStyles.fairsSoftDatesCount}>{datesAsc.length} fechas</div>
                    </>
                  ) : (
                    <div className={fairsStyles.fairsSoftDate}>
                      <div className={fairsStyles.fairsSoftDateIcon}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 15H5V10h14V19m0-11H5V6h14Z" />
                        </svg>
                      </div>
                      <div className={fairsStyles.fairsSoftDateText}>{formatDate(prox)}</div>
                      <div className={fairsStyles.fairsSoftDateSub}>{datesAsc.length} fecha</div>
                    </div>
                  )}

                  <div className={fairsStyles.fairsSoftRow}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 5h18v2H3v14h14V9H5V5z" />
                    </svg>
                    <span>{fair.stand_capacity} stands disponibles</span>
                  </div>

                  {/* Botón que ahora abre el modal con la feria específica */}
                  <button
                    className={fairsStyles.fairsSoftCta}
                    type="button"
                    onClick={() => handleParticipate(fair)}
                  >
                    Participar
                  </button>
                </article>
              );
            })}
          </div>

          <button
            className={`${fairsStyles.fairsCarouselBtn} ${fairsStyles.fairsCarouselBtnNext}`}
            onClick={() => scroll(1)}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </section>

      {/* Modal de participación que se renderiza condicionalmente */}
      {selectedFair && (
        <FairParticipationModal
          fair={selectedFair}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Fairs;