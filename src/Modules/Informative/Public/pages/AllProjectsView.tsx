import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePublicProjects } from '../../../Projects/Services/ProjectsServices';
import type { Project } from '../../../Projects/Services/ProjectsServices';
import { API_BASE_URL } from '../../../../config/env';
import { useCardsPerPage } from '../hooks/useCardsPerPage';
import styles from '../styles/AllProjectsView.module.css';
import '../styles/public-view.css';

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente',
  planning:  'Planificación',
  execution: 'En ejecución',
  suspended: 'Suspendido',
  finished:  'Finalizado',
};

const AllProjectsView: React.FC = () => {
  const navigate = useNavigate();
  const { data: rawProjects, isLoading } = usePublicProjects();
  const PAGE_SIZE = useCardsPerPage();

  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = prev; };
  }, []);

  useEffect(() => { setCurrentPage(1); }, [PAGE_SIZE]);

  /* ── datos ── */
  const allProjects = useMemo((): Project[] => {
    if (!rawProjects || !Array.isArray(rawProjects)) return [];
    return rawProjects as Project[];
  }, [rawProjects]);

  const filtered = useMemo(() =>
    activeStatus ? allProjects.filter(p => p.Status === activeStatus) : allProjects,
  [allProjects, activeStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProjects) {
      counts[p.Status] = (counts[p.Status] ?? 0) + 1;
    }
    return counts;
  }, [allProjects]);

  const visibleStatuses = Object.keys(STATUS_LABELS).filter(s => (countByStatus[s] ?? 0) > 0);

  /* ── handlers ── */
  const handleFilterChange = (status: string | null) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/proyecto/${project.Slug ?? project.Id_project}`);
  };

  /* ── helpers de imagen ── */
  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com'))
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    return url;
  };

  const getProjectImage = (p: Project): string => p.url_1 || p.url_2 || p.url_3 || '';
  const isImageUrl = (img: string): boolean =>
    img.startsWith('http://') || img.startsWith('https://');

  /* ── helper de fecha ── */
  const formatDate = (date: string): string => {
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} / ${d.getFullYear()}`;
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <>
      <div className={styles.page}>
        <Header hideNav onBack={() => navigate('/')} />

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>Nuestros Proyectos</h1>
            {!isLoading && (
              <p className={styles.heroSub}>
                {allProjects.length === 0
                  ? 'No hay proyectos disponibles en este momento'
                  : `${allProjects.length} ${allProjects.length === 1 ? 'proyecto activo' : 'proyectos activos'}`}
              </p>
            )}
          </div>
        </header>

        <main className={styles.main}>

          {/* Filtros por estado */}
          {!isLoading && visibleStatuses.length > 1 && (
            <div className={styles.filtersBar}>
              <button
                className={`${styles.filterChip} ${!activeStatus ? styles.filterChipActive : ''}`}
                onClick={() => handleFilterChange(null)}
              >
                Todos
                <span className={styles.filterBadge}>{allProjects.length}</span>
              </button>
              {visibleStatuses.map(s => (
                <button
                  key={s}
                  className={`${styles.filterChip} ${activeStatus === s ? styles.filterChipActive : ''}`}
                  onClick={() => handleFilterChange(activeStatus === s ? null : s)}
                >
                  {STATUS_LABELS[s]}
                  <span className={styles.filterBadge}>{countByStatus[s]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Cargando proyectos…</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div className={styles.empty}>
              <p>No hay proyectos {activeStatus ? 'con este filtro' : 'disponibles en este momento'}.</p>
              {activeStatus && (
                <button className={styles.emptyReset} onClick={() => handleFilterChange(null)}>
                  Ver todos
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!isLoading && filtered.length > 0 && (
            <div className={styles.grid}>
              {paginated.map(project => {
                const img = getProjectImage(project);
                return (
                  <article
                    key={project.Id_project}
                    className={styles.card}
                    onClick={() => handleProjectClick(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleProjectClick(project);
                      }
                    }}
                  >
                    <div className={styles.cardImgWrap}>
                      {isImageUrl(img) ? (
                        <img
                          src={getProxiedImageUrl(img)}
                          alt={project.Name}
                          loading="lazy"
                          className={styles.cardImg}
                          onError={e => {
                            const t = e.target as HTMLImageElement;
                            t.style.display = 'none';
                            if (t.parentElement)
                              t.parentElement.innerHTML = `<span class="${styles.cardImgFallback}">🌱</span>`;
                          }}
                        />
                      ) : (
                        <span className={styles.cardImgFallback}>🌱</span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTop}>
                        <span className={styles.cardDate}>{formatDate(project.Start_date)}</span>
                        <span className={styles.cardChip}>{STATUS_LABELS[project.Status] || project.Status}</span>
                      </div>
                      <h3 className={styles.cardTitle}>{project.Name}</h3>
                      <p className={styles.cardDesc}>{project.Description}</p>
                      <p className={styles.cardLocation}>
                        <strong>Ubicación:</strong> {project.Location}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {!isLoading && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >←</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePageChange(page)}
                  aria-label={`Ir a página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >{page}</button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
              >→</button>
            </div>
          )}

        </main>

        <Footer />
      </div>
    </>
  );
};

export default AllProjectsView;
