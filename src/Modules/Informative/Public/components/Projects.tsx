import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../../Projects/Services/ProjectsServices';
import { ProjectStatus } from '../../../Projects/Services/ProjectsServices';
import { API_BASE_URL } from '../../../../config/env';
import ProjectDetailOverlay from './ProjectDetailOverlay';
import projectsStyles from '../styles/Projects.module.css';

interface Props {
  projects: Project[];
}

const Projects: React.FC<Props> = ({ projects }) => {
  const navigate = useNavigate();
  const [detailProject, setDetailProject] = useState<Project | null>(null);

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

  const getStatusInfo = (project: Project): { label: string; done: boolean } => {
    if (project.Status === ProjectStatus.FINISHED)  return { label: 'Finalizado',    done: true  };
    if (project.Status === ProjectStatus.SUSPENDED) return { label: 'Suspendido',    done: true  };
    if (project.Status === ProjectStatus.EXECUTION) return { label: 'Activo',        done: false };
    if (project.Status === ProjectStatus.PLANNING)  return { label: 'Planificación', done: false };
    return { label: 'Pendiente', done: false };
  };

  return (
    <>
      <ProjectDetailOverlay
        project={detailProject}
        onClose={() => setDetailProject(null)}
      />

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
            No hay proyectos disponibles en este momento.
          </p>
        ) : (
          <div className={projectsStyles.projectsGrid}>
            {projects.map((project) => {
              const img = getProjectImage(project);
              const { label: statusLabel, done } = getStatusInfo(project);
              return (
                <div
                  key={project.Id_project}
                  className={projectsStyles.projectCard}
                  onClick={() => setDetailProject(project)}
                >
                  <div className={projectsStyles.projectImg}>
                    <span className={`${projectsStyles.projectStatus} ${done ? projectsStyles.done : ''}`}>
                      {statusLabel}
                    </span>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </section>
    </>
  );
};

export default Projects;
