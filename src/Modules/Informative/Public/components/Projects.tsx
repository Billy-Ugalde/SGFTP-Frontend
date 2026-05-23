import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../../Projects/Services/ProjectsServices';
import { API_BASE_URL } from '../../../../config/env';
import ProjectDetailOverlay from './ProjectDetailOverlay';
import projectsStyles from '../styles/Projects.module.css';

interface Props {
  projects: Project[];
}

const Projects: React.FC<Props> = ({ projects }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [itemsPerView, setItemsPerView] = useState<number>(3);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setItemsPerView(1);
      } else if (window.innerWidth <= 1100) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com'))
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    return url;
  };

  const isImageUrl = (image: string): boolean =>
    image.startsWith('http://') || image.startsWith('https://');

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (date: string): string => {
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} / ${d.getFullYear()}`;
  };

  const getProjectImage = (project: Project): string =>
    project.url_1 || project.url_2 || project.url_3 || '';

  const totalPages = Math.ceil(projects.length / itemsPerView);
  const startIndex = currentIndex * itemsPerView;
  const currentProjects = projects.slice(startIndex, startIndex + itemsPerView);

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

  return (
    <>
      <ProjectDetailOverlay
        project={detailProject}
        onClose={() => setDetailProject(null)}
      />

      <section className={`${projectsStyles.projectsSection} section`} id="proyectos">

        {/* Encabezado de sección con botón "Ver todos" */}
        <div className={projectsStyles.sectionHeader}>
          <h2 className={projectsStyles.sectionTitle}>Nuestros Proyectos</h2>
          <button
            className={projectsStyles.verTodosBtn}
            onClick={() => navigate('/proyectos')}
          >
            Ver todos →
          </button>
        </div>

        {projects.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>
            No hay proyectos disponibles en este momento.
          </p>
        ) : (
          <>
            {/* Contenedor del carrusel */}
            <div className={projectsStyles.projectsCarouselContainer}>
              {/* Botón anterior */}
              {totalPages > 1 && currentIndex > 0 && (
                <button
                  className={`${projectsStyles.carouselArrow} ${projectsStyles.carouselArrowPrev}`}
                  onClick={handlePrev}
                  aria-label="Anterior"
                >
                  ‹
                </button>
              )}

              {/* Grid de proyectos */}
              <div className={projectsStyles.projectsCarouselWrapper} ref={carouselRef}>
                <div
                  className={projectsStyles.projectsGrid}
                  style={{
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                >
                  {currentProjects.map((project) => {
                    const img = getProjectImage(project);
                    return (
                      <div
                        key={project.Id_project}
                        className={projectsStyles.projectCard}
                        onClick={() => setDetailProject(project)}
                      >
                        <div className={projectsStyles.projectImg}>
                          {isImageUrl(img) ? (
                            <img
                              src={getProxiedImageUrl(img)}
                              alt={project.Name}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.parentElement) target.parentElement.innerHTML = '🌱';
                              }}
                            />
                          ) : (
                            '🌱'
                          )}
                        </div>
                        <div className={projectsStyles.projectContent}>
                          <h3 className={projectsStyles.projectTitle}>{truncateText(project.Name, 50)}</h3>
                          <div className={projectsStyles.projectInfo}>
                            <p className={projectsStyles.projectField}>
                              <strong>Descripción:</strong>
                              <span className={projectsStyles.projectDescription}>{truncateText(project.Description, 120)}</span>
                            </p>
                            <p className={projectsStyles.projectField}>
                              <strong>Ubicación:</strong>
                              <span>{truncateText(project.Location, 40)}</span>
                            </p>
                            <p className={projectsStyles.projectField}>
                              <strong>Fecha de inicio:</strong>
                              <span>{formatDate(project.Start_date)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón siguiente */}
              {totalPages > 1 && currentIndex < totalPages - 1 && (
                <button
                  className={`${projectsStyles.carouselArrow} ${projectsStyles.carouselArrowNext}`}
                  onClick={handleNext}
                  aria-label="Siguiente"
                >
                  ›
                </button>
              )}
            </div>

            {/* Dots */}
            {totalPages > 1 && (
              <div className={projectsStyles.carouselDots}>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    className={`${projectsStyles.carouselDot} ${index === currentIndex ? projectsStyles.active : ''}`}
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

export default Projects;
