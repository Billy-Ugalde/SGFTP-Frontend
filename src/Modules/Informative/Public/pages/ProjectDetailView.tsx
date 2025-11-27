import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectBySlug, useActivitiesByProject } from '../../../Projects/Services/ProjectsServices';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import { FileText, Target, Calendar, MapPin } from 'lucide-react';
import '../styles/ProjectDetailView.css';

const ProjectDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: isLoadingProject, error: projectError } = useProjectBySlug(slug);
  const { data: activities, isLoading: isLoadingActivities } = useActivitiesByProject(project?.Id_project);

  const handleBackToProjects = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('proyectos');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };


  const filteredActivities = activities?.filter(
    (activity: Activity) =>
      activity.Status_activity === 'execution' || activity.Status_activity === 'finished'
  ) || [];


  const uniqueLocations = React.useMemo(() => {
    if (!filteredActivities || filteredActivities.length === 0) return [];
    const locations = filteredActivities
      .map((activity: Activity) => activity.Location)
      .filter((location): location is string => !!location && location.trim() !== '');
    return Array.from(new Set(locations));
  }, [filteredActivities]);


  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';

    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }

    return url;
  };

  const projectImages = project
    ? [project.url_1, project.url_2, project.url_3, project.url_4, project.url_5, project.url_6].filter(
        (url): url is string => !!url && url.trim() !== ''
      )
    : [];


  const heroImage = projectImages[0] ? getProxiedImageUrl(projectImages[0]) : undefined;
  const galleryImages = projectImages.slice(1).map(getProxiedImageUrl);

  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

 
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoadingProject) {
    return (
      <div className="project-detail-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (projectError || !project || !project.Active) {
    return (
      <div className="project-detail-error">
        <div className="error-container">
          <h2>Proyecto no encontrado</h2>
          <p>El proyecto que buscas no existe o no está disponible públicamente.</p>
          <button onClick={handleBackToProjects} className="btn-back-home">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      {/* Botón volver*/}
      <button onClick={handleBackToProjects} className="fixed-back-btn">
        ← Volver a proyectos
      </button>

      {/* Hero con imagen de fondo */}
      <section className="project-hero-image" style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'none' }}>
        <div className="hero-overlay">
          <div className="hero-content-wrapper">
            <h1 className="hero-title">{project.Name}</h1>
          </div>
        </div>
      </section>

      <main className="project-detail-main">
        {/* Sección - Descripción, Objetivo y Fecha */}
        <section className="narrative-section">
          <div className="narrative-step">
            <div className="narrative-icon-wrapper">
              <FileText className="narrative-icon" size={80} strokeWidth={1.5} />
            </div>
            <div className="narrative-content">
              <h3>Acerca del Proyecto</h3>
              <p>{project.Description}</p>
            </div>
          </div>

          <div className="narrative-step">
            <div className="narrative-icon-wrapper">
              <Target className="narrative-icon" size={80} strokeWidth={1.5} />
            </div>
            <div className="narrative-content">
              <h3>Nuestro Objetivo</h3>
              <p>{project.Aim}</p>
            </div>
          </div>

          <div className="narrative-step">
            <div className="narrative-icon-wrapper">
              <Calendar className="narrative-icon" size={80} strokeWidth={1.5} />
            </div>
            <div className="narrative-content">
              <h3>Fecha de Inicio</h3>
              <p className="start-date-text">{formatDate(project.Start_date)}</p>
            </div>
          </div>
        </section>

        {/* Métricas*/}
        <section className="metrics-section">
          <div className="metrics-header">
            <h2>Métricas en Tiempo Real</h2>
            <p>Impacto acumulado desde el inicio del proyecto</p>
          </div>
          <div className="metrics-grid-prototype">
            <div className="metric-item-prototype">
              <span className="metric-number-prototype">{project.METRIC_TOTAL_BENEFICIATED}</span>
              <span className="metric-label-prototype">Beneficiarios</span>
            </div>
            <div className="metric-item-prototype">
              <span className="metric-number-prototype">{project.METRIC_TOTAL_TREES_PLANTED}</span>
              <span className="metric-label-prototype">Árboles Plantados</span>
            </div>
            <div className="metric-item-prototype">
              <span className="metric-number-prototype">{project.METRIC_TOTAL_WASTE_COLLECTED}</span>
              <span className="metric-label-prototype">Residuos Recolectados (kg)</span>
            </div>
          </div>
        </section>

        {/* Población Objetivo */}
        <section className="target-population-section">
          <h2 className="section-title-centered">Población Objetivo</h2>
          <div className="target-content">
            <p>{project.Target_population}</p>
          </div>
        </section>

        {/* Ubicaciones del Proyecto */}
        {uniqueLocations.length > 0 && (
          <section className="locations-section">
            <div className="locations-container">
              <h3 className="locations-title">
                <MapPin size={32} strokeWidth={2} />
                Ubicaciones del Proyecto
              </h3>
              <ul className="location-list">
                {uniqueLocations.map((location, index) => (
                  <li key={index}>{location}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Galería de Imágenes*/}
        {galleryImages.length > 0 && (
          <section className="gallery-section">
            <h2 className="section-title-centered">Galería del Proyecto</h2>
            <div className="gallery-grid">
              {galleryImages.map((image, index) => (
                <div key={index} className="gallery-item">
                  <img src={image} alt={`${project.Name} - Imagen ${index + 2}`} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actividades relacionadas */}
        <section className="project-activities-section">
          <h2 className="activities-title">Actividades del Proyecto</h2>

          {isLoadingActivities ? (
            <div className="activities-loading">
              <div className="spinner"></div>
              <p>Cargando actividades...</p>
            </div>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <div className="activities-grid">
              {filteredActivities.map((activity: Activity) => (
                <div key={activity.Id_activity} className="activity-card">
                  <h3 className="activity-name">{activity.Name}</h3>
                  <p className="activity-description">{activity.Description}</p>

                  <div className="activity-details">
                    <div className="activity-detail-item">
                      <strong>Ubicación:</strong> {activity.Location}
                    </div>
                    <div className="activity-detail-item">
                      <strong>Enfoque:</strong> {activity.Approach}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="activities-empty">
              <p>Este proyecto aún no tiene actividades activas o finalizadas.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProjectDetailView;
