import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MapPin, Tag, Layers, FolderOpen, Users, ClipboardPen, ArrowUpRight } from 'lucide-react';
import type { Activity } from '../../../Activities/Services/ActivityService';
import { getActivityLabels } from '../../../Activities/Services/ActivityService';
import ActivityEnrollmentPublicForm from '../../../Volunteers/Components/ActivityEnrollmentPublicForm';
import { API_BASE_URL } from '../../../../config/env';
import { saveScrollForReturn } from '../utils/scrollRestoration';
import styles from '../styles/ActivityDetailOverlay.module.css';

interface Props {
  activity: Activity | null;
  onClose: () => void;
}

type TabKey = 'descripcion' | 'detalles' | 'fechas' | 'galeria';

const ActivityDetailOverlay: React.FC<Props> = ({ activity, onClose }) => {
  const navigate = useNavigate();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('descripcion');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!activity) setShowEnrollModal(false);
    setActiveTab('descripcion');
    setLightboxIndex(null);
  }, [activity]);

  const sortedDates = useMemo(() => {
    if (!activity?.dateActivities?.length) return [];
    return [...activity.dateActivities].sort(
      (a, b) => new Date(a.Start_date).getTime() - new Date(b.Start_date).getTime(),
    );
  }, [activity]);

  const galleryImages = useMemo(() => {
    if (!activity) return [];
    const proxy = (u: string) =>
      u.includes('drive.google.com')
        ? `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(u)}`
        : u;
    return [activity.url1, activity.url2, activity.url3]
      .filter((u): u is string => !!u && u.trim() !== '' && (u.startsWith('http://') || u.startsWith('https://')))
      .map(proxy);
  }, [activity]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setLightboxIndex(null); }
      else if (e.key === 'ArrowRight') setLightboxIndex(i => (i === null ? i : (i + 1) % galleryImages.length));
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => (i === null ? i : (i - 1 + galleryImages.length) % galleryImages.length));
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [lightboxIndex, galleryImages.length]);

  const formatDate = (date: string | Date): string => {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} / ${d.getFullYear()}`;
  };

  const formatTime = (ds?: string): string => {
    if (!ds) return '';
    const d = new Date(ds);
    const h = d.getHours(), m = d.getMinutes();
    if (h === 0 && m === 0) return '';
    return d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  };

  const openFullPage = () => {
    if (!activity) return;
    saveScrollForReturn();
    onClose();
    navigate(`/actividad/${activity.Slug ?? activity.Id_activity}`);
  };

  if (!activity) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'descripcion', label: 'Descripción' },
    { key: 'detalles', label: 'Detalles' },
    { key: 'fechas', label: sortedDates.length > 0 ? `Fechas (${sortedDates.length})` : 'Fechas' },
    { key: 'galeria', label: galleryImages.length > 0 ? `Galería (${galleryImages.length})` : 'Galería' },
  ];

  return (
    <>
      {showEnrollModal && (
        <ActivityEnrollmentPublicForm
          activityId={activity.Id_activity}
          activityName={activity.Name}
          onSuccess={() => setShowEnrollModal(false)}
          onCancel={() => setShowEnrollModal(false)}
        />
      )}

      <div className={styles.overlay}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>

          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>

          <div className={styles.inner}>

            <div className={styles.header}>
              <span className={styles.chip}>
                {getActivityLabels.type[activity.Type_activity] || activity.Type_activity}
              </span>
              <h2 className={styles.title}>{activity.Name}</h2>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <MapPin size={13} strokeWidth={2} />
                  <span className={styles.metaText} title={activity.Location}>
                    {activity.Location}
                  </span>
                </span>
              </div>
              <div className={styles.spacesBadge}>
                <Users size={16} strokeWidth={2} className={styles.spacesIcon} />
                <span className={styles.spacesLabel}>Espacios</span>
                <span className={styles.spacesValue}>
                  {!activity.Spaces || activity.Spaces === 0 ? 'Ilimitados' : activity.Spaces}
                </span>
              </div>
            </div>

            <div className={styles.tabs} role="tablist">
              {tabs.map(t => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={activeTab === t.key}
                  className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className={styles.tabContent} role="tabpanel">

              {activeTab === 'descripcion' && (
                <>
                  <p className={styles.lead}>{activity.Description}</p>

                  {activity.Aim?.trim() && (
                    <section className={styles.section}>
                      <h3 className={styles.sectionLabel}>Objetivo</h3>
                      <p className={styles.sectionText}>{activity.Aim}</p>
                    </section>
                  )}

                  {activity.Conditions?.trim() && (
                    <section className={styles.section}>
                      <h3 className={styles.sectionLabel}>Condiciones de participación</h3>
                      <p className={styles.sectionText}>{activity.Conditions}</p>
                    </section>
                  )}

                  {activity.Observations?.trim() && (
                    <section className={styles.section}>
                      <h3 className={styles.sectionLabel}>Observaciones</h3>
                      <p className={styles.sectionText}>{activity.Observations}</p>
                    </section>
                  )}
                </>
              )}

              {activeTab === 'detalles' && (
                <div className={styles.infoCard}>
                  <div className={styles.infoRow}>
                    <MapPin size={15} strokeWidth={1.8} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Ubicación</span>
                      <span className={styles.infoValue}>{activity.Location}</span>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <Tag size={15} strokeWidth={1.8} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Tipo</span>
                      <span className={styles.infoValue}>
                        {getActivityLabels.type[activity.Type_activity] || activity.Type_activity}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <Layers size={15} strokeWidth={1.8} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Enfoque</span>
                      <span className={styles.infoValue}>
                        {getActivityLabels.approach[activity.Approach] || activity.Approach}
                      </span>
                    </div>
                  </div>
                  {activity.project?.Name && (
                    <div className={styles.infoRow}>
                      <FolderOpen size={15} strokeWidth={1.8} className={styles.infoIcon} />
                      <div className={styles.infoText}>
                        <span className={styles.infoLabel}>Proyecto</span>
                        <span className={styles.infoValue}>{activity.project.Name}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'fechas' && (
                sortedDates.length > 0 ? (
                  <div className={styles.datesGrid}>
                    {sortedDates.map((date, i) => (
                      <div key={i} className={styles.dateCard}>
                        <span className={styles.dateNum}>{String(i + 1).padStart(2, '0')}</span>
                        <div className={styles.dateInfo}>
                          <span className={styles.dateVal}>{formatDate(date.Start_date)}</span>
                          {formatTime(date.Start_date) && (
                            <span className={styles.dateTime}>{formatTime(date.Start_date)}</span>
                          )}
                          {date.End_date && (
                            <span className={styles.dateEnd}>hasta {formatDate(date.End_date)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noDates}>Sin fechas programadas</p>
                )
              )}

              {activeTab === 'galeria' && (
                galleryImages.length > 0 ? (
                  <>
                    <p className={styles.galleryHint}>Haz clic en una imagen para ampliarla</p>
                    <div className={styles.galleryGrid}>
                      {galleryImages.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          className={styles.galleryItem}
                          onClick={() => setLightboxIndex(i)}
                          aria-label={`Ampliar imagen ${i + 1}`}
                        >
                          <img
                            src={url}
                            alt={`${activity.Name} — imagen ${i + 1}`}
                            loading="lazy"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className={styles.noDates}>En este momento esta actividad no tiene imágenes.</p>
                )
              )}

            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.btnFullPage} onClick={openFullPage}>
              <ArrowUpRight size={17} strokeWidth={2} />
              Ver actividad completa
            </button>
            {activity.OpenForRegistration && (
              <button className={styles.btnEnroll} onClick={() => setShowEnrollModal(true)}>
                <ClipboardPen size={17} strokeWidth={2} />
                Inscribirse en esta actividad
              </button>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && galleryImages[lightboxIndex] && createPortal(
        <div className={styles.lightbox} onClick={() => setLightboxIndex(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar"
          >
            ×
          </button>

          {galleryImages.length > 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={e => {
                e.stopPropagation();
                setLightboxIndex(i => (i === null ? i : (i - 1 + galleryImages.length) % galleryImages.length));
              }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
          )}

          <img
            className={styles.lightboxImg}
            src={galleryImages[lightboxIndex]}
            alt={`${activity.Name} — imagen ${lightboxIndex + 1}`}
            onClick={e => e.stopPropagation()}
          />

          {galleryImages.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={e => {
                  e.stopPropagation();
                  setLightboxIndex(i => (i === null ? i : (i + 1) % galleryImages.length));
                }}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
              <span className={styles.lightboxCount}>{lightboxIndex + 1} / {galleryImages.length}</span>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default ActivityDetailOverlay;
