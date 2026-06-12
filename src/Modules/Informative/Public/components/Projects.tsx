import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../../Projects/Services/ProjectsServices';
import { API_BASE_URL } from '../../../../config/env';
import { useCardsPerPage } from '../hooks/useCardsPerPage';
import projectsStyles from '../styles/Projects.module.css';

interface Props {
  projects: Project[];
}

const Projects: React.FC<Props> = ({ projects }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const perPage = useCardsPerPage();

  useEffect(() => { setPage(0); }, [perPage]);

  const totalPages = Math.ceil(projects.length / perPage);
  const visibleProjects = projects.slice(page * perPage, page * perPage + perPage);

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

  const handleProjectClick = (project: Project) => {
    navigate(`/proyecto/${project.Slug ?? project.Id_project}`);
  };

  return (
    <>
      <section className={projectsStyles.projectsSection} id="proyectos">
      <div className="section">

        {/* Encabezado: kicker + título izquierda, "Ver todos" derecha */}
        <div className={projectsStyles.sectionHeader}>
          <div>
            <div className={projectsStyles.sectionKicker}>04 — En desarrollo</div>
            <h2 className={projectsStyles.sectionTitle}>Nuestros <em>proyectos</em></h2>
          </div>
          <button
            className={projectsStyles.verTodosBtn}
            onClick={() => navigate('/proyectos')}
          >
            Ver todos →
          </button>
        </div>

        <p className={projectsStyles.sectionLead}>
          Iniciativas activas que estamos impulsando desde la fundación para transformar Guanacaste.
        </p>

        {projects.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>
            En este momento no hay proyectos disponibles para mostrar.
          </p>
        ) : (
          <div className={projectsStyles.projectsGrid}>
            {visibleProjects.map((project) => {
              const img = getProjectImage(project);
              return (
                <div
                  key={project.Id_project}
                  className={projectsStyles.projectCard}
                  onClick={() => handleProjectClick(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProjectClick(project);
                    }
                  }}
                >
                  <div className={projectsStyles.projectImg}>
                    {isImageUrl(img) ? (
                      <img
                        src={getProxiedImageUrl(img)}
                        alt={project.Name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  <div className={projectsStyles.projectBody}>
                    <h3 className={projectsStyles.projectTitle}>{truncateText(project.Name, 50)}</h3>
                    <p className={projectsStyles.projectDesc}>{truncateText(project.Description, 120)}</p>
                    <div className={projectsStyles.projectFoot}>
                      <span>Inicio: {formatDate(project.Start_date)}</span>
                      <span>{truncateText(project.Location, 30)}</span>
                    </div>
                    <button
                      className={projectsStyles.projectDetailBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectClick(project);
                      }}
                    >
                      Ver proyecto
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className={projectsStyles.projectsNav}>
            <button
              className={projectsStyles.projectsNavBtn}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Anterior"
            >
              ←
            </button>
            <div className={projectsStyles.projectsNavDots}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${projectsStyles.projectsNavDot} ${i === page ? projectsStyles.projectsNavDotActive : ''}`}
                  onClick={() => setPage(i)}
                  aria-label={`Página ${i + 1}`}
                />
              ))}
            </div>
            <button
              className={projectsStyles.projectsNavBtn}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Siguiente"
            >
              →
            </button>
          </div>
        )}
      </div>
      </section>
    </>
  );
};

export default Projects;
