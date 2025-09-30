import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../Services/NewsServices';
import NewsList from '../Components/NewsList';
import NewsForm from '../Components/NewsForm';
import '../Styles/NewsPage.css';

const NewsPage: React.FC = () => {
  const { data, isLoading, error } = useNews();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  // Estadísticas para los tiles
  const stats = useMemo(() => {
    const list = data ?? [];
    const totals = {
      total: list.length,
      published: list.filter((n) => n.status === 'published').length,
      archived: list.filter((n) => n.status === 'archived').length,
      draft: list.filter((n) => n.status === 'draft').length,
    };
    return totals;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((n) => {
      const byStatus = status === 'all' ? true : n.status === status;
      const byText =
        query.trim().length === 0
          ? true
          : (n.title + ' ' + n.author + ' ' + n.content)
              .toLowerCase()
              .includes(query.toLowerCase());
      return byStatus && byText;
    });
  }, [data, query, status]);

  return (
    <div className="news-admin-container news-page">
      {/* HERO */}
      <div className="news-hero">
        <Link to="/admin" className="news-hero__back">← Volver al Dashboard</Link>

        <div className="news-hero__top">
          <div className="news-hero__icon" aria-hidden>📰</div>
          <h1 className="news-hero__title">Gestión de Noticias</h1>
        </div>

        <p className="news-hero__subtitle">
          Administra y organiza las noticias para la fundación. Crea, edita, publica y
          archiva contenidos para la vista pública manteniendo la auditoría del sistema.
        </p>
      </div>

      {/* SECCIÓN DIRECTORIO */}
      <section className="news-section news-section--soft">
        <div className="news-directory">
          <div className="news-directory__head">
            <div>
              <h2 className="news-directory__title">Directorio de noticias</h2>
              <p className="news-directory__subtitle">
                Crear, editar y administrar todas las noticias de la fundación.
              </p>
            </div>

            <div className="news-actions">
              <input
                placeholder="Buscar noticias..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="news-search"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="news-select"
              >
                <option value="all">Todos los estados</option>
                <option value="published">Publicadas</option>
                <option value="draft">Borradores</option>
                <option value="archived">Archivadas</option>
              </select>
              <button className="primary-btn" onClick={() => setCreateOpen(true)}>
                + Nueva noticia
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="news-stats">
            <div className="news-stat news-stat--total">
              <div className="news-stat__label">Total de Noticias</div>
              <div className="news-stat__value">{stats.total}</div>
            </div>
            <div className="news-stat news-stat--ok">
              <div className="news-stat__label">Publicadas</div>
              <div className="news-stat__value">{stats.published}</div>
            </div>
            <div className="news-stat news-stat--warn">
              <div className="news-stat__label">Borradores</div>
              <div className="news-stat__value">{stats.draft}</div>
            </div>
            <div className="news-stat news-stat--danger">
              <div className="news-stat__label">Archivadas</div>
              <div className="news-stat__value">{stats.archived}</div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTA */}
      {isLoading && <div className="news-empty">Cargando noticias…</div>}
      {error && <div className="news-empty">Ocurrió un error cargando noticias.</div>}
      {!isLoading && !error && <NewsList items={filtered} />}

      {createOpen && <NewsForm mode="create" onClose={() => setCreateOpen(false)} />}
    </div>
  );
};

export default NewsPage;
