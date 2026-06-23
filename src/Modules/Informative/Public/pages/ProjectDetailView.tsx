import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  CalendarCheck,
  Target,
  Users,
  Flag,
  HeartHandshake,
  TreePine,
  Recycle,
  Images,
  CalendarRange,
} from 'lucide-react';
import { useProjectBySlug, ProjectStatus } from '../../../Projects/Services/ProjectsServices';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import Header from '../components/Header';
import { useCardsPerPage } from '../hooks/useCardsPerPage';
import styles from '../styles/ProjectDetailView.module.css';
import '../styles/public-view.css';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  planning: 'Planificación',
  execution: 'En ejecución',
  suspended: 'Suspendido',
  finished: 'Finalizado',
};

const ProjectDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const activitiesPerPage = useCardsPerPage();

  const { data: project, isLoading, error } = useProjectBySlug(slug);

  const handleBack = () => {
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

  const isImageUrl = (value: string): boolean => /^https?:\/\//i.test(value);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  };

  const projectImages = useMemo(
    () =>
      project
        ? [
            project.url_1, project.url_2, project.url_3,
            project.url_4, project.url_5, project.url_6,
          ].filter((url): url is string => !!url && url.trim() !== '')
        : [],
    [project],
  );

  const heroImage = projectImages.length > 0 ? getProxiedImageUrl(projectImages[0]) : '';

  const relatedActivities = useMemo<Activity[]>(() => {
    const list = (project?.activity ?? []) as Activity[];
    return list
      .filter(
        (a) =>
          a.Active === true &&
          (a.Status_activity === 'execution' || a.Status_activity === 'finished'),
      )
      .sort(
        (a, b) =>
          new Date(b.Registration_date).getTime() - new Date(a.Registration_date).getTime(),
      );
  }, [project]);

  const metrics = useMemo(
    () =>
      project
        ? [
            {
              key: 'beneficiated',
              value: project.METRIC_TOTAL_BENEFICIATED ?? 0,
              label: 'Beneficiarios',
              icon: HeartHandshake,
            },
            {
              key: 'trees',
              value: project.METRIC_TOTAL_TREES_PLANTED ?? 0,
              label: 'Árboles plantados',
              icon: TreePine,
            },
            {
              key: 'waste',
              value: project.METRIC_TOTAL_WASTE_COLLECTED ?? 0,
              label: 'Residuos recolectados (kg)',
              icon: Recycle,
            },
          ].filter(({ value }) => Number(value) > 0)
        : [],
    [project],
  );

  const getActivityImage = (a: Activity): string => a.url1 || a.url2 || a.url3 || '';

  const handleActivityClick = (activity: Activity) => {
    navigate(`/actividad/${activity.Slug ?? activity.Id_activity}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = prev; };
  }, []);

  useEffect(() => { setActivitiesPage(1); }, [slug, activitiesPerPage]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      else if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % projectImages.length));
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : (i - 1 + projectImages.length) % projectImages.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, projectImages.length]);

  if (isLoading) {
    return (
      <>
        <Header hideNav />
        <div className={styles.loadingPage}>
          <div className={styles.spinner} />
          <p>Cargando proyecto…</p>
        </div>
      </>
    );
  }

  const isPubliclyVisible =
    !!project &&
    project.Active === true &&
    (project.Status === ProjectStatus.EXECUTION || project.Status === ProjectStatus.FINISHED);

  if (error || !project || !isPubliclyVisible) {
    return (
      <>
        <Header hideNav />
        <div className={styles.errorPage}>
          <h2>Proyecto no encontrado</h2>
          <p>El proyecto que buscas no existe o no está disponible públicamente.</p>
          <button onClick={handleBack} className={styles.btnBack}>← Volver</button>
        </div>
      </>
    );
  }

  const totalActivityPages = Math.max(1, Math.ceil(relatedActivities.length / activitiesPerPage));
  const currentActivityPage = Math.min(activitiesPage, totalActivityPages);
  const paginatedActivities = relatedActivities.slice(
    (currentActivityPage - 1) * activitiesPerPage,
    currentActivityPage * activitiesPerPage,
  );

  return (
    <>
      <div className={styles.page}>
        <Header hideNav onBack={handleBack} />

        <header
          className={styles.hero}
          style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        >
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>{project.Name}</h1>
            </div>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.bodyInner}>

            <main className={styles.article}>
              <p className={styles.leadText}>{project.Description}</p>

              {project.Aim?.trim() && (
                <section className={styles.textSection}>
                  <h2 className={styles.textLabel}>
                    <Target size={14} strokeWidth={2.2} /> Objetivo principal
                  </h2>
                  <p className={styles.textBody}>{project.Aim}</p>
                </section>
              )}

              {project.Target_population?.trim() && (
                <section className={styles.textSection}>
                  <h2 className={styles.textLabel}>
                    <Users size={14} strokeWidth={2.2} /> Población objetivo
                  </h2>
                  <p className={styles.textBody}>{project.Target_population}</p>
                </section>
              )}

              {project.Observations?.trim() && (
                <section className={styles.textSection}>
                  <h2 className={styles.textLabel}>Observaciones</h2>
                  <p className={styles.textBody}>{project.Observations}</p>
                </section>
              )}
            </main>

            <aside className={styles.sidebar}>
              <div className={styles.infoCard}>
                {project.Location?.trim() && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}><MapPin size={15} strokeWidth={1.8} /></span>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Ubicación</span>
                      <span className={styles.infoValue}>{project.Location}</span>
                    </div>
                  </div>
                )}

                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><Calendar size={15} strokeWidth={1.8} /></span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Fecha de inicio</span>
                    <span className={styles.infoValue}>{formatDate(project.Start_date)}</span>
                  </div>
                </div>

                {project.End_date && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}><CalendarCheck size={15} strokeWidth={1.8} /></span>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Fecha de finalización</span>
                      <span className={styles.infoValue}>{formatDate(project.End_date)}</span>
                    </div>
                  </div>
                )}

                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><Flag size={15} strokeWidth={1.8} /></span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Estado</span>
                    <span className={styles.infoValue}>
                      {STATUS_LABELS[project.Status] || project.Status}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>

        {metrics.length > 0 && (
          <section className={styles.metricsSection}>
            <div className={styles.metricsSectionInner}>
              <div className={styles.metricsHeader}>
                <h2 className={styles.metricsSectionTitle}>Impacto del proyecto</h2>
                <p className={styles.metricsSub}>Resultados acumulados desde el inicio del proyecto</p>
              </div>
              <div className={styles.metricsGrid}>
                {metrics.map(({ key, value, label, icon: Icon }) => (
                  <div key={key} className={styles.metricCard}>
                    <span className={styles.metricIcon}><Icon size={26} strokeWidth={1.6} /></span>
                    <span className={styles.metricValue}>{Number(value).toLocaleString('es-ES')}</span>
                    <span className={styles.metricLabel}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {projectImages.length > 0 && (
          <section className={styles.gallerySection}>
            <div className={styles.gallerySectionInner}>
              <h2 className={styles.gallerySectionTitle}>
                <Images size={22} strokeWidth={1.8} /> Galería del proyecto
              </h2>
              <p className={styles.galleryHint}>Haz clic en la imagen para ampliar</p>
              <div className={styles.galleryGrid}>
                {projectImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.galleryItem}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Ampliar imagen ${i + 1}`}
                  >
                    <img
                      src={getProxiedImageUrl(url)}
                      alt={`${project.Name} — imagen ${i + 1}`}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={styles.activitiesSection}>
          <div className={styles.activitiesSectionInner}>
            <h2 className={styles.activitiesSectionTitle}>
              <CalendarRange size={22} strokeWidth={1.8} /> Actividades relacionadas
            </h2>

            {relatedActivities.length > 0 ? (
              <>
                <div className={styles.activitiesGrid}>
                  {paginatedActivities.map((activity) => {
                    const img = getActivityImage(activity);
                    return (
                      <article
                        key={activity.Id_activity}
                        className={styles.activityCard}
                        onClick={() => handleActivityClick(activity)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleActivityClick(activity);
                          }
                        }}
                      >
                        <div className={styles.activityCardImg}>
                          <span className={styles.activityCardEmoji}>🌱</span>
                          {isImageUrl(img) && (
                            <img
                              src={getProxiedImageUrl(img)}
                              alt={activity.Name}
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <span className={styles.activityCardChip}>
                            {getActivityLabels.status[activity.Status_activity] || activity.Status_activity}
                          </span>
                        </div>
                        <div className={styles.activityCardBody}>
                          <h3 className={styles.activityCardTitle}>{activity.Name}</h3>
                          <p className={styles.activityCardDesc}>{activity.Description}</p>
                          <div className={styles.activityCardFoot}>
                            <span className={styles.activityCardMeta}>
                              <MapPin size={13} strokeWidth={2} />
                              {activity.Location}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {totalActivityPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setActivitiesPage(Math.max(1, currentActivityPage - 1))}
                      disabled={currentActivityPage === 1}
                      aria-label="Página anterior"
                    >
                      ←
                    </button>

                    {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`${styles.pageBtn} ${page === currentActivityPage ? styles.pageBtnActive : ''}`}
                        onClick={() => setActivitiesPage(page)}
                        aria-label={`Ir a página ${page}`}
                        aria-current={page === currentActivityPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className={styles.pageBtn}
                      onClick={() => setActivitiesPage(Math.min(totalActivityPages, currentActivityPage + 1))}
                      disabled={currentActivityPage === totalActivityPages}
                      aria-label="Página siguiente"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.activitiesEmpty}>
                <p>Este proyecto aún no tiene actividades públicas disponibles.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {lightboxIndex !== null && projectImages[lightboxIndex] && (
        <div className={styles.lightbox} onClick={() => setLightboxIndex(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar"
          >
            ×
          </button>

          {projectImages.length > 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i === null ? i : (i - 1 + projectImages.length) % projectImages.length));
              }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
          )}

          <img
            className={styles.lightboxImg}
            src={getProxiedImageUrl(projectImages[lightboxIndex])}
            alt={`${project.Name} — imagen ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          {projectImages.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i === null ? i : (i + 1) % projectImages.length));
                }}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
              <span className={styles.lightboxCount}>
                {lightboxIndex + 1} / {projectImages.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ProjectDetailView;
