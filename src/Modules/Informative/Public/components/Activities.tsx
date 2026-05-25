import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import { API_BASE_URL } from '../../../../config/env';
import styles from '../styles/Activities.module.css';

interface Props {
  data: Activity[];
}

const fmtMonthYear = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CR', { month: 'short', year: 'numeric' });
};

const fmtMetric = (a: Activity): string => {
  const val = a.Total_metric_value;
  if (!val) return '';
  const labels: Record<string, string> = {
    attendance: 'asistentes',
    trees_planted: 'árboles',
    waste_collected: 'kg recolectados',
  };
  return `${val.toLocaleString('es-CR')} ${labels[a.Metric_activity] ?? ''}`.trim();
};

const Activities: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();

  const resolveUrl = (url: string): string => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const path = url.startsWith('/') ? url.slice(1) : url;
    return `${API_BASE_URL.replace(/\/+$/, '')}/${path}`;
  };

  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }
    return resolveUrl(url);
  };

  const isImageUrl = (image: string): boolean => {
    if (!image) return false;
    return (
      /^https?:\/\//i.test(image) ||
      /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(image) ||
      /^(uploads|images|img|files)\//i.test(image) ||
      image.includes('drive.google.com')
    );
  };

  return (
    <section className={styles.activitiesSection} id="realizadas">
      <div className="section">
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionKicker}>05 — Memoria</div>
            <h2 className={styles.sectionTitle}>
              Actividades <em>realizadas</em>
            </h2>
          </div>
          <button
            className={styles.verHistorialBtn}
            onClick={() => navigate('/actividades')}
          >
            Ver historial →
          </button>
        </div>

        <p className={styles.sectionLead}>
          Las acciones que ya transformaron rincones de Guanacaste — y siguen dando frutos.
        </p>

        {data.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--mid)' }}>
            No hay actividades disponibles en este momento.
          </p>
        ) : (
          <div className={styles.activitiesGrid}>
            {data.map((activity) => {
              const img = activity.url1 || activity.url2 || activity.url3 || '';
              const date = fmtMonthYear(activity.dateActivities?.[0]?.Start_date);
              const metric = fmtMetric(activity);
              const tag = getActivityLabels.type[activity.Type_activity] ?? activity.Type_activity;

              return (
                <article
                  key={activity.Id_activity}
                  className={styles.actCard}
                  onClick={() => navigate(`/actividad/${activity.Id_activity}`)}
                >
                  <div className={styles.actImg}>
                    <span className={`${styles.actStatus} ${styles.done}`}>Completado</span>
                    {isImageUrl(img) ? (
                      <img
                        src={getProxiedImageUrl(img)}
                        alt={activity.Name}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span>🌱</span>
                    )}
                  </div>

                  <div className={styles.actBody}>
                    {tag && <span className={styles.actTag}>{tag}</span>}
                    <h3 className={styles.actTitle}>{activity.Name}</h3>
                    <p className={styles.actDesc}>{activity.Description}</p>
                    <div className={styles.actFoot}>
                      <span>{date || activity.Location}</span>
                      {metric && <span>{metric}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Activities;
