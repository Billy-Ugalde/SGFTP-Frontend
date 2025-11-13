import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import { ClipboardPen, Calendar } from 'lucide-react';
import ActivityEnrollmentPublicForm from '../../../Volunteers/Components/ActivityEnrollmentPublicForm';
import eventsStyles from '../styles/Events.module.css';

interface Props {
  data: Activity[];
}

type ActivityType = 'conference' | 'workshop' | 'reforestation' | 'garbage_collection' | 'special_event' | 'cleanup' | 'cultutal_event';

const PAGE_SIZE = 4;

const Events: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTypes, setActiveTypes] = useState<Record<ActivityType, boolean>>({
    conference: false,
    workshop: false,
    reforestation: false,
    garbage_collection: false,
    special_event: false,
    cleanup: false,
    cultutal_event: false,
  });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current) return;
      const clickedInsideButtonArea = wrapRef.current.contains(t);
      const clickedInsidePanel = panelRef.current?.contains(t) ?? false;
      if (!clickedInsideButtonArea && !clickedInsidePanel) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

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
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
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
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const goToPage = (pageIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(pageIndex);
      setIsTransitioning(false);
    }, 300);
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

  const handleActivityClick = (activityId: number) => {
    navigate(`/actividad/${activityId}`);
  };

  const handleEnrollClick = (e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation();
    setSelectedActivity(activity);
    setShowEnrollmentModal(true);
  };

  const closeEnrollmentModal = () => {
    setShowEnrollmentModal(false);
    setSelectedActivity(null);
  };

  return (
    <>
      {/* Modal de inscripción */}
      {showEnrollmentModal && selectedActivity && (
        <div className={eventsStyles.enrollmentModalOverlay} onClick={closeEnrollmentModal}>
          <div className={eventsStyles.enrollmentModal} onClick={(e) => e.stopPropagation()}>
            <button className={eventsStyles.modalCloseBtn} onClick={closeEnrollmentModal}>
              ×
            </button>
            <ActivityEnrollmentPublicForm
              activityId={selectedActivity.Id_activity}
              activityName={selectedActivity.Name}
              onSuccess={closeEnrollmentModal}
              onCancel={closeEnrollmentModal}
            />
          </div>
        </div>
      )}
      <section className={`${eventsStyles.eventsSection} section`} id="eventos">
        <h2 className={eventsStyles.sectionTitle}>Próximos Eventos</h2>

        <div className={eventsStyles.eventsSingle}>
          {/* Barra de filtros */}
          <div className={eventsStyles.eventsToolbar}>
            <p className={eventsStyles.eventsQuestion}>¿Qué tipo de actividad quieres ver?</p>

            <div className={eventsStyles.eventsFilterwrap} ref={wrapRef}>
              <button
                className={eventsStyles.eventsFilterbtn}
                onClick={() => setPanelOpen(o => !o)}
                aria-expanded={panelOpen}
                aria-haspopup="dialog"
              >
                Filtros {appliedCount ? `(${appliedCount})` : '(0)'}
              </button>

              <div
                ref={panelRef}
                className={`${eventsStyles.eventsSidepanel} ${panelOpen ? eventsStyles.open : ''}`}
                role="dialog"
                aria-label="Filtros"
              >
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
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className={eventsStyles.eventsEmpty}>
              No hay eventos disponibles con los filtros seleccionados.
            </div>
          ) : (
            <>
              {/* Contenedor del carrusel */}
              <div className={eventsStyles.eventsCarouselContainer}>
                {/* Botón anterior */}
                {totalPages > 1 && currentIndex > 0 && (
                  <button
                    className={`${eventsStyles.carouselArrow} ${eventsStyles.carouselArrowPrev}`}
                    onClick={handlePrev}
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                )}

                {/* Grid de eventos con transición */}
                <div className={eventsStyles.eventsCarouselWrapper}>
                  <div
                    className={eventsStyles.eventsGrid}
                    style={{
                      opacity: isTransitioning ? 0 : 1,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  >
                    {currentActivities.map((activity) => (
                      <article
                        key={activity.Id_activity}
                        className={eventsStyles.eventsCard}
                        onClick={() => handleActivityClick(activity.Id_activity)}
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

                        {/* Contenido */}
                        <div className={eventsStyles.eventCardContent}>
                          <div className={eventsStyles.eventsDate}>
                            <Calendar size={16} strokeWidth={2} />
                            {getNextActivityDate(activity)}
                          </div>
                          <h4 className={eventsStyles.eventsTitle}>{truncateText(activity.Name, 60)}</h4>
                          <p className={eventsStyles.eventsDesc}>{truncateText(activity.Description, 100)}</p>
                          <p className={eventsStyles.eventsType}>
                            <strong>Tipo:</strong> {getActivityLabels.type[activity.Type_activity] || activity.Type_activity}
                          </p>
                          <p className={eventsStyles.eventsLocation}>
                            <strong>Ubicación:</strong> {truncateText(activity.Location, 50)}
                          </p>
                          <button
                            className={eventsStyles.btnEnroll}
                            onClick={(e) => handleEnrollClick(e, activity)}
                          >
                            <ClipboardPen size={18} strokeWidth={2} />
                            Inscribirse
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Botón siguiente */}
                {totalPages > 1 && currentIndex < totalPages - 1 && (
                  <button
                    className={`${eventsStyles.carouselArrow} ${eventsStyles.carouselArrowNext}`}
                    onClick={handleNext}
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
                )}
              </div>

              {/* Indicadores de página (dots) */}
              {totalPages > 1 && (
                <div className={eventsStyles.carouselDots}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      className={`${eventsStyles.carouselDot} ${index === currentIndex ? eventsStyles.active : ''}`}
                      onClick={() => goToPage(index)}
                      aria-label={`Ir a página ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;
