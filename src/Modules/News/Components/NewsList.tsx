import { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import StatusButton from './StatusButton';
import Modal from '../Components/Modal';
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
  // Assuming your backend is at the same origin or you have the API URL configured
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001'; // adjust as needed
  return `${apiUrl}/images/proxy?url=${encodeURIComponent(driveUrl)}`;
};

export default function NewsList({ onCreate, onEdit }: Props) {
  const { data, isLoading, error } = useNews();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | NewsStatus>('all');
  const [detail, setDetail] = useState<NewsBE | null>(null);

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

  return (
    <div className="news-list">
      {/* Toolbar */}
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
        </div>

        <div className="right">
          <button type="button" className="btn-primary" onClick={onCreate}>
            + Nueva noticia
          </button>
        </div>
      </div>

      {isLoading && <div className="ghost">Cargando noticias…</div>}
      {error && <div className="error">Error al cargar noticias</div>}

      {/* Cards */}
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
                Publicado: {new Date(n.publicationDate).toLocaleString()} ·{' '}
                Actualizado: {new Date(n.lastUpdated).toLocaleString()}
              </p>
            </div>

            <div className="actions">
              {/* Ver detalle en modal */}
              <button className="btn" onClick={() => setDetail(n)}>
                Ver detalle
              </button>

              {/* Editar */}
              <button className="btn" onClick={() => onEdit(n.id_news)}>
                Editar
              </button>

              {/* Estado ▾ (dropdown con 3 opciones) */}
              <StatusButton id={n.id_news} current={n.status} />
            </div>
          </li>
        ))}
      </ul>

      {/* Modal de detalle */}
      {detail && (
        <Modal title="Detalle de noticia" onClose={() => setDetail(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {detail.image_url && (
              <div
                style={{
                  width: '100%',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                }}
              >
                <img
                  src={detail.image_url}
                  alt={detail.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                {detail.title}
              </h3>
              <StatusBadge status={detail.status} />
            </div>

            <p style={{ margin: 0, color: '#475569' }}>
              Por <strong>{detail.author}</strong>
            </p>

            <p style={{ margin: 0, color: '#64748B' }}>
              Publicado: {new Date(detail.publicationDate).toLocaleString()} ·{' '}
              Actualizado: {new Date(detail.lastUpdated).toLocaleString()}
            </p>

            {/* Descripción con saltos de línea preservados */}
            <div
              style={{
                marginTop: 8,
                padding: 12,
                background: '#F8FAFC',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                color: '#0f172a',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap', // <- muestra toda la descripción correctamente
              }}
            >
              {detail.content}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
