import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/News.module.css';
import { usePublishedNews, type NewsBE } from '../../../News/Services/NewsServices';

const getProxiedImageUrl = (driveUrl?: string) => {
  if (!driveUrl) return '';
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
  return `${apiUrl}/images/proxy?url=${encodeURIComponent(driveUrl)}`;
};

export default function News() {
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
  };

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
  };

  const startAuto = () => {
    if (!canScroll()) return;
    stopAuto();
    timerRef.current = window.setInterval(step, 3000);
  };

  const stopAuto = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Autoplay (se pausa en hover/foco)
  useEffect(() => {
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
    window.addEventListener('resize', startAuto);

    return () => {
      stopAuto();
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('focusout', onBlur);
      window.removeEventListener('resize', startAuto);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Cerrar modal con ESC
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  return (
    <section className={styles.news} id="noticias" aria-labelledby="news-title">
      {/* Título entre secciones, con tu estilo global */}
      <h2 id="news-title" className="section-title">
        Últimas Noticias
      </h2>

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
          <div className={styles.carouselWrapper}>
            {canScroll() && (
              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonPrev}`}
                onClick={scrollPrev}
                aria-label="Noticia anterior"
              >
                ‹
              </button>
            )}

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

            {canScroll() && (
              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonNext}`}
                onClick={scrollNext}
                aria-label="Siguiente noticia"
              >
                ›
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== PREVIEW MODAL ===== */}
      {preview && (
        <div
          className={styles.newsPreviewOverlay}
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <article
            className={styles.newsPreview}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.newsPreviewHeader}>
              <h2 className={styles.newsPreviewTitle}>{preview.title}</h2>
              <button
                type="button"
                className={styles.newsPreviewClose}
                aria-label="Cerrar vista"
                onClick={() => setPreview(null)}
              >
                ×
              </button>
            </header>

            <section className={styles.newsPreviewBody}>
              <div className={styles.newsPreviewGrid}>
                {preview.image_url && (
                  <div className={styles.newsPreviewImage}>
                    <img
                      src={getProxiedImageUrl(preview.image_url)}
                      alt={preview.title}
                    />
                  </div>
                )}

                <div className={styles.newsPreviewContent}>
                  {preview.content}
                </div>
              </div>

              <div className={styles.newsPreviewMeta}>
                <span><strong>Autor:</strong> {preview.author ?? '—'}</span>
                <span><strong>Publicado:</strong> {fmt(preview.publicationDate)}</span>
              </div>
            </section>
          </article>
        </div>
      )}
    </section>
  );
}
