import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePublicActivityBySlug, getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import { MapPin, Calendar, Users, Layers, FolderOpen, Tag, ClipboardPen } from 'lucide-react';
import Header from '../components/Header';
import ActivityEnrollmentPublicForm from '../../../Volunteers/Components/ActivityEnrollmentPublicForm';
import styles from '../styles/ActivityDetailView.module.css';
import '../styles/public-view.css';

const ActivityDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEnroll, setShowEnroll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: activity, isLoading, error } = usePublicActivityBySlug(slug);

  const handleBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    if (from) { navigate(from); return; }
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Por confirmar';
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(dateString);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const h = d.getHours();
    const m = d.getMinutes();
    if (h === 0 && m === 0) return '';
    return d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  };

  const activityImages = activity
    ? [activity.url1, activity.url2, activity.url3].filter(
        (url): url is string => !!url && url.trim() !== ''
      )
    : [];

  const heroImage = activityImages.length > 0 ? getProxiedImageUrl(activityImages[0]) : '';

  const sortedDates = activity?.dateActivities?.length
    ? [...activity.dateActivities].sort(
        (a, b) => new Date(a.Start_date).getTime() - new Date(b.Start_date).getTime()
      )
    : [];

  const nextDate = sortedDates[0] ?? null;

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = prev; };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showEnroll || lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showEnroll, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      else if (e.key === 'ArrowRight') setLightboxIndex(i => (i === null ? i : (i + 1) % activityImages.length));
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => (i === null ? i : (i - 1 + activityImages.length) % activityImages.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, activityImages.length]);

  if (isLoading) {
    return (
      <>
        <Header hideNav />
        <div className={styles.loadingPage}>
          <div className={styles.spinner} />
          <p>Cargando actividad…</p>
        </div>
      </>
    );
  }

  if (error || !activity) {
    return (
      <>
        <Header hideNav />
        <div className={styles.errorPage}>
          <h2>Actividad no encontrada</h2>
          <p>La actividad que buscas no existe o no está disponible.</p>
          <button onClick={handleBack} className={styles.btnBack}>← Volver</button>
        </div>
      </>
    );
  }

  return (
    <>
      {showEnroll && (
        <ActivityEnrollmentPublicForm
          activityId={activity.Id_activity}
          activityName={activity.Name}
          onSuccess={() => setShowEnroll(false)}
          onCancel={() => setShowEnroll(false)}
        />
      )}

      <div className={styles.page}>
        <Header hideNav onBack={handleBack} />

        {/* ── HERO ── */}
        <header
          className={styles.hero}
          style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        >
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>{activity.Name}</h1>
            </div>
          </div>
        </header>

        {/* ── CUERPO: artículo + sidebar ── */}
        <div className={styles.body}>
          <div className={styles.bodyInner}>

            {/* Columna editorial */}
            <main className={styles.article}>

              <p className={styles.leadText}>{activity.Description}</p>

              {activity.Aim?.trim() && (
                <section className={styles.textSection}>
                  <h2 className={styles.textLabel}>Objetivo</h2>
                  <p className={styles.textBody}>{activity.Aim}</p>
                </section>
              )}

              {activity.Conditions?.trim() && (
                <section className={styles.textSection}>
                  <h2 className={styles.textLabel}>Condiciones de participación</h2>
                  <p className={styles.textBody}>{activity.Conditions}</p>
                </section>
              )}

              {activity.Observations?.trim() && (
                <section className={styles.textSection}>
                  <h2 className={styles.textLabel}>Observaciones</h2>
                  <p className={styles.textBody}>{activity.Observations}</p>
                </section>
              )}
            </main>

            {/* Sidebar */}
            <aside className={styles.sidebar}>

              {/* CTA inscripción */}
              {activity.OpenForRegistration && (
                <button className={styles.btnEnroll} onClick={() => setShowEnroll(true)}>
                  <ClipboardPen size={17} strokeWidth={2} />
                  Inscribirse en esta actividad
                </button>
              )}

              {/* Tarjeta de detalles */}
              <div className={styles.infoCard}>

                {nextDate && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}><Calendar size={15} strokeWidth={1.8} /></span>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Próxima fecha</span>
                      <span className={styles.infoValue}>{formatDate(nextDate.Start_date)}</span>
                      {formatTime(nextDate.Start_date) && (
                        <span className={styles.infoSub}>{formatTime(nextDate.Start_date)}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><MapPin size={15} strokeWidth={1.8} /></span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Ubicación</span>
                    <span className={styles.infoValue}>{activity.Location}</span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><Tag size={15} strokeWidth={1.8} /></span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Tipo</span>
                    <span className={styles.infoValue}>
                      {(getActivityLabels.type as Record<string, string>)[activity.Type_activity] || activity.Type_activity}
                    </span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><Layers size={15} strokeWidth={1.8} /></span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Enfoque</span>
                    <span className={styles.infoValue}>
                      {(getActivityLabels.approach as Record<string, string>)[activity.Approach] || activity.Approach}
                    </span>
                  </div>
                </div>

                {activity.project?.Name && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}><FolderOpen size={15} strokeWidth={1.8} /></span>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Proyecto</span>
                      <span className={styles.infoValue}>{activity.project.Name}</span>
                    </div>
                  </div>
                )}

                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><Users size={15} strokeWidth={1.8} /></span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Espacios disponibles</span>
                    <span className={styles.infoValue}>
                      {!activity.Spaces || activity.Spaces === 0 ? 'Ilimitado' : activity.Spaces}
                    </span>
                  </div>
                </div>

              </div>
            </aside>

          </div>
        </div>

        {/* ── FECHAS PROGRAMADAS ── */}
        {sortedDates.length > 0 && (
          <section className={styles.datesSection}>
            <div className={styles.datesSectionInner}>
              <h2 className={styles.datesSectionTitle}>Fechas programadas</h2>
              <div className={styles.datesGrid}>
                {sortedDates.map((date, i) => (
                  <div key={i} className={styles.dateCard}>
                    <span className={styles.dateCardNum}>{String(i + 1).padStart(2, '0')}</span>
                    <div className={styles.dateCardInfo}>
                      <span className={styles.dateCardDate}>{formatDate(date.Start_date)}</span>
                      {formatTime(date.Start_date) && (
                        <span className={styles.dateCardTime}>{formatTime(date.Start_date)}</span>
                      )}
                      {date.End_date && (
                        <span className={styles.dateCardEnd}>hasta {formatDate(date.End_date)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── GALERÍA ── */}
        {activityImages.length > 1 && (
          <section className={styles.gallerySection}>
            <div className={styles.gallerySectionInner}>
              <h2 className={styles.gallerySectionTitle}>Galería</h2>
              <div className={styles.galleryGrid}>
                {activityImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.galleryItem}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Ampliar imagen ${i + 1}`}
                  >
                    <img
                      src={getProxiedImageUrl(url)}
                      alt={`${activity.Name} — imagen ${i + 1}`}
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      {lightboxIndex !== null && activityImages[lightboxIndex] && (
        <div className={styles.lightbox} onClick={() => setLightboxIndex(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar"
          >
            ×
          </button>

          {activityImages.length > 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={e => {
                e.stopPropagation();
                setLightboxIndex(i => (i === null ? i : (i - 1 + activityImages.length) % activityImages.length));
              }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
          )}

          <img
            className={styles.lightboxImg}
            src={getProxiedImageUrl(activityImages[lightboxIndex])}
            alt={`${activity.Name} — imagen ${lightboxIndex + 1}`}
            onClick={e => e.stopPropagation()}
          />

          {activityImages.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={e => {
                  e.stopPropagation();
                  setLightboxIndex(i => (i === null ? i : (i + 1) % activityImages.length));
                }}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
              <span className={styles.lightboxCount}>{lightboxIndex + 1} / {activityImages.length}</span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ActivityDetailView;
