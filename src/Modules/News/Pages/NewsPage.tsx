import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import NewsList from '../Components/NewsList';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import CreateNewsForm from '../Components/CreateNewsForm';
import EditNewsForm from '../Components/EditNewsForm';
import { useAddNews, useNewsById, useUpdateNews } from '../Services/NewsServices';
import NewsStatusFilter from '../Components/NewsStatusFilter';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import { useSuccessAlert } from '../../Shared/components';
import '../Styles/NewsPage.css';
import '../Styles/NewsAdmin.css';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; id: number };

export default function NewsPage() {
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [viewArchived, setViewArchived] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, []);

  const { showSuccess } = useSuccessAlert();
  const create = useAddNews();
  const update = useUpdateNews((modal.type === 'edit' && modal.id) ? modal.id : 0);
  const { data: editData, isLoading: loadingEdit } = useNewsById(
    modal.type === 'edit' ? modal.id : 0
  );

  const close = () => setModal({ type: 'none' });

  const handleCreate = async (payload: any) => {
    await create.mutateAsync(payload);
    showSuccess('La noticia ha sido creada exitosamente.');
    close();
  };
  const handleUpdate = async (payload: any) => {
    await update.mutateAsync(payload);
    showSuccess('La noticia ha sido actualizada exitosamente.');
    close();
  };

  return (
    <div className="news-dashboard">
      {/* Compact Header */}
      <div className="news-dashboard__header">
        <div className="news-dashboard__header-inner">
          <div className="news-dashboard__header-left">
            <div className="news-dashboard__header-icon">
              <FileText size={18} strokeWidth={2} />
            </div>
            <h1 className="news-dashboard__title">Gestión de Noticias</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="news-dashboard__main">
        {/* Action Bar */}
        <div className="news-dashboard__action-bar">
          <div className="news-dashboard__controls-row">
            <NewsStatusFilter
              value={statusFilter}
              onChange={(s) => { setStatusFilter(s); setViewArchived(false); }}
            />

            <button
              type="button"
              className="news-dashboard__archived-btn"
              data-active={viewArchived ? 'true' : 'false'}
              onClick={() => {
                setViewArchived(v => !v);
                setStatusFilter('all');
              }}
            >
              Archivadas
            </button>

            <div className="news-dashboard__search-wrapper">
              <div className="news-dashboard__search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="news-dashboard__search-input"
              />
            </div>

            <button
              type="button"
              className="news-dashboard__add-btn"
              onClick={() => setModal({ type: 'create' })}
            >
              Nueva noticia
            </button>
          </div>
        </div>

        {/* List: stats + table + pagination */}
        <NewsList
          searchTerm={search}
          statusFilter={statusFilter}
          viewArchived={viewArchived}
          onEdit={(id) => setModal({ type: 'edit', id })}
        />

        {/* Crear */}
        <GenericModal
          show={modal.type === 'create'}
          title="Formulario de Noticia"
          onClose={create.isPending ? () => {} : close}
          size="xl"
          maxHeight={true}
        >
          <CreateNewsForm onSubmit={handleCreate} onCancel={close} submitting={create.isPending} />
        </GenericModal>

        {/* Editar */}
        <GenericModal
          show={modal.type === 'edit'}
          title="Editar noticia"
          onClose={update.isPending ? () => {} : close}
          size="xl"
          maxHeight={true}
        >
          {loadingEdit || !editData ? (
            <div>Cargando…</div>
          ) : (
            <EditNewsForm
              defaultValues={editData as any}
              onSubmit={handleUpdate}
              onCancel={close}
              submitting={update.isPending}
              existingImageUrl={(editData as any).image_url}
            />
          )}
        </GenericModal>
      </div>
    </div>
  );
}
