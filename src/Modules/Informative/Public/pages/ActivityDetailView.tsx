import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicActivityById, getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import '../styles/ProjectDetailView.css';
import '../styles/ActivityDetailView.css';

const ActivityDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: activity, isLoading, error } = usePublicActivityById(Number(id));

  const handleBackToActivities = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('actividades');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';

    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }

    return url;
  };

  const activityImages = activity
    ? [activity.url1, activity.url2, activity.url3].filter(
        (url): url is string => !!url && url.trim() !== ''
      )
    : [];

  const heroImage = activityImages.length > 0 ? getProxiedImageUrl(activityImages[0]) : '';

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="project-detail-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="project-detail-error">
        <div className="error-container">
          <h2>Actividad no encontrada</h2>
          <p>La actividad que buscas no existe o no está disponible públicamente.</p>
          <button onClick={handleBackToActivities} className="btn-back-home">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      {/* Botón volver */}
      <button onClick={handleBackToActivities} className="fixed-back-btn">
        ← Volver a actividades
      </button>

      {/* Hero con imagen de fondo o color de respaldo */}
      <section
        className="project-hero-image"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-green) 100%)',
          backgroundColor: heroImage ? 'transparent' : 'var(--primary-dark)'
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content-wrapper">
            <h1 className="hero-title">{activity.Name}</h1>
          </div>
        </div>
      </section>

      <main className="project-detail-main">
        {/* 1. Descripción */}
        <section className="detail-section">
          <div className="detail-card">
            <div className="detail-icon">📋</div>
            <div className="detail-content">
              <h3 className="detail-title">Descripción</h3>
              <p className="detail-text">{activity.Description}</p>
            </div>
          </div>
        </section>

        {/* 2. Objetivo */}
        <section className="detail-section">
          <div className="detail-card">
            <div className="detail-icon">🎯</div>
            <div className="detail-content">
              <h3 className="detail-title">Objetivo</h3>
              <p className="detail-text">{activity.Aim}</p>
            </div>
          </div>
        </section>

        {/* 3. Ubicación */}
        <section className="detail-section">
          <div className="detail-card">
            <div className="detail-icon">📍</div>
            <div className="detail-content">
              <h3 className="detail-title">Ubicación</h3>
              <p className="detail-text">{activity.Location}</p>
            </div>
          </div>
        </section>

        {/* 4. Condiciones */}
        {activity.Conditions && activity.Conditions.trim() !== '' && (
          <section className="detail-section">
            <div className="detail-card">
              <div className="detail-icon">⚠️</div>
              <div className="detail-content">
                <h3 className="detail-title">Condiciones</h3>
                <p className="detail-text">{activity.Conditions}</p>
              </div>
            </div>
          </section>
        )}

        {/* 5. Observaciones */}
        {activity.Observations && activity.Observations.trim() !== '' && (
          <section className="detail-section">
            <div className="detail-card">
              <div className="detail-icon">📝</div>
              <div className="detail-content">
                <h3 className="detail-title">Observaciones</h3>
                <p className="detail-text">{activity.Observations}</p>
              </div>
            </div>
          </section>
        )}

        {/* 6-12. Información detallada en grid */}
        <section className="info-grid-section">
          <h2 className="section-title-centered">Información Detallada</h2>
          <div className="activity-info-grid">
            {/* 6. Tipo de Actividad */}
            <div className="info-item">
              <strong>🏷️ Tipo de Actividad:</strong>
              <span>{getActivityLabels.type[activity.Type_activity] || activity.Type_activity}</span>
            </div>

            {/* 7. Enfoque */}
            <div className="info-item">
              <strong>🌿 Enfoque:</strong>
              <span>{getActivityLabels.approach[activity.Approach] || activity.Approach}</span>
            </div>

            {/* 8. Proyecto Asignado */}
            <div className="info-item">
              <strong>🏛️ Proyecto Asociado:</strong>
              <span>{activity.project.Name}</span>
            </div>

            {/* 9. Tipo de Favorito */}
            {activity.IsFavorite && (
              <div className="info-item">
                <strong>⭐ Tipo de Favorito:</strong>
                <span>{getActivityLabels.favorite[activity.IsFavorite] || activity.IsFavorite}</span>
              </div>
            )}

            {/* 10. Tipo de Métrica */}
            <div className="info-item">
              <strong>📊 Tipo de Métrica:</strong>
              <span>{getActivityLabels.metric[activity.Metric_activity] || activity.Metric_activity}</span>
            </div>

            {/* 11. Espacios Disponibles */}
            <div className="info-item">
              <strong>👥 Espacios:</strong>
              <span>
                {activity.Spaces === null || activity.Spaces === undefined || activity.Spaces === 0
                  ? 'Ilimitado'
                  : `${activity.Spaces} espacios disponibles`}
              </span>
            </div>
          </div>
        </section>

        {/* 12. Fechas Programadas */}
        {activity.dateActivities && activity.dateActivities.length > 0 && (
          <section className="dates-section">
            <h2 className="section-title-centered">📅 Fechas Programadas</h2>
            <div className="dates-container">
              {activity.dateActivities.map((date, index) => (
                <div key={index} className="date-card">
                  <div className="date-info">
                    <span className="date-label">Inicio:</span>
                    <span className="date-value">{formatDateTime(date.Start_date)}</span>
                  </div>
                  {date.End_date && (
                    <div className="date-info">
                      <span className="date-label">Fin:</span>
                      <span className="date-value">{formatDateTime(date.End_date)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 13. Galería de Imágenes (las 3 imágenes) */}
        {activityImages.length > 0 && (
          <section className="gallery-section">
            <h2 className="section-title-centered">📷 Galería de Imágenes</h2>
            <div className="gallery-grid">
              {activityImages.map((imageUrl, index) => (
                <div key={index} className="gallery-item">
                  <img
                    src={getProxiedImageUrl(imageUrl)}
                    alt={`${activity.Name} - Imagen ${index + 1}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<div class="image-placeholder">Imagen no disponible</div>';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ActivityDetailView;
