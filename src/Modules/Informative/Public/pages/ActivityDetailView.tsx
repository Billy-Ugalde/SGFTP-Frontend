import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicActivityById, getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import { MapPin, Calendar } from 'lucide-react';
import ActivityEnrollmentPublicForm from '../../../Volunteers/Components/ActivityEnrollmentPublicForm';
import styles from '../styles/ActivityDetailView.module.css';

const ActivityDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEnroll, setShowEnroll] = useState(false);

  const { data: activity, isLoading, error } = usePublicActivityById(Number(id));

  const handleBack = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

  const nextDate = activity?.dateActivities?.length
    ? [...activity.dateActivities].sort(
        (a, b) => new Date(a.Start_date).getTime() - new Date(b.Start_date).getTime()
      )[0]
    : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showEnroll ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showEnroll]);

  if (isLoading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Cargando actividad…</p>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className={styles.errorPage}>
        <h2>Actividad no encontrada</h2>
        <p>La actividad que buscas no existe o no está disponible.</p>
        <button onClick={handleBack} className={styles.btnBack}>← Volver</button>
      </div>
    );
  }

  return (
    <>
      {showEnroll && (
        <div className={styles.modalOverlay} onClick={() => setShowEnroll(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowEnroll(false)}>×</button>
            <ActivityEnrollmentPublicForm
              activityId={activity.Id_activity}
              activityName={activity.Name}
              onSuccess={() => setShowEnroll(false)}
              onCancel={() => setShowEnroll(false)}
            />
          </div>
        </div>
      )}

      <div className={styles.page}>

        {/* ── HERO ── */}
        <header
          className={styles.hero}
          style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        >
          <div className={styles.heroOverlay}>
            <button onClick={handleBack} className={styles.heroBack}>
              ← Actividades
            </button>
            <div className={styles.heroContent}>
              <span className={styles.heroChip}>
                {getActivityLabels.type[activity.Type_activity] || activity.Type_activity}
              </span>
              <h1 className={styles.heroTitle}>{activity.Name}</h1>
              <div className={styles.heroMeta}>
                {nextDate && (
                  <span className={styles.heroMetaItem}>
                    <Calendar size={13} strokeWidth={2} />
                    {formatDate(nextDate.Start_date)}
                  </span>
                )}
                <span className={styles.heroMetaItem}>
                  <MapPin size={13} strokeWidth={2} />
                  {activity.Location}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── ARTÍCULO ── */}
        <main className={styles.article}>

          {/* Descripción */}
          <section className={styles.lead}>
            <p className={styles.leadText}>{activity.Description}</p>
          </section>

          {/* Objetivo */}
          {activity.Aim && activity.Aim.trim() !== '' && (
            <section className={styles.textSection}>
              <h2 className={styles.textSectionLabel}>Objetivo</h2>
              <p className={styles.textSectionBody}>{activity.Aim}</p>
            </section>
          )}

          {/* Condiciones */}
          {activity.Conditions && activity.Conditions.trim() !== '' && (
            <section className={styles.textSection}>
              <h2 className={styles.textSectionLabel}>Condiciones</h2>
              <p className={styles.textSectionBody}>{activity.Conditions}</p>
            </section>
          )}

          {/* Observaciones */}
          {activity.Observations && activity.Observations.trim() !== '' && (
            <section className={styles.textSection}>
              <h2 className={styles.textSectionLabel}>Observaciones</h2>
              <p className={styles.textSectionBody}>{activity.Observations}</p>
            </section>
          )}

          {/* Pills de meta */}
          <div className={styles.metaRow}>
            <div className={styles.metaPill}>
              <span className={styles.metaPillLabel}>Enfoque</span>
              <span className={styles.metaPillValue}>
                {getActivityLabels.approach[activity.Approach] || activity.Approach}
              </span>
            </div>
            <div className={styles.metaPill}>
              <span className={styles.metaPillLabel}>Proyecto</span>
              <span className={styles.metaPillValue}>{activity.project?.Name || '—'}</span>
            </div>
            <div className={styles.metaPill}>
              <span className={styles.metaPillLabel}>Espacios</span>
              <span className={styles.metaPillValue}>
                {!activity.Spaces || activity.Spaces === 0 ? 'Ilimitado' : activity.Spaces}
              </span>
            </div>
            {activity.IsFavorite && (
              <div className={styles.metaPill}>
                <span className={styles.metaPillLabel}>Categoría</span>
                <span className={styles.metaPillValue}>
                  {getActivityLabels.favorite[activity.IsFavorite] || activity.IsFavorite}
                </span>
              </div>
            )}
          </div>

          {/* CTA inscripción */}
          {activity.OpenForRegistration && (
            <div className={styles.enrollCta}>
              <button className={styles.btnEnroll} onClick={() => setShowEnroll(true)}>
                Inscribirse en esta actividad
              </button>
            </div>
          )}
        </main>

        {/* ── FECHAS PROGRAMADAS ── */}
        {activity.dateActivities && activity.dateActivities.length > 0 && (
          <section className={styles.datesSection}>
            <div className={styles.datesSectionInner}>
              <h2 className={styles.datesSectionTitle}>Fechas programadas</h2>
              <div className={styles.datesGrid}>
                {[...activity.dateActivities]
                  .sort((a, b) => new Date(a.Start_date).getTime() - new Date(b.Start_date).getTime())
                  .map((date, i) => (
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
        {activityImages.length > 0 && (
          <section className={styles.gallerySection}>
            <div className={styles.gallerySectionInner}>
              <h2 className={styles.gallerySectionTitle}>Galería</h2>
              <div className={styles.galleryGrid}>
                {activityImages.map((url, i) => (
                  <div key={i} className={styles.galleryItem}>
                    <img
                      src={getProxiedImageUrl(url)}
                      alt={`${activity.Name} — imagen ${i + 1}`}
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </>
  );
};

export default ActivityDetailView;
