import { useState, useCallback } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import type { Project } from '../Services/ProjectsServices';
import '../Styles/ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
  project: Project | null;
  show: boolean;
  onClose: () => void;
}

const ProjectDetailsModal = ({ project, show, onClose }: ProjectDetailsModalProps) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'metrics' | 'images'>('basic');

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

  // Early return DESPUÉS de todos los hooks
  if (!project) return null;

  const formatDate = (dateString: string) => {
    try {
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

  const getMetricLabel = (metric: string) => {
    const metricLabels = {
      'beneficiated_persons': 'Personas Beneficiadas',
      'invested_amount': 'Monto Invertido',
      'created_jobs': 'Empleos Creados',
      'trained_people': 'Personas Capacitadas',
      'other': 'Otra Métrica'
    };
    return metricLabels[metric as keyof typeof metricLabels] || metric;
  };

  const statusInfo = getStatusInfo(project.Status);

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
            Imágenes
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="project-details__metric-content">
                    <span className="project-details__metric-label">
                      {getMetricLabel(project.Metrics)}
                    </span>
                    <span className="project-details__metric-value">
                      {project.Metric_value?.toLocaleString()}
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
                <h4 className="project-details__section-title">Imágenes del Proyecto</h4>
                <div className="project-details__images-grid">
                  {project.url_1 && (
                    <ImageDisplay
                      url={project.url_1}
                      alt="Imagen 1 del proyecto"
                      imageKey="url_1"
                    />
                  )}
                  {project.url_2 && (
                    <ImageDisplay
                      url={project.url_2}
                      alt="Imagen 2 del proyecto"
                      imageKey="url_2"
                    />
                  )}
                  {project.url_3 && (
                    <ImageDisplay
                      url={project.url_3}
                      alt="Imagen 3 del proyecto"
                      imageKey="url_3"
                    />
                  )}
                </div>
                {!project.url_1 && !project.url_2 && !project.url_3 && (
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
        </div>
      </div>
    </GenericModal>
  );
};

export default ProjectDetailsModal;