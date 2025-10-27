import { useState, useEffect } from 'react';
import NewsList from '../Components/NewsList';
import Modal from '../Components/Modal';
import NewsForm from '../Components/NewsForm';
import { useAddNews, useNews, useNewsById, useUpdateNews } from '../Services/NewsServices';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import '../Styles/NewsPage.css';    // Header / Hero
import '../Styles/NewsAdmin.css';   // Listado, filtros, cards, form y contadores (scope .news-admin)

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; id: number };

export default function NewsPage() {
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  // Subir al inicio al entrar
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, []);

  // Contadores
  const { data: list } = useNews();
  const draftCount = list?.filter(n => n.status === 'draft').length ?? 0;
  const publishedCount = list?.filter(n => n.status === 'published').length ?? 0;
  const archivedCount = list?.filter(n => n.status === 'archived').length ?? 0;

  // Mutations y datos para editar
  const create = useAddNews();
  const update = useUpdateNews((modal.type === 'edit' && modal.id) ? modal.id : 0);
  const { data: editData, isLoading: loadingEdit } = useNewsById(
    modal.type === 'edit' ? modal.id : 0
  );

  const close = () => setModal({ type: 'none' });

  const handleCreate = async (payload: any) => {
    await create.mutateAsync(payload);
    close();
  };
  const handleUpdate = async (payload: any) => {
    await update.mutateAsync(payload);
    close();
  };

  return (
    <div className="news-page">
      {/* ===== Header tipo hero ===== */}
      <div className="news-page__header">
        <div className="news-page__header-container">
      <div className="news-page__title-row">
  <div className="news-page__title-icon" aria-hidden>
    {/* Newspaper icon */}
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M4 6a2 2 0 0 1 2-2h10a1 1 0 0 1 1 1v11h1a2 2 0 0 0 2-2V7h2v8a4 4 0 0 1-4 4H6a2 2 0 0 1-2-2V6z"/>
      <rect x="7" y="7" width="7" height="2" rx="1"/>
      <rect x="7" y="11" width="7" height="2" rx="1"/>
      <rect x="7" y="15" width="5" height="2" rx="1"/>
    </svg>
  </div>

  <h1 className="news-page__title">Gestión de noticias</h1>

  <BackToDashboardButton className="news-page__back-btn" />
</div>


          {/* Icono de News debajo del título */}
          <div className="news-page__emoji-container">
            <div className="news-page__emoji" aria-hidden>🗞️</div>
          </div>

          {/* Descripción */}
          <p className="news-page__directory-description">
            Administrar y organizar noticias de la{' '}
            <span className="news-page__foundation-name">
              Fundación Tamarindo Park
            </span>
            . Crear, editar, publicar y archivar contenido informativo.
          </p>
        </div>
        <div className="news-page__bottom-divider" />
      </div>

      {/* ===== Superficie admin ===== */}
      <div className="news-admin-surface">
        <section className="news-admin">
          {/* Contadores */}
          <div className="stats-grid">
            <div className="stat-card stat--draft">
              <div className="stat-card__icon" aria-hidden>📝</div>
              <div className="stat-card__body">
                <div className="stat-card__label">Borradores</div>
                <div className="stat-card__value">{draftCount}</div>
              </div>
            </div>

            <div className="stat-card stat--published">
              <div className="stat-card__icon" aria-hidden>✅</div>
              <div className="stat-card__body">
                <div className="stat-card__label">Publicadas</div>
                <div className="stat-card__value">{publishedCount}</div>
              </div>
            </div>

            <div className="stat-card stat--archived">
              <div className="stat-card__icon" aria-hidden>🗂️</div>
              <div className="stat-card__body">
                <div className="stat-card__label">Archivadas</div>
                <div className="stat-card__value">{archivedCount}</div>
              </div>
            </div>
          </div>

          {/* Listado con toolbar + grid */}
          <NewsList
            onCreate={() => setModal({ type: 'create' })}
            onEdit={(id) => setModal({ type: 'edit', id })}
          />

          {/* Crear */}
          {modal.type === 'create' && (
            <Modal
              title="Crear noticia"
              onClose={create.isPending ? undefined : close}
              onSubmit={handleCreate}
              submitting={create.isPending}
            >
              <NewsForm onSubmit={handleCreate} submitting={create.isPending} />
            </Modal>
          )}

          {/* Editar */}
          {modal.type === 'edit' && (
            <Modal
              title="Editar noticia"
              onClose={update.isPending ? undefined : close}
              onSubmit={handleUpdate}
              submitting={update.isPending}
            >
              {loadingEdit || !editData ? (
                <div className="ghost">Cargando…</div>
              ) : (
                <NewsForm
                  defaultValues={editData as any}
                  onSubmit={handleUpdate}
                  submitting={update.isPending}
                />
              )}
            </Modal>
          )}
        </section>
      </div>

      {/* ===== Footer ===== */}
      <footer className="news-footer">Fundación Tamarindo Park</footer>
    </div>
  );
}
