import { useState, useMemo, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import StatusButton from './StatusButton';
import NewsDetailModal from './NewsDetailModal';
import {
  useNews,
  type NewsBE,
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
  // El select solo maneja all/draft/published (archived sale del select)
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');

  // Botón “Archivadas”: vista dedicada
  const [viewArchived, setViewArchived] = useState(false);

  // Modal de “Ver”
  const [preview, setPreview] = useState<NewsBE | null>(null);

  const filtered = useMemo(() => {
    const base = (data ?? []).slice();

    // 1) Corte por archivadas: o solo archivadas, o excluirlas de la vista general
    const nonArchived = base.filter(n => n.status !== 'archived');
    const onlyArchived = base.filter(n => n.status === 'archived');
    const pool = viewArchived ? onlyArchived : nonArchived;

    // 2) Filtro por status del select (solo draft/published o all)
    const byStatus =
      status === 'all' ? pool : pool.filter((n) => n.status === status);

    // 3) Filtro de búsqueda
    const q = search.trim().toLowerCase();
    const bySearch = q
      ? byStatus.filter(
          (n) =>
            (n.title ?? '').toLowerCase().includes(q) ||
            (n.author ?? '').toLowerCase().includes(q)
        )
      : byStatus;

    // 4) Orden por fecha de publicación (más reciente primero)
    bySearch.sort(
      (a, b) =>
        new Date(b.publicationDate).getTime() -
        new Date(a.publicationDate).getTime()
    );
    return bySearch;
  }, [data, status, search, viewArchived]);

  /* ---------- Paginación (9 por vista) ---------- */
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => { setPage(1); }, [status, search, data, viewArchived]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = filtered.slice(start, end);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

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
          {/* Select SIN la opción “Archivado” */}
          <select
            className="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'draft' | 'published')}
          >
            <option value="all">Todos</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>

          {/* Botón ARCHIVADAS: activa vista ONLY archived */}
          <button
            type="button"
            className="btn-archived"
            data-active={viewArchived ? 'true' : 'false'}
            onClick={() => {
              setViewArchived((v) => !v);
              // por UX, al entrar a archivadas mantenemos el select en "Todos"
              setStatus('all');
            }}
            title="Mostrar solo noticias archivadas"
          >
            Archivadas
          </button>

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

      {/* Modal de detalle */}
      <NewsDetailModal news={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
