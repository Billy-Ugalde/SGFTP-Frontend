import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardPen } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ActivityDetailOverlay from '../components/ActivityDetailOverlay';
import ActivityEnrollmentPublicForm from '../../../Volunteers/Components/ActivityEnrollmentPublicForm';
import { usePublicActivities, getActivityLabels } from '../../../Activities/Services/ActivityService';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import { useCardsPerPage } from '../hooks/useCardsPerPage';
import Pagination from '../components/Pagination';
import styles from '../styles/AllActivitiesView.module.css';
import '../styles/public-view.css';

type ActivityType =
  | 'conference'
  | 'workshop'
  | 'reforestation'
  | 'garbage_collection'
  | 'special_event'
  | 'cleanup'
  | 'cultutal_event';

const ALL_TYPES: ActivityType[] = [
  'conference', 'workshop', 'reforestation',
  'garbage_collection', 'special_event', 'cleanup', 'cultutal_event',
];

const AllActivitiesView: React.FC = () => {
  const navigate = useNavigate();
  const { data: rawActivities, isLoading } = usePublicActivities();
  const PAGE_SIZE = useCardsPerPage();

  const [activeType, setActiveType]         = useState<ActivityType | null>(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  const [enrollActivity, setEnrollActivity] = useState<Activity | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  /* ── body padding-bottom (NewsTicker no existe aquí) ── */
  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = prev; };
  }, []);

  useEffect(() => { setCurrentPage(1); }, [PAGE_SIZE]);


  /* ── datos ── */
  const allActivities = useMemo((): Activity[] => {
    if (!rawActivities || !Array.isArray(rawActivities)) return [];
    return (rawActivities as Activity[]).filter(
      a => a.Active === true && a.OpenForRegistration === true,
    );
  }, [rawActivities]);

  const filtered = useMemo(() =>
    activeType ? allActivities.filter(a => a.Type_activity === activeType) : allActivities,
  [allActivities, activeType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const countByType = useMemo(() => {
    const counts: Partial<Record<ActivityType, number>> = {};
    for (const a of allActivities) {
      const t = a.Type_activity as ActivityType;
      counts[t] = (counts[t] ?? 0) + 1;
    }
    return counts;
  }, [allActivities]);

  const visibleTypes = ALL_TYPES.filter(t => (countByType[t] ?? 0) > 0);

  /* ── handlers ── */
  const handleFilterChange = (type: ActivityType | null) => {
    setActiveType(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (activity: Activity) => setDetailActivity(activity);

  const handleEnrollClick = (e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation();
    setEnrollActivity(activity);
    setShowEnrollModal(true);
  };

  const closeEnrollModal = () => {
    setShowEnrollModal(false);
    setEnrollActivity(null);
  };

  useEffect(() => {
    document.body.style.overflow = showEnrollModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showEnrollModal]);

  /* ── helpers de imagen ── */
  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com'))
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    return url;
  };

  const getActivityImage = (a: Activity): string => a.url1 || a.url2 || a.url3 || '';
  const isImageUrl = (img: string): boolean =>
    img.startsWith('http://') || img.startsWith('https://');

  /* ── helpers de fecha ── */
  const formatDate = (date: string | Date): string => {
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} / ${d.getFullYear()}`;
  };

  const getNextDate = (a: Activity): string => {
    if (!a.dateActivities?.length) return 'Fecha por definir';
    const sorted = [...a.dateActivities].sort(
      (x, y) => new Date(x.Start_date).getTime() - new Date(y.Start_date).getTime(),
    );
    return formatDate(sorted[0].Start_date);
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <>
      {/* Inscripción directa desde la card */}
      {showEnrollModal && enrollActivity && (
        <div className={styles.enrollOverlay} onClick={closeEnrollModal}>
          <div className={styles.enrollBox} onClick={e => e.stopPropagation()}>
            <button className={styles.enrollClose} onClick={closeEnrollModal}>×</button>
            <ActivityEnrollmentPublicForm
              activityId={enrollActivity.Id_activity}
              activityName={enrollActivity.Name}
              onSuccess={closeEnrollModal}
              onCancel={closeEnrollModal}
            />
          </div>
        </div>
      )}

      {/* Detalle al hacer clic en la card */}
      <ActivityDetailOverlay
        activity={detailActivity}
        onClose={() => setDetailActivity(null)}
      />

      {/* ── Página principal (siempre visible detrás del overlay) ── */}
      <div className={styles.page}>
        <Header hideNav onBack={() => navigate(-1)} />

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>Próximas Actividades</h1>
            {!isLoading && allActivities.length > 0 && (
              <p className={styles.heroSub}>
                {`${allActivities.length} ${allActivities.length === 1 ? 'actividad disponible' : 'actividades disponibles'}`}
              </p>
            )}
          </div>
        </header>

        <main className={styles.main}>

          {/* Filtros */}
          {!isLoading && visibleTypes.length > 0 && (
            <div className={styles.filtersBar}>
              <button
                className={`${styles.filterChip} ${!activeType ? styles.filterChipActive : ''}`}
                onClick={() => handleFilterChange(null)}
              >
                Todas
                <span className={styles.filterBadge}>{allActivities.length}</span>
              </button>
              {visibleTypes.map(t => (
                <button
                  key={t}
                  className={`${styles.filterChip} ${activeType === t ? styles.filterChipActive : ''}`}
                  onClick={() => handleFilterChange(activeType === t ? null : t)}
                >
                  {getActivityLabels.type[t] || t}
                  <span className={styles.filterBadge}>{countByType[t]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Cargando actividades…</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div className={styles.empty}>
              <p>No hay actividades {activeType ? 'con este filtro' : 'disponibles en este momento'}.</p>
              {activeType && (
                <button className={styles.emptyReset} onClick={() => handleFilterChange(null)}>
                  Ver todas
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!isLoading && filtered.length > 0 && (
            <div className={styles.grid}>
              {paginated.map(activity => {
                const img = getActivityImage(activity);
                return (
                  <article
                    key={activity.Id_activity}
                    className={styles.card}
                    onClick={() => handleCardClick(activity)}
                  >
                    <div className={styles.cardImgWrap}>
                      {isImageUrl(img) ? (
                        <img
                          src={getProxiedImageUrl(img)}
                          alt={activity.Name}
                          loading="lazy"
                          className={styles.cardImg}
                          onError={e => {
                            const t = e.target as HTMLImageElement;
                            t.style.display = 'none';
                            if (t.parentElement)
                              t.parentElement.innerHTML = `<span class="${styles.cardImgFallback}">🌱</span>`;
                          }}
                        />
                      ) : (
                        <span className={styles.cardImgFallback}>🌱</span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTop}>
                        <span className={styles.cardDate}>{getNextDate(activity)}</span>
                        <span className={styles.cardChip}>
                          {getActivityLabels.type[activity.Type_activity] || activity.Type_activity}
                        </span>
                      </div>
                      <h3 className={styles.cardTitle}>{activity.Name}</h3>
                      <p className={styles.cardDesc}>{activity.Description}</p>
                      <p className={styles.cardLocation}>
                        <strong>Ubicación:</strong> {activity.Location}
                      </p>
                      <div className={styles.cardActions}>
                        <button
                          className={styles.btnView}
                          onClick={e => { e.stopPropagation(); handleCardClick(activity); }}
                        >
                          Ver actividad
                        </button>
                        <button
                          className={styles.btnEnroll}
                          onClick={e => handleEnrollClick(e, activity)}
                        >
                          <ClipboardPen size={16} strokeWidth={2} />
                          Inscribirse
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              classes={styles}
            />
          )}

        </main>

        <Footer />
      </div>
    </>
  );
};

export default AllActivitiesView;
