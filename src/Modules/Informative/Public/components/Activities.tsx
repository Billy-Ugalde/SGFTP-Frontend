import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import ActivityEnrollmentPublicForm from '../../../Volunteers/Components/ActivityEnrollmentPublicForm';
import activitiesStyles from '../styles/Activities.module.css';

interface Props {
  data: Activity[];
}

const Activities: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsPerView = 3;

  // Estado para el modal de inscripción
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

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

  const totalPages = Math.ceil(data.length / itemsPerView);
  const startIndex = currentIndex * itemsPerView;
  const endIndex = startIndex + itemsPerView;
  const currentActivities = data.slice(startIndex, endIndex);

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
    e.stopPropagation(); // Prevenir que se navegue al detalle
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
        <div className={activitiesStyles.enrollmentModalOverlay} onClick={closeEnrollmentModal}>
          <div className={activitiesStyles.enrollmentModal} onClick={(e) => e.stopPropagation()}>
            <button className={activitiesStyles.modalCloseBtn} onClick={closeEnrollmentModal}>
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
    <section className={`${activitiesStyles.projectsSection} section`} id="actividades">
      <h2 className={activitiesStyles.sectionTitle}>Actividades de la Fundación</h2>

      {data.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>
          No hay actividades disponibles en este momento.
        </p>
      ) : (
        <>
          {/* Contenedor del carrusel */}
          <div className={activitiesStyles.projectsCarouselContainer}>
            {/* Botón anterior */}
            {totalPages > 1 && currentIndex > 0 && (
              <button
                className={`${activitiesStyles.carouselArrow} ${activitiesStyles.carouselArrowPrev}`}
                onClick={handlePrev}
                aria-label="Anterior"
              >
                ‹
              </button>
            )}

            {/* Grid de actividades */}
            <div className={activitiesStyles.projectsCarouselWrapper} ref={carouselRef}>
              <div
                className={activitiesStyles.projectsGrid}
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transition: 'opacity 0.3s ease-in-out',
                }}
              >
                {currentActivities.map((activity) => (
                  <div
                    className={activitiesStyles.projectCard}
                    key={activity.Id_activity}
                    onClick={() => handleActivityClick(activity.Id_activity)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={activitiesStyles.projectImg}>
                      {isImageUrl(getActivityImage(activity)) ? (
                        <img
                          src={getProxiedImageUrl(getActivityImage(activity))}
                          alt={activity.Name}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 'inherit'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = '🌱';
                            }
                          }}
                        />
                      ) : (
                        getActivityImage(activity)
                      )}
                    </div>
                    <div className={activitiesStyles.projectContent}>
                      <h3 className={activitiesStyles.projectTitle}>{truncateText(activity.Name, 50)}</h3>
                      <div className={activitiesStyles.projectInfo}>
                        <p className={activitiesStyles.projectField}>
                          <strong>Descripción:</strong>
                          <span className={activitiesStyles.projectDescription}>{truncateText(activity.Description, 120)}</span>
                        </p>
                        <p className={activitiesStyles.projectField}>
                          <strong>Tipo:</strong>
                          <span>{getActivityLabels.type[activity.Type_activity] || activity.Type_activity}</span>
                        </p>
                        <p className={activitiesStyles.projectField}>
                          <strong>Ubicación:</strong>
                          <span>{truncateText(activity.Location, 40)}</span>
                        </p>
                        <p className={activitiesStyles.projectField}>
                          <strong>Próxima fecha:</strong>
                          <span>{getNextActivityDate(activity)}</span>
                        </p>
                      </div>
                      <button
                        className={activitiesStyles.btnEnroll}
                        onClick={(e) => handleEnrollClick(e, activity)}
                      >
                        📝 Inscribirse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón siguiente */}
            {totalPages > 1 && currentIndex < totalPages - 1 && (
              <button
                className={`${activitiesStyles.carouselArrow} ${activitiesStyles.carouselArrowNext}`}
                onClick={handleNext}
                aria-label="Siguiente"
              >
                ›
              </button>
            )}
          </div>

          {/* Indicadores de página (dots) */}
          {totalPages > 1 && (
            <div className={activitiesStyles.carouselDots}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`${activitiesStyles.carouselDot} ${index === currentIndex ? activitiesStyles.active : ''}`}
                  onClick={() => goToPage(index)}
                  aria-label={`Ir a página ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
    </>
  );
};

export default Activities;
