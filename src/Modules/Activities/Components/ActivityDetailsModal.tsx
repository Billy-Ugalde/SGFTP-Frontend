// ActivityDetailsModal.tsx - CÓDIGO COMPLETO CORREGIDO
import { useState, useCallback } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import type { Activity } from '../Services/ActivityService';
import { getActivityLabels, formatDate, formatDateTime } from '../Services/ActivityService';
import '../Styles/ActivitiesDetailsModal.css';

interface ActivityDetailsModalProps {
  activity: Activity | null;
  show: boolean;
  onClose: () => void;
}

const ActivityDetailsModal = ({ activity, show, onClose }: ActivityDetailsModalProps) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'config' | 'metrics' | 'images'>('basic');

  const getProxyImageUrl = useCallback((url: string): string => {
    if (!url) return '';
    if (url.includes('/images/proxy')) return url;
    if (url.includes('drive.google.com')) {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001';
      return `${baseUrl}/images/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }, []);

  const getFallbackUrl = useCallback((url: string): string | null => {
    if (!url || !url.includes('drive.google.com')) return null;
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

  const ImageDisplay = useCallback(({ url, alt, imageKey }: { url: string; alt: string; imageKey: string }) => {
    const proxyUrl = getProxyImageUrl(url);
    const hasError = imageLoadErrors[imageKey];

    return (
      <div className="activity-details__image-container">
        {proxyUrl && !hasError ? (
          <img
            src={proxyUrl}
            alt={alt}
            className="activity-details__image"
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
          <div className="activity-details__image-placeholder">
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
            <span>{hasError ? 'Error al cargar imagen' : 'Sin imagen'}</span>
          </div>
        )}
      </div>
    );
  }, [getProxyImageUrl, getFallbackUrl, imageLoadErrors]);

  if (!activity) return null;

  const getStatusInfo = (status: Activity['Status_activity']) => {
    const statusConfig = {
      'pending': { label: 'Pendiente', color: 'activity-details__status--pending' },
      'planning': { label: 'Planificación', color: 'activity-details__status--planning' },
      'execution': { label: 'Ejecución', color: 'activity-details__status--execution' },
      'suspended': { label: 'Suspendido', color: 'activity-details__status--suspended' },
      'finished': { label: 'Finalizado', color: 'activity-details__status--finished' }
    };
    return statusConfig[status] || { label: 'Desconocido', color: 'activity-details__status--unknown' };
  };

  const getActivityImages = () => {
    const images = [];
    for (let i = 1; i <= 3; i++) {
      const imageKey = `url${i}` as keyof Activity;
      const imageUrl = activity[imageKey];
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        images.push({
          url: imageUrl,
          key: `url${i}`,
          alt: `Imagen ${i} de la actividad`
        });
      }
    }
    return images;
  };

  const statusInfo = getStatusInfo(activity.Status_activity);
  const activityImages = getActivityImages();

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles de la Actividad" size="xl" maxHeight>
      <div className="activity-details">
        <div className="activity-details__header">
          <div className="activity-details__title-section">
            <h3 className="activity-details__name">{activity.Name}</h3>
            <div className="activity-details__status-badges">
              <span className={`activity-details__status ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className={`activity-details__active-status ${activity.Active ? 'activity-details__active-status--active' : 'activity-details__active-status--inactive'}`}>
                {activity.Active ? '✓ Activo' : '✕ Inactivo'}
              </span>
              {activity.OpenForRegistration && (
                <span className="activity-details__registration-badge">
                  Abierta a inscripción
                </span>
              )}
            </div>
          </div>
          <p className="activity-details__aim">{activity.Aim}</p>
        </div>

        <div className="activity-details__tabs">
          <button
            className={`activity-details__tab ${activeTab === 'basic' ? 'activity-details__tab--active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Información Básica
          </button>
          <button
            className={`activity-details__tab ${activeTab === 'details' ? 'activity-details__tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            Detalles
          </button>
          <button
            className={`activity-details__tab ${activeTab === 'config' ? 'activity-details__tab--active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </button>
          <button
            className={`activity-details__tab ${activeTab === 'metrics' ? 'activity-details__tab--active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Métricas
          </button>
          <button
            className={`activity-details__tab ${activeTab === 'images' ? 'activity-details__tab--active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Imágenes ({activityImages.length})
          </button>
        </div>

        <div className="activity-details__content">
          {/* INFORMACIÓN BÁSICA */}
          {activeTab === 'basic' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__info-grid">
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Ubicación</span>
                  <p className="activity-details__text">{activity.Location}</p>
                </div>
              </div>

              <div className="activity-details__section">
                <h4 className="activity-details__section-title">Descripción de la Actividad</h4>
                <p className="activity-details__description">{activity.Description}</p>
              </div>

              <div className="activity-details__section">
                <h4 className="activity-details__section-title">Objetivo</h4>
                <p className="activity-details__text">{activity.Aim}</p>
              </div>

              <div className="activity-details__section">
                <h4 className="activity-details__section-title">Condiciones</h4>
                <p className="activity-details__text">{activity.Conditions}</p>
              </div>

              <div className="activity-details__section">
                <h4 className="activity-details__section-title">Observaciones</h4>
                <p className="activity-details__text">{activity.Observations}</p>
              </div>

              <div className="activity-details__info-grid">
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Fecha de Registro</span>
                  <p className="activity-details__text">{formatDate(activity.Registration_date.toString())}</p>
                </div>
                {activity.UpdatedAt && (
                  <div className="activity-details__info-item">
                    <span className="activity-details__label">Última Actualización</span>
                    <p className="activity-details__text">{formatDate(activity.UpdatedAt.toString())}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DETALLES */}
          {activeTab === 'details' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__info-grid">
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Tipo de Actividad</span>
                  <p className="activity-details__text">{getActivityLabels.type[activity.Type_activity as keyof typeof getActivityLabels.type]}</p>
                </div>
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Enfoque</span>
                  <p className="activity-details__text">{getActivityLabels.approach[activity.Approach as keyof typeof getActivityLabels.approach]}</p>
                </div>
                {activity.project && (
                  <div className="activity-details__info-item">
                    <span className="activity-details__label">Proyecto Asociado</span>
                    <p className="activity-details__text">{activity.project.Name}</p>
                  </div>
                )}
                {activity.IsFavorite && (
                  <div className="activity-details__info-item">
                    <span className="activity-details__label">Tipo Favorito</span>
                    <span className="activity-details__badge activity-details__badge--favorite">
                      {getActivityLabels.favorite[activity.IsFavorite as keyof typeof getActivityLabels.favorite]}
                    </span>
                  </div>
                )}
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Actividad Recurrente</span>
                  <span className={`activity-details__badge ${activity.IsRecurring ? 'activity-details__badge--yes' : 'activity-details__badge--no'}`}>
                    {activity.IsRecurring ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>

              <div className="activity-details__section">
                <h4 className="activity-details__section-title">Fechas de la Actividad</h4>
                {activity.dateActivities && activity.dateActivities.length > 0 ? (
                  <div className="activity-details__dates-list">
                    {activity.dateActivities.map((date, index) => (
                      <div key={date.Id_dateActivity || index} className="activity-details__date-item">
                        <div className="activity-details__date-row">
                          <span className="activity-details__date-label">Inicio:</span>
                          <span className="activity-details__date-value">{formatDateTime(date.Start_date)}</span>
                        </div>
                        {date.End_date && (
                          <div className="activity-details__date-row">
                            <span className="activity-details__date-label">Fin:</span>
                            <span className="activity-details__date-value">{formatDateTime(date.End_date)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="activity-details__text">No hay fechas registradas</p>
                )}
              </div>
            </div>
          )}

          {/* CONFIGURACIÓN */}
          {activeTab === 'config' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__config-grid">
                <div className="activity-details__config-card">
                  <div className="activity-details__config-icon activity-details__config-icon--status">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="activity-details__config-content">
                    <span className="activity-details__config-label">Estado de la Actividad</span>
                    <span className={`activity-details__status ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {activity.Spaces !== undefined && activity.Spaces !== null && (
                  <div className="activity-details__config-card">
                    <div className="activity-details__config-icon activity-details__config-icon--spaces">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="activity-details__config-content">
                      <span className="activity-details__config-label">Espacios Disponibles</span>
                      <p className="activity-details__config-value">
                        {activity.Spaces === 0 ? 'Sin límite' : activity.Spaces}
                      </p>
                    </div>
                  </div>
                )}

                <div className="activity-details__config-card">
                  <div className={`activity-details__config-icon ${activity.OpenForRegistration ? 'activity-details__config-icon--open' : 'activity-details__config-icon--closed'}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="activity-details__config-content">
                    <span className="activity-details__config-label">Inscripción</span>
                    <span className={`activity-details__badge ${activity.OpenForRegistration ? 'activity-details__badge--open' : 'activity-details__badge--closed'}`}>
                      {activity.OpenForRegistration ? 'Abierta' : 'Cerrada'}
                    </span>
                  </div>
                </div>

                <div className="activity-details__config-card">
                  <div className={`activity-details__config-icon ${activity.Active ? 'activity-details__config-icon--active' : 'activity-details__config-icon--inactive'}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="activity-details__config-content">
                    <span className="activity-details__config-label">Estado Activo</span>
                    <span className={`activity-details__active-status ${activity.Active ? 'activity-details__active-status--active' : 'activity-details__active-status--inactive'}`}>
                      {activity.Active ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                    <p className="activity-details__config-description">
                      {activity.Active ? 'Visible en la página informativa' : 'Oculto en la página informativa'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MÉTRICAS */}
          {activeTab === 'metrics' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__section">
                <div className="activity-details__metrics-simple">
                  <div className="activity-details__metric-simple-card">
                    <div className="activity-details__metric-simple-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="activity-details__metric-simple-content">
                      <span className="activity-details__metric-simple-label">
                        {getActivityLabels.metric[activity.Metric_activity as keyof typeof getActivityLabels.metric]}
                      </span>
                      <span className="activity-details__metric-simple-value">
                        {activity.Metric_value?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMÁGENES */}
          {activeTab === 'images' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__images-section">
                <h4 className="activity-details__section-title">Imágenes de la Actividad ({activityImages.length})</h4>
                {activityImages.length > 0 ? (
                  <div className="activity-details__images-grid">
                    {activityImages.map((image) => (
                      <ImageDisplay
                        key={image.key}
                        url={image.url}
                        alt={image.alt}
                        imageKey={image.key}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="activity-details__no-images">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No hay imágenes disponibles para esta actividad</p>
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

export default ActivityDetailsModal;