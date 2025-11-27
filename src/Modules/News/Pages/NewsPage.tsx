import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
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
  <div style={{ backgroundColor: "#4CAF8C", color: "white", width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "16px" }}>
    <FileText size={32} strokeWidth={2} aria-hidden />
  </div>

  <h1 className="news-page__title">Gestión de noticias</h1>

  <BackToDashboardButton className="news-page__back-btn" />
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
              onClose={create.isPending ? () => {} : close}
            >
              <NewsForm onSubmit={handleCreate} submitting={create.isPending} />
            </Modal>
          )}

          {/* Editar */}
          {modal.type === 'edit' && (
            <Modal
              title="Editar noticia"
              onClose={update.isPending ? () => {} : close}
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
