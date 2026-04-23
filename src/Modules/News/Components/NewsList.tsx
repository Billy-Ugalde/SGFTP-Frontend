import { useState, useMemo, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import StatusButton from './StatusButton';
import NewsDetailModal from './NewsDetailModal';
import { useNews, type NewsBE } from '../Services/NewsServices';
import '../Styles/NewsList.css';

type Props = {
  searchTerm: string;
  statusFilter: 'all' | 'draft' | 'published';
  viewArchived: boolean;
  onEdit: (id: number) => void;
};

export default function NewsList({ searchTerm, statusFilter, viewArchived, onEdit }: Props) {
  const { data, isLoading, error } = useNews();
  const [preview, setPreview] = useState<NewsBE | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      draft:     all.filter(n => n.status === 'draft').length,
      published: all.filter(n => n.status === 'published').length,
      archived:  all.filter(n => n.status === 'archived').length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const base = (data ?? []).slice();
    const nonArchived = base.filter(n => n.status !== 'archived');
    const onlyArchived = base.filter(n => n.status === 'archived');
    const pool = viewArchived ? onlyArchived : nonArchived;
    const byStatus = statusFilter === 'all' ? pool : pool.filter(n => n.status === statusFilter);
    const q = searchTerm.trim().toLowerCase();
    const bySearch = q
      ? byStatus.filter(n =>
          (n.title ?? '').toLowerCase().includes(q) ||
          (n.author ?? '').toLowerCase().includes(q)
        )
      : byStatus;
    bySearch.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
    return bySearch;
  }, [data, statusFilter, searchTerm, viewArchived]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm, viewArchived]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

  const fmt = (d?: string) => (d ? new Date(d.includes('T') ? d : `${d}T00:00:00`).toLocaleDateString() : '—');

  if (isLoading) {
    return (
      <div className="news-list__loading">
        <div className="news-list__loading-content">
          <svg className="news-list__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Cargando noticias...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-list__error">
        <svg className="news-list__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="news-list__error-title">Error al cargar las noticias</h3>
        <p className="news-list__error-text">Por favor intenta refrescar la página</p>
      </div>
    );
  }

  return (
    <div className="news-list">
      <div className="news-list__stats">
        <div className="news-list__stat-card news-list__stat-card--draft">
          <div className="news-list__stat-content">
            <div className="news-list__stat-icon news-list__stat-icon--draft">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="news-list__stat-label">Borradores</p>
              <p className="news-list__stat-value news-list__stat-value--draft">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="news-list__stat-card news-list__stat-card--published">
          <div className="news-list__stat-content">
            <div className="news-list__stat-icon news-list__stat-icon--published">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="news-list__stat-label">Publicadas</p>
              <p className="news-list__stat-value news-list__stat-value--published">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="news-list__stat-card news-list__stat-card--archived">
          <div className="news-list__stat-content">
            <div className="news-list__stat-icon news-list__stat-icon--archived">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="news-list__stat-label">Archivadas</p>
              <p className="news-list__stat-value news-list__stat-value--archived">{stats.archived}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination info */}
      {totalPages > 1 && (
        <div className="news-list__pagination-info">
          <p className="news-list__results-text">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, total)} de {total} noticias
          </p>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="news-list__empty">
          <div className="news-list__empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="news-list__empty-title">No se encontraron noticias</h3>
          <p className="news-list__empty-text">
            No hay noticias que coincidan con los filtros aplicados.
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="news-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Estado</th>
                <th>Publicado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((n: NewsBE) => (
                <tr key={n.id_news}>
                  <td>{n.title}</td>
                  <td>{n.author ?? '—'}</td>
                  <td><StatusBadge status={n.status} /></td>
                  <td>{fmt(n.publicationDate)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="view" onClick={() => setPreview(n)}>
                        <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>
                      <button className="edit" onClick={() => onEdit(n.id_news)}>
                        <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                      <StatusButton id={n.id_news} status={n.status} triggerClassName="status-trigger" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="news-list__pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="news-list__pagination-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <div className="news-list__pagination-numbers">
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button onClick={() => handlePageChange(1)} className="news-list__pagination-number">1</button>
                <span className="news-list__pagination-ellipsis">...</span>
              </>
            )}
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`news-list__pagination-number ${currentPage === page ? 'news-list__pagination-number--active' : ''}`}
              >
                {page}
              </button>
            ))}
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="news-list__pagination-ellipsis">...</span>
                <button onClick={() => handlePageChange(totalPages)} className="news-list__pagination-number">{totalPages}</button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="news-list__pagination-btn"
          >
            Siguiente
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <NewsDetailModal news={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
