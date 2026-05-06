import { useState, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import type { Activity } from '../Services/ActivityService';
import { getActivityLabels, formatDate, formatDateTime, useGenerateActivityReport, useGenerateActivityExcel } from '../Services/ActivityService';
import { API_BASE_URL } from '../../../config/env';
import '../Styles/ActivitiesDetailsModal.css';

interface ActivityDetailsModalProps {
  activity: Activity | null;
  show: boolean;
  onClose: () => void;
}

type TabId = 'basic' | 'details' | 'config' | 'metrics' | 'images';

const ActivityDetailsModal = ({ activity, show, onClose }: ActivityDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});

  const generateReportMutation = useGenerateActivityReport();
  const generateExcelMutation = useGenerateActivityExcel();

  const handleGeneratePDF = async () => {
    if (!activity?.Id_activity) return;
    try { await generateReportMutation.mutateAsync(activity.Id_activity); } catch {}
  };

  const handleGenerateExcel = async () => {
    if (!activity?.Id_activity) return;
    try { await generateExcelMutation.mutateAsync(activity.Id_activity); } catch {}
  };

  const getProxyImageUrl = useCallback((url: string): string => {
    if (!url) return '';
    if (url.includes('/images/proxy')) return url;
    if (url.includes('drive.google.com')) return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    if (!/^https?:\/\//i.test(url)) {
      const path = url.startsWith('/') ? url.slice(1) : url;
      return `${API_BASE_URL.replace(/\/+$/, '')}/${path}`;
    }
    return url;
  }, []);

  const getFallbackUrl = useCallback((url: string): string | null => {
    if (!url || !url.includes('drive.google.com')) return null;
    let fileId: string | null = null;
    const patterns = [/thumbnail\?id=([^&]+)/, /[?&]id=([^&]+)/, /\/d\/([^/]+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) { fileId = match[1]; break; }
    }
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` : null;
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
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.fallbackAttempted) {
                target.dataset.fallbackAttempted = 'true';
                const fallbackUrl = getFallbackUrl(url);
                if (fallbackUrl && fallbackUrl !== proxyUrl) { target.src = fallbackUrl; return; }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={hasError
                  ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"} />
            </svg>
            <span>{hasError ? 'Error al cargar imagen' : 'Sin imagen'}</span>
          </div>
        )}
      </div>
    );
  }, [getProxyImageUrl, getFallbackUrl, imageLoadErrors]);

  if (!activity) return null;

  const getStatusInfo = (status: Activity['Status_activity']) => {
    const cfg: Record<string, { label: string; color: string }> = {
      pending:   { label: 'Pendiente',    color: 'activity-details__status--pending' },
      planning:  { label: 'Planificación', color: 'activity-details__status--planning' },
      execution: { label: 'Ejecución',    color: 'activity-details__status--execution' },
      suspended: { label: 'Suspendido',   color: 'activity-details__status--suspended' },
      finished:  { label: 'Finalizado',   color: 'activity-details__status--finished' },
    };
    return cfg[status] || { label: 'Desconocido', color: 'activity-details__status--unknown' };
  };

  const getActivityImages = () => {
    const images = [];
    for (let i = 1; i <= 3; i++) {
      const key = `url${i}` as keyof Activity;
      const url = activity[key];
      if (url && typeof url === 'string' && url.trim() !== '')
        images.push({ url, key: `url${i}`, alt: `Imagen ${i} de la actividad` });
    }
    return images;
  };

  const statusInfo = getStatusInfo(activity.Status_activity);
  const activityImages = getActivityImages();

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'basic',
      label: 'Información Básica',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    },
    {
      id: 'details',
      label: 'Detalles',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    },
    {
      id: 'config',
      label: 'Configuración',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      id: 'metrics',
      label: 'Métricas',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      id: 'images',
      label: `Imágenes (${activityImages.length})`,
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ];

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles de la Actividad" size="xl" maxHeight>
      <div className="activity-details">

        {/* ── Header ── */}
        <div className="activity-details__header">
          <div className="activity-details__title-section">
            <h3 className="activity-details__name">{activity.Name}</h3>
            <div className="activity-details__status-badges">
              <span className={`activity-details__status ${statusInfo.color}`}>{statusInfo.label}</span>
              <span className={`activity-details__active-status ${activity.Active ? 'activity-details__active-status--active' : 'activity-details__active-status--inactive'}`}>
                {activity.Active ? <><Check size={12} strokeWidth={2.5} /> Activo</> : <><X size={12} strokeWidth={2.5} /> Inactivo</>}
              </span>
              {activity.OpenForRegistration && (
                <span className="activity-details__registration-badge">Abierta a inscripción</span>
              )}
            </div>
          </div>
          <div className="activity-details__header-actions">
            <button
              className={`activity-details__generate-pdf-btn ${generateReportMutation.isPending ? 'loading' : ''}`}
              onClick={handleGeneratePDF}
              disabled={generateReportMutation.isPending}
              title="Descargar reporte PDF"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="pdf-text">{generateReportMutation.isPending ? 'Generando...' : 'PDF'}</span>
            </button>
            <button
              className={`activity-details__generate-excel-btn ${generateExcelMutation.isPending ? 'loading' : ''}`}
              onClick={handleGenerateExcel}
              disabled={generateExcelMutation.isPending}
              title="Descargar reporte Excel"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="excel-text">{generateExcelMutation.isPending ? 'Generando...' : 'Excel'}</span>
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="activity-details__tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`activity-details__tab ${activeTab === tab.id ? 'activity-details__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Contenido ── */}
        <div className="activity-details__content">

          {/* Información Básica */}
          {activeTab === 'basic' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__info-grid activity-details__info-grid--full">
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Descripción</span>
                  <p className="activity-details__text">{activity.Description}</p>
                </div>
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Objetivo</span>
                  <p className="activity-details__text">{activity.Aim}</p>
                </div>
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Condiciones</span>
                  <p className="activity-details__text">{activity.Conditions}</p>
                </div>
                <div className="activity-details__info-item">
                  <span className="activity-details__label">Observaciones</span>
                  <p className="activity-details__text">{activity.Observations}</p>
                </div>
                {activity.Location && (
                  <div className="activity-details__info-item">
                    <span className="activity-details__label">Ubicación</span>
                    <p className="activity-details__text">{activity.Location}</p>
                  </div>
                )}
              </div>
              <div className="activity-details__info-grid" style={{ marginTop: '1.5rem' }}>
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

          {/* Detalles */}
          {activeTab === 'details' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__info-grid" style={{ marginBottom: '1.5rem' }}>
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

          {/* Configuración */}
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
                    <span className={`activity-details__status ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                </div>

                {activity.Spaces !== undefined && activity.Spaces !== null && (
                  <div className="activity-details__config-card">
                    <div className="activity-details__config-icon activity-details__config-icon--spaces">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="activity-details__config-content">
                      <span className="activity-details__config-label">Espacios Disponibles</span>
                      <p className="activity-details__config-value">{activity.Spaces === 0 ? 'Sin límite' : activity.Spaces}</p>
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
                      {activity.Active ? <><Check size={12} strokeWidth={2.5} /> Activo</> : <><X size={12} strokeWidth={2.5} /> Inactivo</>}
                    </span>
                    <p className="activity-details__config-description">
                      {activity.Active ? 'Visible en la página informativa' : 'Oculto en la página informativa'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Métricas */}
          {activeTab === 'metrics' && (
            <div className="activity-details__tab-content">
              <div className="activity-details__section">
                <h4 className="activity-details__section-title">
                  {getActivityLabels.metric[activity.Metric_activity as keyof typeof getActivityLabels.metric]}
                </h4>
                {activity.metric_value && activity.metric_value.length > 0 ? (
                  <>
                    <div className="activity-details__metrics-simple">
                      <div className="activity-details__metric-simple-card">
                        <div className="activity-details__metric-simple-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="activity-details__metric-simple-content">
                          <span className="activity-details__metric-simple-label">Total Acumulado</span>
                          <span className="activity-details__metric-simple-value">
                            {activity.metric_value.reduce((sum, m) => sum + (m.Value || 0), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="activity-details__section" style={{ marginTop: '1.5rem' }}>
                      <h4 className="activity-details__section-title">Valores por Fecha</h4>
                      <div className="activity-details__dates-list">
                        {activity.metric_value.map((metric, index) => {
                          const correspondingDate = activity.dateActivities?.find(
                            d => d.Id_dateActivity === metric.dateActivity?.Id_dateActivity
                          ) || activity.dateActivities?.[index];
                          return (
                            <div key={metric.Id_activity_value} className="activity-details__date-item">
                              <div className="activity-details__date-row">
                                <span className="activity-details__date-label">Fecha:</span>
                                <span className="activity-details__date-value">
                                  {correspondingDate ? formatDateTime(correspondingDate.Start_date) : `Fecha ${index + 1}`}
                                </span>
                              </div>
                              <div className="activity-details__date-row">
                                <span className="activity-details__date-label">Valor:</span>
                                <span className="activity-details__date-value activity-details__metric-highlight">
                                  {metric.Value?.toLocaleString() || 0}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="activity-details__no-images">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No hay valores de métrica registrados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Imágenes */}
          {activeTab === 'images' && (
            <div className="activity-details__tab-content">
              <h4 className="activity-details__section-title" style={{ marginBottom: '1rem' }}>
                Imágenes de la Actividad ({activityImages.length})
              </h4>
              {activityImages.length > 0 ? (
                <div className="activity-details__images-grid">
                  {activityImages.map(image => (
                    <ImageDisplay key={image.key} url={image.url} alt={image.alt} imageKey={image.key} />
                  ))}
                </div>
              ) : (
                <div className="activity-details__no-images">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No hay imágenes disponibles</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </GenericModal>
  );
};

export default ActivityDetailsModal;
