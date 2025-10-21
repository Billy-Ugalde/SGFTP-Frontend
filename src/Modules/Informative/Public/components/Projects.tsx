import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectItem } from '../../services/informativeService';
import type { Project } from '../../../Projects/Services/ProjectsServices';

interface Props {
  data: ProjectItem[];
  fullProjects: Project[]; 
}

const Projects: React.FC<Props> = ({ data, fullProjects }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsPerView = 3; 

  
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
      navigate(`/proyecto/${fullProject.Id_project}`);
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
    <section className="projects-section section" id="proyectos">
      <h2 className="section-title">Eventos Realizados</h2>

      {data.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>
          No hay proyectos disponibles en este momento.
        </p>
      ) : (
        <>
          {/* Contenedor del carrusel */}
          <div className="projects-carousel-container">
            {/* Botón anterior */}
            {totalPages > 1 && currentIndex > 0 && (
              <button
                className="carousel-arrow carousel-arrow-prev"
                onClick={handlePrev}
                aria-label="Anterior"
              >
                ‹
              </button>
            )}

            {/* Grid de proyectos */}
            <div className="projects-carousel-wrapper" ref={carouselRef}>
              <div
                className="projects-grid"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transition: 'opacity 0.3s ease-in-out',
                }}
              >
                {currentProjects.map((project, index) => (
                  <div
                    className="project-card"
                    key={index}
                    onClick={() => handleProjectClick(project.title)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="project-img">
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
                    <div className="project-content">
                      <h3 className="project-title">{truncateText(project.title, 50)}</h3>
                      <div className="project-info">
                        <p className="project-field">
                          <strong>Descripción:</strong>
                          <span className="project-description">{truncateText(project.description, 120)}</span>
                        </p>
                        <p className="project-field">
                          <strong>Ubicación:</strong>
                          <span>{truncateText(project.location, 40)}</span>
                        </p>
                        <p className="project-field">
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
                className="carousel-arrow carousel-arrow-next"
                onClick={handleNext}
                aria-label="Siguiente"
              >
                ›
              </button>
            )}
          </div>

          {/* Indicadores de página (dots) */}
          {totalPages > 1 && (
            <div className="carousel-dots">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
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
