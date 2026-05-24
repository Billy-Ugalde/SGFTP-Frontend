import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import { ClipboardPen } from 'lucide-react';
import ActivityDetailOverlay from './ActivityDetailOverlay';
import ActivityEnrollmentPublicForm from '../../../Volunteers/Components/ActivityEnrollmentPublicForm';
import eventsStyles from '../styles/Events.module.css';

interface Props {
  data: Activity[];
}

type ActivityType = 'conference' | 'workshop' | 'reforestation' | 'garbage_collection' | 'special_event' | 'cleanup' | 'cultutal_event';

const PAGE_SIZE = 2;
const ROTATION_MS = 8000;
const TRANSITION_MS = 400;

const Events: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const [detailActivity, setDetailActivity]     = useState<Activity | null>(null);
  const [enrollActivity, setEnrollActivity]     = useState<Activity | null>(null);
  const [showEnrollModal, setShowEnrollModal]   = useState(false);

  const [activeTypes, setActiveTypes] = useState<Record<ActivityType, boolean>>({
    conference: false,
    workshop: false,
    reforestation: false,
    garbage_collection: false,
    special_event: false,
    cleanup: false,
    cultutal_event: false,
  });

  const isPausedRef = useRef(false);

  const toggleType = (key: ActivityType) =>
    setActiveTypes(prev => ({ ...prev, [key]: !prev[key] }));

  const appliedCount = Object.values(activeTypes).filter(Boolean).length;

  const filteredActivities = useMemo(() => {
    let filtered = data.filter(activity => {
      return activity.Active === true && activity.OpenForRegistration === true;
    });

    const selectedTypes = (Object.keys(activeTypes) as ActivityType[]).filter(k => activeTypes[k]);
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(activity => selectedTypes.includes(activity.Type_activity));
    }

    return filtered;
  }, [data, activeTypes]);

  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const isImageUrl = (image: string): boolean => {
    return image.startsWith('http://') || image.startsWith('https://');
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (date: string | Date): string => {
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} / ${d.getFullYear()}`;
  };

  const totalPages = Math.ceil(filteredActivities.length / PAGE_SIZE);
  const startIndex = currentIndex * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTypes]);

  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsTransitioning(false);
      }, TRANSITION_MS);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsTransitioning(false);
      }, TRANSITION_MS);
    }
  };

  const goToPage = (pageIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(pageIndex);
      setIsTransitioning(false);
    }, TRANSITION_MS);
  };

  const getActivityImage = (activity: Activity): string => {
    return activity.url1 || activity.url2 || activity.url3 || '🌱';
  };

  const getNextActivityDate = (activity: Activity): string => {
    if (!activity.dateActivities || activity.dateActivities.length === 0) {
      return 'Fecha por definir';
    }

    const sortedDates = [...activity.dateActivities].sort((a, b) => {
      return new Date(a.Start_date).getTime() - new Date(b.Start_date).getTime();
    });

    return formatDate(sortedDates[0].Start_date);
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

  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      if (isPausedRef.current) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % totalPages);
        setIsTransitioning(false);
      }, TRANSITION_MS);
    }, ROTATION_MS);
    return () => clearInterval(timer);
  }, [currentIndex, totalPages]);

  return (
    <>
      {/* Inscripción directa desde la card */}
      {showEnrollModal && enrollActivity && (
        <div className={eventsStyles.enrollmentModalOverlay} onClick={closeEnrollModal}>
          <div className={eventsStyles.enrollmentModal} onClick={e => e.stopPropagation()}>
            <button className={eventsStyles.modalCloseBtn} onClick={closeEnrollModal}>×</button>
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
      <section className={`${eventsStyles.eventsSection} section`} id="eventos">
        <h2 className="section-title">Próximas Actividades</h2>

        <div className={eventsStyles.eventsSingle}>

          {/* Columna principal: Cards */}
          <div
            className={eventsStyles.eventsBody}
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
          >
            {filteredActivities.length === 0 ? (
              <div className={eventsStyles.eventsEmpty}>
                No hay eventos disponibles con los filtros seleccionados.
              </div>
            ) : (
              <div className={eventsStyles.eventsCarouselWrapper}>
                <div
                  key={currentIndex}
                  className={`${eventsStyles.eventsGrid} ${isTransitioning ? eventsStyles.eventsGridOut : eventsStyles.eventsGridIn}`}
                >
                  {currentActivities.map((activity) => (
                    <article
                      key={activity.Id_activity}
                      className={eventsStyles.eventsCard}
                      onClick={() => handleCardClick(activity)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Imagen */}
                      <div className={eventsStyles.eventImageContainer}>
                        {isImageUrl(getActivityImage(activity)) ? (
                          <img
                            src={getProxiedImageUrl(getActivityImage(activity))}
                            alt={activity.Name}
                            loading="lazy"
                            className={eventsStyles.eventImage}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = '<span class="' + eventsStyles.eventImageFallback + '">🌱</span>';
                              }
                            }}
                          />
                        ) : (
                          <span className={eventsStyles.eventImageFallback}>🌱</span>
                        )}
                      </div>

                      {/* Fecha — columna izquierda del timeline */}
                      <div className={eventsStyles.eventsDate}>
                        {getNextActivityDate(activity)}
                      </div>

                      {/* Contenido — columna derecha del timeline */}
                      <div className={eventsStyles.eventCardContent}>
                        <div className={eventsStyles.eventsCardHeader}>
                          <h4 className={eventsStyles.eventsTitle}>{truncateText(activity.Name, 60)}</h4>
                          <span className={eventsStyles.eventsChip}>
                            {getActivityLabels.type[activity.Type_activity] || activity.Type_activity}
                          </span>
                        </div>
                        <p className={eventsStyles.eventsDesc}>{truncateText(activity.Description, 100)}</p>
                        <p className={eventsStyles.eventsLocation}>
                          <strong>Ubicación:</strong> {truncateText(activity.Location, 50)}
                        </p>
                        <button
                          className={eventsStyles.btnEnroll}
                          onClick={e => handleEnrollClick(e, activity)}
                        >
                          <ClipboardPen size={18} strokeWidth={2} />
                          Inscribirse
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho: Ver Todas + Filtros + Controles */}
          <div className={eventsStyles.eventsRightPanel}>
            <button className={eventsStyles.eventsVerTodas} onClick={() => navigate('/actividades')}>
              Ver todas →
            </button>

            <div className={eventsStyles.eventsFilterSide}>
              <p className={eventsStyles.eventsFilterLabel}>
                Filtros
                {appliedCount > 0 && (
                  <span className={eventsStyles.eventsFilterCount}>{appliedCount}</span>
                )}
              </p>
              <ul className={eventsStyles.eventsFilterList}>
                {(['conference', 'workshop', 'reforestation', 'garbage_collection', 'special_event', 'cleanup', 'cultutal_event'] as ActivityType[]).map(t => (
                  <li key={t}>
                    <label className={eventsStyles.eventsCheck}>
                      <input
                        type="checkbox"
                        checked={activeTypes[t]}
                        onChange={() => toggleType(t)}
                      />
                      <span>{getActivityLabels.type[t] || t}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {totalPages > 1 && (
              <div
                className={eventsStyles.eventsControlsSide}
                onMouseEnter={() => { isPausedRef.current = true; }}
                onMouseLeave={() => { isPausedRef.current = false; }}
              >
                <button
                  className={`${eventsStyles.carouselArrow} ${eventsStyles.carouselArrowPrev}`}
                  onClick={handlePrev}
                  aria-label="Anterior"
                  disabled={currentIndex === 0}
                >
                  ↑
                </button>

                <div className={eventsStyles.carouselDots}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      className={`${eventsStyles.carouselDot} ${index === currentIndex ? eventsStyles.active : ''}`}
                      onClick={() => goToPage(index)}
                      aria-label={`Ir a actividad ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  className={`${eventsStyles.carouselArrow} ${eventsStyles.carouselArrowNext}`}
                  onClick={handleNext}
                  aria-label="Siguiente"
                  disabled={currentIndex === totalPages - 1}
                >
                  ↓
                </button>
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
};

export default Events;
