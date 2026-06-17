import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/News.module.css';
import { usePublishedNews, type NewsBE } from '../../../News/Services/NewsServices';
import NewsDetailModal from '../../../News/Components/NewsDetailModal';

const getProxiedImageUrl = (driveUrl?: string) => {
  if (!driveUrl) return '';
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
  return `${apiUrl}/images/proxy?url=${encodeURIComponent(driveUrl)}`;
};

export default function News() {
  const navigate = useNavigate();
  const { data, isLoading, error } = usePublishedNews();
  const [preview, setPreview] = useState<NewsBE | null>(null);

  // Solo "publicadas" y ordenadas desc por fecha de publicación
  const items = useMemo<NewsBE[]>(() => {
    const base = (data ?? []).filter((n) => n.status === 'published');
    base.sort(
      (a, b) =>
        new Date(b.publicationDate).getTime() -
        new Date(a.publicationDate).getTime()
    );
    return base;
  }, [data]);

  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const [scrollState, setScrollState] = useState({
    atStart: true,
    atEnd: false,
    progress: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString('es-CR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : '—';

  const canScroll = () => {
    const el = trackRef.current;
    if (!el) return false;
    return el.scrollWidth - el.clientWidth > 4;
  };

  const rafRef = useRef<number | null>(null);
  const updateScrollState = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = trackRef.current;
      if (!el) return;
      const atStart = el.scrollLeft <= 5;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const progress = maxScroll > 4 ? el.scrollLeft / maxScroll : 0;
      const totalPages = maxScroll > 4 ? Math.round(el.scrollWidth / el.clientWidth) : 1;
      const currentPage = Math.min(totalPages, Math.round(el.scrollLeft / el.clientWidth) + 1);
      setScrollState({ atStart, atEnd, progress, currentPage, totalPages });
    });
  };

  const step = () => {
    const el = trackRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
  };

  const scrollPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
    setTimeout(updateScrollState, 300); // después de la animación
  };

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
    setTimeout(updateScrollState, 300); // después de la animación
  };

  const startAuto = () => {
    if (!canScroll()) return;
    stopAuto();
    timerRef.current = window.setInterval(step, 6000);
  };

  const stopAuto = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Autoplay (se pausa en hover/foco)
  useEffect(() => {
    updateScrollState();
    startAuto();
    const el = trackRef.current;
    if (!el) return;

    const onEnter = () => stopAuto();
    const onLeave = () => startAuto();
    const onFocus = () => stopAuto();
    const onBlur = () => startAuto();

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('focusin', onFocus);
    el.addEventListener('focusout', onBlur);
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', startAuto);

    return () => {
      stopAuto();
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('focusout', onBlur);
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', startAuto);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <section className={styles.news} id="noticias" aria-labelledby="news-title">
      <div className={styles.inner}>
      {/* Título entre secciones, con tu estilo global */}
      <div className={styles.sectionHead}>
        <h2 id="news-title" className="section-title">
          Últimas Noticias
        </h2>
        <button
          type="button"
          className={styles.verTodasBtn}
          onClick={() => navigate('/noticias')}
        >
          Ver todas →
        </button>
      </div>

      {/* Contenedor verde con los cards */}
      <div className={styles.surface}>
        {isLoading && <div className={styles.infoBox}>Cargando noticias…</div>}
        {error && (
          <div className={`${styles.infoBox} ${styles.error}`}>
            Ocurrió un error al cargar noticias.
          </div>
        )}
        {!isLoading && !error && items.length === 0 && (
          <div className={styles.infoBox}>Aún no hay noticias publicadas.</div>
        )}

        {items.length > 0 && (
          <>
            <div className={styles.carouselWrapper}>
              <div
                ref={trackRef}
                className={styles.track}
                tabIndex={0}
                role="group"
                aria-roledescription="Carrusel de noticias"
              >
                {items.map((n) => (
                  <article
                    key={n.id_news}
                    className={styles.card}
                    onClick={() => setPreview(n)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPreview(n);
                      }
                    }}
                  >
                    <div className={styles.thumb}>
                      {n.image_url ? (
                        <img src={getProxiedImageUrl(n.image_url)} alt={n.title} />
                      ) : (
                        <div className={styles.thumbLabel}>
                          <span>🖼 Imagen de Noticia</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.body}>
                      <div className={styles.date}>{fmt(n.publicationDate)}</div>
                      <h3 className={styles.title}>{n.title}</h3>
                      <p className={styles.excerpt}>{n.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Barra de navegación editorial */}
            <div className={styles.navBar}>
              <button
                type="button"
                className={styles.navArrow}
                onClick={scrollPrev}
                disabled={scrollState.atStart}
                aria-label="Noticia anterior"
              >
                ←
              </button>

              <div className={styles.navProgressTrack}>
                <div
                  className={styles.navProgressFill}
                  style={{ width: `${scrollState.progress * 100}%` }}
                />
              </div>

              {scrollState.totalPages > 1 && (
                <span className={styles.navCounter}>
                  {String(scrollState.currentPage).padStart(2, '0')}&thinsp;/&thinsp;{String(scrollState.totalPages).padStart(2, '0')}
                </span>
              )}

              <button
                type="button"
                className={styles.navArrow}
                onClick={scrollNext}
                disabled={scrollState.atEnd}
                aria-label="Siguiente noticia"
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalle */}
      <NewsDetailModal news={preview} onClose={() => setPreview(null)} />
      </div>
    </section>
  );
}
