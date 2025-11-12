import React, { useState, useRef, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import type { ProjectItem } from '../../services/informativeService';
import type { Project } from '../../../Projects/Services/ProjectsServices';
import projectsStyles from '../styles/Projects.module.css';

interface Props {
  data: ProjectItem[];
  fullProjects: Project[];
}

const Projects: React.FC<Props> = ({ data, fullProjects }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [itemsPerView, setItemsPerView] = useState<number>(3); 
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

  const isImageUrl = (image: string): boolean => {
    return image.startsWith('http://') || image.startsWith('https://');
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleProjectClick = (projectTitle: string) => {
    const fullProject = fullProjects.find((p) => p.Name === projectTitle);
    if (fullProject) {
      navigate(`/proyecto/${fullProject.Slug}`);
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerView);

  const startIndex = currentIndex * itemsPerView;
  const endIndex = startIndex + itemsPerView;
  const currentProjects = data.slice(startIndex, endIndex);

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
    <section className={`${projectsStyles.projectsSection} section`} id="proyectos">
      <h2 className={projectsStyles.sectionTitle}>Proyectos de la Fundación</h2>

      {data.length === 0 ? (
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
                {currentProjects.map((project, index) => (
                  <div
                    className={projectsStyles.projectCard}
                    key={index}
                    onClick={() => handleProjectClick(project.title)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={projectsStyles.projectImg}>
                      {isImageUrl(project.image) ? (
                        <img
                          src={project.image}
                          alt={project.title}
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
                        project.image
                      )}
                    </div>
                    <div className={projectsStyles.projectContent}>
                      <h3 className={projectsStyles.projectTitle}>{truncateText(project.title, 50)}</h3>
                      <div className={projectsStyles.projectInfo}>
                        <p className={projectsStyles.projectField}>
                          <strong>Descripción:</strong>
                          <span className={projectsStyles.projectDescription}>{truncateText(project.description, 120)}</span>
                        </p>
                        <p className={projectsStyles.projectField}>
                          <strong>Ubicación:</strong>
                          <span>{truncateText(project.location, 40)}</span>
                        </p>
                        <p className={projectsStyles.projectField}>
                          <strong>Fecha de inicio:</strong>
                          <span>{project.startDate}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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

          {/* Indicadores de página (dots) */}
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
  );
};

export default Projects;