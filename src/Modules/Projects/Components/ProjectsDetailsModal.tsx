import { useState, useCallback } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import type { Project } from '../Services/ProjectsServices';
import type { Activity } from '../../Activities/Services/ActivityService';
import { useActivitiesByProject } from '../Services/ProjectsServices';
import '../Styles/ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
  project: Project | null;
  show: boolean;
  onClose: () => void;
}

const ProjectDetailsModal = ({ project, show, onClose }: ProjectDetailsModalProps) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'metrics' | 'images' | 'activities'>('basic');
  
  const { data: activities = [], isLoading: activitiesLoading } = useActivitiesByProject(project?.Id_project);

  // Función para convertir URL de Drive al formato proxy
  const getProxyImageUrl = useCallback((url: string): string => {
    if (!url) return '';

    // Si ya es una URL de proxy, devolverla tal cual
    if (url.includes('/images/proxy')) return url;

    // Si es una URL de Google Drive, usar el proxy
    if (url.includes('drive.google.com')) {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001';
      return `${baseUrl}/images/proxy?url=${encodeURIComponent(url)}`;
    }

    // Para otras URLs, devolver tal cual
    return url;
  }, []);

  // Función para obtener URL de fallback
  const getFallbackUrl = useCallback((url: string): string | null => {
    if (!url || !url.includes('drive.google.com')) return null;

    // Extraer ID del archivo
    let fileId: string | null = null;
    const patterns = [
      /thumbnail\?id=([^&]+)/,
      /[?&]id=([^&]+)/,
      /\/d\/([^\/]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }

    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    return null;
  }, []);

  // Componente para renderizar una imagen individual
  const ImageDisplay = useCallback(({ url, alt, imageKey }: { url: string; alt: string; imageKey: string }) => {
    const proxyUrl = getProxyImageUrl(url);
    const hasError = imageLoadErrors[imageKey];

    return (
      <div className="project-details__image-container">
        {proxyUrl && !hasError ? (
          <img
            src={proxyUrl}
            alt={alt}
            className="project-details__image"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error(`Error loading image ${imageKey}:`, proxyUrl);
              const target = e.currentTarget as HTMLImageElement;

              if (!target.dataset.fallbackAttempted) {
                target.dataset.fallbackAttempted = 'true';
                const fallbackUrl = getFallbackUrl(url);
                if (fallbackUrl && fallbackUrl !== proxyUrl) {
                  console.log(`Trying fallback URL for ${imageKey}:`, fallbackUrl);
                  target.src = fallbackUrl;
                  return;
                }
              }

              setImageLoadErrors(prev => ({ ...prev, [imageKey]: true }));
              target.style.display = 'none';
            }}
            onLoad={(e) => {
              setImageLoadErrors(prev => ({ ...prev, [imageKey]: false }));
              e.currentTarget.style.display = 'block';
            }}
            style={{ display: hasError ? 'none' : 'block' }}
          />
        ) : null}

        {(!proxyUrl || hasError) && (
          <div className="project-details__image-placeholder">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={hasError
                  ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                }
              />
            </svg>
            <span>
              {hasError ? 'Error al cargar imagen' : 'Sin imagen'}
            </span>
          </div>
        )}
      </div>
    );
  }, [getProxyImageUrl, getFallbackUrl, imageLoadErrors]);

  // Función para formatear fecha de actividades
  const formatActivityDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para obtener información del estado de la actividad
  const getActivityStatusInfo = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: string } } = {
      'pending': { label: 'Pendiente', color: 'project-details__status--pending' },
      'planning': { label: 'Planificación', color: 'project-details__status--planning' },
      'execution': { label: 'Ejecución', color: 'project-details__status--execution' },
      'suspended': { label: 'Suspendido', color: 'project-details__status--suspended' },
      'finished': { label: 'Finalizado', color: 'project-details__status--finished' }
    };
    return statusConfig[status.toLowerCase()] || { label: status, color: 'project-details__status--unknown' };
  };

  // Componente para renderizar una actividad individual
  const ActivityItem = useCallback(({ activity }: { activity: Activity }) => {
    const statusInfo = getActivityStatusInfo(activity.Status_activity);
    
    return (
      <div className="project-details__activity-item">
        <div className="project-details__activity-header">
          <h5 className="project-details__activity-name">{activity.Name}</h5>
          <span className={`project-details__status ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <p className="project-details__activity-description">
          {activity.Description}
        </p>
        
        <div className="project-details__activity-details">
          <div className="project-details__activity-info">
            <span className="project-details__activity-label">Ubicación:</span>
            <span>{activity.Location}</span>
          </div>
          
          <div className="project-details__activity-info">
            <span className="project-details__activity-label">Tipo:</span>
            <span>{activity.Type_activity}</span>
          </div>
          
          {activity.Spaces && activity.Spaces > 0 && (
            <div className="project-details__activity-info">
              <span className="project-details__activity-label">Espacios:</span>
              <span>{activity.Spaces} disponibles</span>
            </div>
          )}
        </div>

        {/* Fechas de la actividad */}
        {activity.dateActivities && activity.dateActivities.length > 0 && (
          <div className="project-details__activity-dates">
            <span className="project-details__activity-label">Fechas:</span>
            {activity.dateActivities.map((date) => (
              <div key={date.Id_dateActivity} className="project-details__date-item">
                <span>
                  {formatActivityDate(date.Start_date)}
                  {date.End_date && ` - ${formatActivityDate(date.End_date)}`}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="project-details__activity-footer">
          <span className={`project-details__active-status ${activity.Active ? 'project-details__active-status--active' : 'project-details__active-status--inactive'}`}>
            {activity.Active ? '✓ Activa' : '✕ Inactiva'}
          </span>
          {activity.OpenForRegistration && (
            <span className="project-details__registration-badge">
              Inscripciones Abiertas
            </span>
          )}
        </div>
      </div>
    );
  }, [formatActivityDate]);

  // Early return DESPUÉS de todos los hooks
  if (!project) return null;

  const formatDate = (dateString: string) => {
    try {
      // Si la fecha viene en formato MySQL datetime (YYYY-MM-DD HH:MM:SS)
      if (dateString.includes(' ')) {
        const [datePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      
      // Si viene en formato ISO o YYYY-MM-DD
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusInfo = (status: Project['Status']) => {
    const statusConfig = {
      'pending': { label: 'Pendiente', color: 'project-details__status--pending' },
      'planning': { label: 'Planificación', color: 'project-details__status--planning' },
      'execution': { label: 'Ejecución', color: 'project-details__status--execution' },
      'suspended': { label: 'Suspendido', color: 'project-details__status--suspended' },
      'finished': { label: 'Finalizado', color: 'project-details__status--finished' }
    };
    return statusConfig[status] || { label: 'Desconocido', color: 'project-details__status--unknown' };
  };

  // Función para obtener todas las imágenes del proyecto
  const getProjectImages = () => {
    const images = [];
    for (let i = 1; i <= 6; i++) {
      const imageKey = `url_${i}` as keyof Project;
      const imageUrl = project[imageKey];
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        images.push({
          url: imageUrl,
          key: `url_${i}`,
          alt: `Imagen ${i} del proyecto`
        });
      }
    }
    return images;
  };

  const statusInfo = getStatusInfo(project.Status);
  const projectImages = getProjectImages();

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles del Proyecto" size="xl" maxHeight>
      <div className="project-details">
        {/* Header con información básica */}
        <div className="project-details__header">
          <div className="project-details__title-section">
            <h3 className="project-details__name">{project.Name}</h3>
            <div className="project-details__status-badges">
              <span className={`project-details__status ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className={`project-details__active-status ${project.Active ? 'project-details__active-status--active' : 'project-details__active-status--inactive'}`}>
                {project.Active ? '✓ Activo' : '✕ Inactivo'}
              </span>
            </div>
          </div>
          <p className="project-details__aim">{project.Aim}</p>
        </div>

        {/* Navegación por pestañas */}
        <div className="project-details__tabs">
          <button
            className={`project-details__tab ${activeTab === 'basic' ? 'project-details__tab--active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Información Básica
          </button>
          <button
            className={`project-details__tab ${activeTab === 'details' ? 'project-details__tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            Detalles
          </button>
          <button
            className={`project-details__tab ${activeTab === 'metrics' ? 'project-details__tab--active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Métricas
          </button>
          <button
            className={`project-details__tab ${activeTab === 'images' ? 'project-details__tab--active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Imágenes ({projectImages.length})
          </button>
          <button
            className={`project-details__tab ${activeTab === 'activities' ? 'project-details__tab--active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Actividades ({activities.length})
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="project-details__content">
          {/* Pestaña: Información Básica */}
          {activeTab === 'basic' && (
            <div className="project-details__tab-content">
              <div className="project-details__section">
                <h4 className="project-details__section-title">Descripción del Proyecto</h4>
                <p className="project-details__description">{project.Description}</p>
              </div>

              <div className="project-details__section">
                <h4 className="project-details__section-title">Observaciones</h4>
                <p className="project-details__text">{project.Observations}</p>
              </div>

              <div className="project-details__info-grid">
                <div className="project-details__info-item">
                  <span className="project-details__label">Fecha de Inicio</span>
                  <p className="project-details__text">{formatDate(project.Start_date)}</p>
                </div>
                {project.End_date && (
                  <div className="project-details__info-item">
                    <span className="project-details__label">Fecha de Finalización</span>
                    <p className="project-details__text">{formatDate(project.End_date)}</p>
                  </div>
                )}
                <div className="project-details__info-item">
                  <span className="project-details__label">Fecha de Registro</span>
                  <p className="project-details__text">{formatDate(project.Registration_date.toString())}</p>
                </div>
                {project.UpdatedAt && (
                  <div className="project-details__info-item">
                    <span className="project-details__label">Última Actualización</span>
                    <p className="project-details__text">{formatDate(project.UpdatedAt.toString())}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pestaña: Detalles */}
          {activeTab === 'details' && (
            <div className="project-details__tab-content">
              <div className="project-details__section">
                <h4 className="project-details__section-title">Población Objetivo</h4>
                <p className="project-details__text">{project.Target_population}</p>
              </div>

              <div className="project-details__section">
                <h4 className="project-details__section-title">Ubicación</h4>
                <p className="project-details__text">{project.Location}</p>
              </div>

              <div className="project-details__info-grid">
                <div className="project-details__info-item">
                  <span className="project-details__label">Estado del Proyecto</span>
                  <span className={`project-details__status-badge ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="project-details__info-item">
                  <span className="project-details__label">Estado Activo</span>
                  <span className={`project-details__active-badge ${project.Active ? 'project-details__active-badge--active' : 'project-details__active-badge--inactive'}`}>
                    {project.Active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña: Métricas */}
          {activeTab === 'metrics' && (
            <div className="project-details__tab-content">
              <div className="project-details__metrics">
                <div className="project-details__metric-card">
                  <div className="project-details__metric-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="project-details__metric-content">
                    <span className="project-details__metric-label">
                      Personas Beneficiadas
                    </span>
                    <span className="project-details__metric-value">
                      {project.METRIC_TOTAL_BENEFICIATED?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                <div className="project-details__metric-card">
                  <div className="project-details__metric-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="project-details__metric-content">
                    <span className="project-details__metric-label">
                      Residuos Recolectados (kg)
                    </span>
                    <span className="project-details__metric-value">
                      {project.METRIC_TOTAL_WASTE_COLLECTED?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                <div className="project-details__metric-card">
                  <div className="project-details__metric-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div className="project-details__metric-content">
                    <span className="project-details__metric-label">
                      Árboles Sembrados
                    </span>
                    <span className="project-details__metric-value">
                      {project.METRIC_TOTAL_TREES_PLANTED?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña: Imágenes */}
          {activeTab === 'images' && (
            <div className="project-details__tab-content">
              <div className="project-details__images-section">
                <h4 className="project-details__section-title">Imágenes del Proyecto ({projectImages.length})</h4>
                {projectImages.length > 0 ? (
                  <div className="project-details__images-grid">
                    {projectImages.map((image) => (
                      <ImageDisplay
                        key={image.key}
                        url={image.url}
                        alt={image.alt}
                        imageKey={image.key}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="project-details__no-images">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No hay imágenes disponibles para este proyecto</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pestaña: Actividades */}
          {activeTab === 'activities' && (
            <div className="project-details__tab-content">
              <div className="project-details__section">
                <h4 className="project-details__section-title">
                  Actividades del Proyecto ({activities.length})
                </h4>
                
                {activitiesLoading ? (
                  <div className="project-details__loading">
                    <p>Cargando actividades...</p>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="project-details__activities-list">
                    {activities.map((activity) => (
                      <ActivityItem key={activity.Id_activity} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <div className="project-details__no-activities">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No hay actividades registradas para este proyecto</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </GenericModal>
  );
};

export default ProjectDetailsModal;