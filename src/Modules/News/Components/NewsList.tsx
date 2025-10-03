// src/Modules/News/Components/NewsList.tsx
import React, { useMemo, useState } from 'react';
import StatusBadge from './StatusBadge';
import type { News, NewsStatus } from '../Services/NewsServices';
import { useSetNewsStatus } from '../Services/NewsServices';
import '../Styles/News.css';

type Props = {
  items: News[];
  // onEdit recibe una noticia para editar o null para crear
  onEdit: (news: News | null) => void;
};

export default function NewsList({ items, onEdit }: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | NewsStatus>('all');
  const setStatusMut = useSetNewsStatus();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      const text = `${n.title} ${n.author} ${n.content}`.toLowerCase();
      const byQ = !q || text.includes(q);
      const byS = status === 'all' || n.status === status;
      return byQ && byS;
    });
  }, [items, query, status]);

  const totals = useMemo(() => {
    const total = items.length;
    const published = items.filter((n) => n.status === 'published').length;
    const draft = items.filter((n) => n.status === 'draft').length;
    const archived = items.filter((n) => n.status === 'archived').length;
    return { total, published, draft, archived };
  }, [items]);

  const onPublish = (n: News) =>
    setStatusMut.mutate({ id: n.id_news, status: 'published' });
  const onDraft = (n: News) =>
    setStatusMut.mutate({ id: n.id_news, status: 'draft' });
  const onArchive = (n: News) =>
    setStatusMut.mutate({ id: n.id_news, status: 'archived' });

  return (
    <div className="news-wrapper">
      <div className="news-toolbar card">
        <div className="nt-title">
          <h2>Directorio de noticias</h2>
          <p>Crear, editar y administrar todas las noticias de la fundación.</p>
        </div>

        {/* Controles a la izquierda y botón a la derecha (como Ferias) */}
        <div className="row">
          <div className="nt-controls">
            <input
              className="input"
              placeholder="Buscar noticias..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
              <option value="archived">Archivadas</option>
            </select>
          </div>

          <button className="btn btn--primary" onClick={() => onEdit(null)}>
            + Nueva noticia
          </button>
        </div>

        <div className="nt-stats">
          <div className="stat stat--total">
            <span>Total de Noticias</span>
            <strong>{totals.total}</strong>
          </div>
          <div className="stat stat--success">
            <span>Publicadas</span>
            <strong>{totals.published}</strong>
          </div>
          <div className="stat stat--warning">
            <span>Borradores</span>
            <strong>{totals.draft}</strong>
          </div>
          <div className="stat stat--danger">
            <span>Archivadas</span>
            <strong>{totals.archived}</strong>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No hay noticias que coincidan con el filtro.</div>
      ) : (
        <div className="grid-cards">
          {filtered.map((n) => (
            <article key={n.id_news} className="card news-card">
              <div className="news-card__img">
                {n.image_url ? (
                  <img src={n.image_url} alt={n.title} />
                ) : (
                  <div className="img-placeholder">Sin imagen</div>
                )}
              </div>

              <div className="news-card__body">
                <div className="news-card__head">
                  <h3 className="news-title" title={n.title}>
                    {n.title}
                  </h3>
                  <StatusBadge status={n.status} />
                </div>
                <p className="news-meta">
                  Por <strong>{n.author}</strong> ·{' '}
                  {new Date(n.lastUpdated).toLocaleString()}
                </p>
                <p className="news-excerpt">
                  {n.content.length > 220
                    ? n.content.slice(0, 220) + '…'
                    : n.content}
                </p>

                <div className="news-card__actions">
                  <button className="btn btn--secondary" onClick={() => onEdit(n)}>
                    Editar
                  </button>

                  {n.status !== 'published' && (
                    <button
                      className="btn btn--primary"
                      onClick={() => onPublish(n)}
                      disabled={setStatusMut.isPending}
                      title="Publicar"
                    >
                      Publicar
                    </button>
                  )}
                  {n.status !== 'draft' && (
                    <button
                      className="btn btn--ghost"
                      onClick={() => onDraft(n)}
                      disabled={setStatusMut.isPending}
                      title="Pasar a borrador"
                    >
                      Borrador
                    </button>
                  )}
                  {n.status !== 'archived' && (
                    <button
                      className="btn btn--danger"
                      onClick={() => onArchive(n)}
                      disabled={setStatusMut.isPending}
                      title="Archivar (no elimina)"
                    >
                      Archivar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
