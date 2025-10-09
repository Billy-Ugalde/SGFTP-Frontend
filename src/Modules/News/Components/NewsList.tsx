import { useState, useMemo, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import StatusButton from './StatusButton';
import {
  useNews,
  type NewsBE,
  type NewsStatus,
} from '../Services/NewsServices';
import '../Styles/NewsList.css';

type Props = {
  onCreate: () => void;
  onEdit: (id: number) => void;
};

const getProxiedImageUrl = (driveUrl: string) => {
  if (!driveUrl) return '';
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
  return `${apiUrl}/images/proxy?url=${encodeURIComponent(driveUrl)}`;
};

export default function NewsList({ onCreate, onEdit }: Props) {
  const { data, isLoading, error } = useNews();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | NewsStatus>('all');

  // Modal de “Ver”
  const [preview, setPreview] = useState<NewsBE | null>(null);

  const filtered = useMemo(() => {
    const base = (data ?? []).slice();
    const byStatus =
      status === 'all' ? base : base.filter((n) => n.status === status);
    const bySearch = search.trim()
      ? byStatus.filter(
          (n) =>
            (n.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (n.author ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : byStatus;

    // Orden por publicación (más reciente primero)
    bySearch.sort(
      (a, b) =>
        new Date(b.publicationDate).getTime() -
        new Date(a.publicationDate).getTime()
    );
    return bySearch;
  }, [data, status, search]);

  /* ---------- Paginación (9 por vista) ---------- */
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => { setPage(1); }, [status, search, data]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = filtered.slice(start, end);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  // Cerrar modal con ESC
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : '—');

  if (isLoading) return <div className="news-list">Cargando…</div>;
  if (error) return <div className="news-list">Error al cargar noticias.</div>;

  return (
    <div className="news-list">
      {/* ===== Toolbar ===== */}
      <div className="toolbar">
        <div className="left">
          <input
            className="search"
            placeholder="Buscar por título o autor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="left" style={{ gap: 10 }}>
          <select
            className="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>

          <button type="button" className="btn-primary" onClick={onCreate}>
            + Nueva noticia
          </button>
        </div>
      </div>

      {/* ===== Grid de cards ===== */}
      <ul className="grid">
        {pageItems.map((n: NewsBE) => (
          <li key={n.id_news} className="card">
            {n.image_url && (
              <div className="thumb">
                <img src={getProxiedImageUrl(n.image_url)} alt={n.title} />
              </div>
            )}

            <div className="meta">
              <div className="title-row">
                <h3>{n.title}</h3>
                <StatusBadge status={n.status} />
              </div>

              <div style={{ color: '#64748b', fontSize: 13 }}>
                Por {n.author ?? '—'}
              </div>

              {/* Fechas en dos líneas */}
              <div className="timestamps">
                <p>Publicado: {fmt(n.publicationDate)}</p>
                {'lastUpdated' in n && n.lastUpdated && (
                  <p>Modificado: {fmt(n.lastUpdated)}</p>
                )}
              </div>
            </div>

            {/* Acciones: Ver / Editar / Estado */}
            <div className="actions">
              <button type="button" className="page-btn" onClick={() => setPreview(n)}>
                Ver
              </button>

              <button type="button" className="page-btn" onClick={() => onEdit(n.id_news)}>
                Editar
              </button>

              <StatusButton
                id={n.id_news}
                status={n.status}
                triggerClassName="page-btn"
              />
            </div>
          </li>
        ))}
      </ul>

      {/* ===== Paginación ===== */}
      <div className="pagination" role="navigation" aria-label="Paginación de noticias">
        <div className="pagination__info">
          Mostrando <strong>{total ? start + 1 : 0}-{end}</strong> de <strong>{total}</strong>
        </div>
        <div className="pagination__controls">
          <button type="button" className="page-btn" onClick={() => goto(1)} disabled={currentPage === 1} aria-label="Primera página">«</button>
          <button type="button" className="page-btn" onClick={() => goto(currentPage - 1)} disabled={currentPage === 1} aria-label="Página anterior">Anterior</button>
          <span className="pagination__page" aria-live="polite">{currentPage} / {totalPages}</span>
          <button type="button" className="page-btn" onClick={() => goto(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Página siguiente">Siguiente</button>
          <button type="button" className="page-btn" onClick={() => goto(totalPages)} disabled={currentPage === totalPages} aria-label="Última página">»</button>
        </div>
      </div>

      {/* ===== PREVIEW MODAL (overlay) ===== */}
      {preview && (
        <div
          className="news-preview__overlay"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <article
            className="news-preview"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="news-preview__header">
              <h2 className="news-preview__title">{preview.title}</h2>
              <button
                type="button"
                className="news-preview__close"
                aria-label="Cerrar vista"
                onClick={() => setPreview(null)}
              >
                ×
              </button>
            </header>

            <section className="news-preview__body">
              <div className="news-preview__grid">
                <div className="news-preview__content">
                  {preview.content}
                </div>

                {preview.image_url && (
                  <div className="news-preview__image">
                    <img
                      src={getProxiedImageUrl(preview.image_url)}
                      alt={preview.title}
                    />
                  </div>
                )}
              </div>

              <div className="news-preview__meta">
                <span><strong>Autor:</strong> {preview.author ?? '—'}</span>
                <span><strong>Publicado:</strong> {fmt(preview.publicationDate)}</span>
                {'lastUpdated' in preview && preview.lastUpdated && (
                  <span><strong>Actualizado:</strong> {fmt(preview.lastUpdated)}</span>
                )}
              </div>
            </section>
          </article>
        </div>
      )}
    </div>
  );
}
