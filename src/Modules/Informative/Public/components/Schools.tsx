import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Trash2, Trees, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import styles from '../styles/Schools.module.css';

interface Props {
  activities: Activity[];
  description?: string;
}

const PER_PAGE = 3;

const Schools: React.FC<Props> = ({ activities, description }) => {
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(true);

  const totalPages = Math.ceil(activities.length / PER_PAGE);
  const showControls = totalPages > 1;
  const pageItems = activities.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const goTo = (next: number) => {
    setVisible(false);
    setTimeout(() => {
      setPage(next);
      setVisible(true);
    }, 300);
  };

  const prev = () => goTo(page <= 0 ? totalPages - 1 : page - 1);
  const next = () => goTo(page >= totalPages - 1 ? 0 : page + 1);

  // Auto-avance cada 4 segundos
  useEffect(() => {
    if (!showControls) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPage(p => (p >= totalPages - 1 ? 0 : p + 1));
        setVisible(true);
      }, 300);
    }, 12000);
    return () => clearInterval(timer);
  }, [showControls, totalPages]);

  return (
    <section className={styles.schoolsSection} id="schools">
      <div className={styles.bubble}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Escuelas Participantes</h2>
            <p className={styles.subtitle}>
              {description && description.trim()
                ? description
                : 'Trabajamos de la mano con centros educativos para llevar actividades de impacto directo a estudiantes y docentes. Cada escuela representa un espacio de aprendizaje, conciencia ambiental y transformación comunitaria, y aquí mostramos los resultados concretos que hemos logrado juntos.'}
            </p>
          </div>

          <div className={styles.carouselWrapper}>
            {showControls && (
              <button className={styles.arrow} onClick={prev} aria-label="Anterior">
                <ChevronLeft size={22} />
              </button>
            )}

            <div className={`${styles.grid} ${visible ? styles.fadeIn : styles.fadeOut}`}>
              {pageItems.map((activity) => {
                const totalMetric = activity.Total_metric_value ?? 0;
                const metricLabel = getActivityLabels.metric[activity.Metric_activity as keyof typeof getActivityLabels.metric] ?? activity.Metric_activity;
                const MetricIcon = activity.Metric_activity === 'waste_collected' ? Trash2
                  : activity.Metric_activity === 'trees_planted' ? Trees
                  : TrendingUp;
                const typeLabel = getActivityLabels.type[activity.Type_activity as keyof typeof getActivityLabels.type] ?? activity.Type_activity;

                return (
                  <div key={activity.Id_activity} className={styles.card}>
                    <h3 className={styles.cardTitle}>{activity.Name}</h3>
                    <p className={styles.cardDesc}>{activity.Description}</p>
                    <span className={styles.typeBadge}>{typeLabel}</span>

                    {activity.Location && (
                      <div className={styles.location}>
                        <MapPin size={13} />
                        <span>{activity.Location}</span>
                      </div>
                    )}

                    <div className={styles.metricBox}>
                      <MetricIcon size={20} />
                      <div className={styles.metricContent}>
                        <span className={styles.metricValue}>{totalMetric.toLocaleString('es-CR')}</span>
                        <span className={styles.metricLabel}>{metricLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {showControls && (
              <button className={styles.arrow} onClick={next} aria-label="Siguiente">
                <ChevronRight size={22} />
              </button>
            )}
          </div>

          {showControls && (
            <div className={styles.dots}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === page ? styles.dotActive : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Página ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Schools;
