import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import activitiesStyles from '../styles/Activities.module.css';

interface Props {
  data: Activity[];
}

const Activities: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();

  const filteredActivities = data;

  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';

    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }

    return url;
  };

  const isImageUrl = (image: string): boolean => {
    return image.startsWith('http://') || image.startsWith('https://');
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };


  const getActivityImage = (activity: Activity): string => {
    return activity.url1 || activity.url2 || activity.url3 || '🌱';
  };


  const handleActivityClick = (activityId: number) => {
    navigate(`/actividad/${activityId}`);
  };

  return (
    <section className={`${activitiesStyles.projectsSection} section`} id="actividades">                     
      <h2 className={activitiesStyles.sectionTitle}>Actividades finalizadas de la Fundación</h2>

      {filteredActivities.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>
          No hay actividades disponibles en este momento.
        </p>
      ) : (
        <div className={activitiesStyles.activitiesSimpleGrid}>
          {filteredActivities.map((activity) => (
            <div
              className={activitiesStyles.activitySimpleCard}
              key={activity.Id_activity}
              onClick={() => handleActivityClick(activity.Id_activity)}
              style={{ cursor: 'pointer' }}
            >
              <div className={activitiesStyles.projectImg}>
                {isImageUrl(getActivityImage(activity)) ? (
                  <img
                    src={getProxiedImageUrl(getActivityImage(activity))}
                    alt={activity.Name}
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
                  getActivityImage(activity)
                )}
              </div>
              <div className={activitiesStyles.projectContent}>
                <h3 className={activitiesStyles.projectTitle}>{truncateText(activity.Name, 50)}</h3>
                <div className={activitiesStyles.projectInfo}>
                  <p className={activitiesStyles.projectField}>
                    <strong>Descripción:</strong>
                    <span className={activitiesStyles.projectDescription}>{truncateText(activity.Description, 120)}</span>
                  </p>
                  <p className={activitiesStyles.projectField}>
                    <strong>Tipo:</strong>
                    <span>{getActivityLabels.type[activity.Type_activity] || activity.Type_activity}</span>
                  </p>
                  <p className={activitiesStyles.projectField}>
                    <strong>Estado:</strong>
                    <span>{getActivityLabels.status[activity.Status_activity] || activity.Status_activity}</span>
                  </p>
                  <p className={activitiesStyles.projectField}>
                    <strong>Ubicación:</strong>
                    <span>{truncateText(activity.Location, 40)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Activities;
