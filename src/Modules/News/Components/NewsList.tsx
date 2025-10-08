import { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import {
  useNews,
  useUpdateNewsStatus,
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
  // Assuming your backend is at the same origin or you have the API URL configured
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001'; // adjust as needed
  return `${apiUrl}/images/proxy?url=${encodeURIComponent(driveUrl)}`;
};

export default function NewsList({ onCreate, onEdit }: Props) {
  const { data, isLoading, error } = useNews();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | NewsStatus>('all');
  const [confirm, setConfirm] = useState<{ id: number; next: NewsStatus } | null>(null);
  const updateStatus = useUpdateNewsStatus();

  const filtered = useMemo(() => {
    let list = (data ?? []).slice();
    if (status !== 'all') list = list.filter((n) => n.status === status);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.author.toLowerCase().includes(s)
      );
    }
    list.sort(
      (a, b) =>
        new Date(b.publicationDate).getTime() -
        new Date(a.publicationDate).getTime()
    );
    return list;
  }, [data, status, search]);

  const onConfirmChange = () => {
    if (!confirm) return;
    updateStatus.mutate(
      { id: confirm.id, status: confirm.next },
      { onSuccess: () => setConfirm(null) }
    );
  };

  return (
    <div className="news-list">
      <div className="toolbar">
        <div className="left">
          <input
            className="search"
            placeholder="Buscar por título o autor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        </div>

        <div className="right">
          <button type="button" className="btn-primary" onClick={onCreate}>
            + Nueva noticia
          </button>
        </div>
      </div>

      {isLoading && <div className="ghost">Cargando noticias…</div>}
      {error && <div className="error">Error al cargar noticias</div>}

      <ul className="grid">
        {filtered.map((n: NewsBE) => (
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
              <p className="author">Por {n.author}</p>
              <p className="dates">
                Publicado: {new Date(n.publicationDate).toLocaleString()} ·
                Actualizado: {new Date(n.lastUpdated).toLocaleString()}
              </p>
            </div>

            <div className="actions">
              <button className="btn" onClick={() => onEdit(n.id_news)}>
                Editar
              </button>

              {n.status !== 'published' && (
                <button
                  className="btn"
                  onClick={() => setConfirm({ id: n.id_news, next: 'published' })}
                >
                  Publicar
                </button>
              )}

              {n.status !== 'archived' && (
                <button
                  className="btn btn-danger"
                  onClick={() => setConfirm({ id: n.id_news, next: 'archived' })}
                >
                  Archivar
                </button>
              )}

              {n.status !== 'draft' && (
                <button
                  className="btn"
                  onClick={() => setConfirm({ id: n.id_news, next: 'draft' })}
                >
                  Borrador
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {confirm && (
        <div className="modal-actions" style={{ marginTop: 12 }}>
          <div className="error" style={{ border: 0, background: 'transparent', color: 'inherit' }}>
            ¿Confirmás cambiar el estado de la noticia #{confirm.id} a {confirm.next}?
          </div>
          <div className="actions" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setConfirm(null)}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={onConfirmChange}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Aplicando…' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
