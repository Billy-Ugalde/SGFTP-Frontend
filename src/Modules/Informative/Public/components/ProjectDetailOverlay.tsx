import React, { useEffect } from 'react';
import { MapPin, Calendar, Users, Target } from 'lucide-react';
import type { Project } from '../../../Projects/Services/ProjectsServices';
import { API_BASE_URL } from '../../../../config/env';
import styles from '../styles/ProjectDetailOverlay.module.css';

interface Props {
  project: Project | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  planning: 'Planificación',
  execution: 'En ejecución',
  suspended: 'Suspendido',
  finished: 'Finalizado',
};

const ProjectDetailOverlay: React.FC<Props> = ({ project, onClose }) => {

  useEffect(() => {
    document.body.style.overflow = project ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [project]);

  if (!project) return null;

  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com'))
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    return url;
  };

  const img = project.url_1 || project.url_2 || project.url_3 || '';
  const isImageUrl = (s: string) => s.startsWith('http://') || s.startsWith('https://');

  const formatDate = (date: string): string => {
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} / ${d.getFullYear()}`;
  };

  const hasMetrics =
    (project.METRIC_TOTAL_BENEFICIATED ?? 0) > 0 ||
    (project.METRIC_TOTAL_WASTE_COLLECTED ?? 0) > 0 ||
    (project.METRIC_TOTAL_TREES_PLANTED ?? 0) > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>

        {/* Banner */}
        {isImageUrl(img) && (
          <div className={styles.banner}>
            <img
              src={getProxiedImageUrl(img)}
              alt={project.Name}
              className={styles.bannerImg}
              onError={e => {
                const el = (e.target as HTMLImageElement).parentElement;
                if (el) el.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className={styles.inner}>

          {/* Cabecera */}
          <div className={styles.header}>
            <span className={styles.chip}>{STATUS_LABELS[project.Status] || project.Status}</span>
            <h2 className={styles.title}>{project.Name}</h2>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <MapPin size={13} strokeWidth={2} />
                {project.Location}
              </span>
              <span className={styles.metaItem}>
                <Calendar size={13} strokeWidth={2} />
                {formatDate(project.Start_date)}
                {project.End_date ? ` — ${formatDate(project.End_date)}` : ''}
              </span>
            </div>
          </div>

          {/* Cuerpo */}
          <div className={styles.body}>

            {/* Columna izquierda */}
            <div className={styles.left}>
              <p className={styles.lead}>{project.Description}</p>

              {project.Aim?.trim() && (
                <section className={styles.section}>
                  <h3 className={styles.sectionLabel}>Objetivo</h3>
                  <p className={styles.sectionText}>{project.Aim}</p>
                </section>
              )}

              {project.Observations?.trim() && (
                <section className={styles.section}>
                  <h3 className={styles.sectionLabel}>Observaciones</h3>
                  <p className={styles.sectionText}>{project.Observations}</p>
                </section>
              )}

              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <MapPin size={15} strokeWidth={1.8} className={styles.infoIcon} />
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Ubicación</span>
                    <span className={styles.infoValue}>{project.Location}</span>
                  </div>
                </div>
                {project.Target_population?.trim() && (
                  <div className={styles.infoRow}>
                    <Users size={15} strokeWidth={1.8} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Población objetivo</span>
                      <span className={styles.infoValue}>{project.Target_population}</span>
                    </div>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <Target size={15} strokeWidth={1.8} className={styles.infoIcon} />
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Estado</span>
                    <span className={styles.infoValue}>{STATUS_LABELS[project.Status] || project.Status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: período + métricas */}
            <div className={styles.right}>

              <h3 className={styles.rightTitle}>Período</h3>
              <div className={styles.datesStack}>
                <div className={styles.dateCard}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateLabel}>Inicio</span>
                    <span className={styles.dateVal}>{formatDate(project.Start_date)}</span>
                  </div>
                </div>
                {project.End_date && (
                  <div className={styles.dateCard}>
                    <div className={styles.dateInfo}>
                      <span className={styles.dateLabel}>Fin</span>
                      <span className={styles.dateVal}>{formatDate(project.End_date)}</span>
                    </div>
                  </div>
                )}
              </div>

              {hasMetrics && (
                <>
                  <h3 className={`${styles.rightTitle} ${styles.rightTitleGap}`}>Métricas</h3>
                  <div className={styles.metricsStack}>
                    {(project.METRIC_TOTAL_BENEFICIATED ?? 0) > 0 && (
                      <div className={styles.metricCard}>
                        <span className={styles.metricVal}>
                          {project.METRIC_TOTAL_BENEFICIATED.toLocaleString()}
                        </span>
                        <span className={styles.metricLabel}>Beneficiados</span>
                      </div>
                    )}
                    {(project.METRIC_TOTAL_WASTE_COLLECTED ?? 0) > 0 && (
                      <div className={styles.metricCard}>
                        <span className={styles.metricVal}>
                          {project.METRIC_TOTAL_WASTE_COLLECTED.toLocaleString()}
                        </span>
                        <span className={styles.metricLabel}>Residuos (kg)</span>
                      </div>
                    )}
                    {(project.METRIC_TOTAL_TREES_PLANTED ?? 0) > 0 && (
                      <div className={styles.metricCard}>
                        <span className={styles.metricVal}>
                          {project.METRIC_TOTAL_TREES_PLANTED.toLocaleString()}
                        </span>
                        <span className={styles.metricLabel}>Árboles</span>
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailOverlay;
