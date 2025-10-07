import React, { useState } from 'react';
import NewsList from '../Components/NewsList';
import Modal from '../Components/Modal';
import NewsForm from '../Components/NewsForm';
import {
  useAddNews,
  useUpdateNews,
  useNewsById,
  type CreateNewsInput,
} from '../Services/NewsServices';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; id: number };

const getErrMsg = (e: any) =>
  e?.response?.data?.message ??
  e?.response?.data?.error ??
  e?.message ??
  'Error inesperado';

export default function NewsPage() {
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const create = useAddNews();
  const editId = modal.type === 'edit' ? modal.id : 0;
  const { data: editData, isLoading: loadingEdit } = useNewsById(editId);
  const update = useUpdateNews(editId);

  const close = () => { setModal({ type: 'none' }); setErrorMsg(null); };

  const handleCreate = (payload: CreateNewsInput) => {
    setErrorMsg(null);
    create.mutate(payload, { onSuccess: close, onError: (e) => setErrorMsg(getErrMsg(e)) });
  };

  const handleUpdate = (payload: CreateNewsInput) => {
    setErrorMsg(null);
    update.mutate(payload, { onSuccess: close, onError: (e) => setErrorMsg(getErrMsg(e)) });
  };

  const onCloseCreate = () => { if (!create.isPending) close(); };
  const onCloseEdit = () => { if (!update.isPending) close(); };

  return (
    <div className="news-page">
      <NewsList onCreate={() => setModal({ type: 'create' })} onEdit={(id) => setModal({ type: 'edit', id })} />

      {modal.type === 'create' && (
        <Modal title="Crear noticia" onClose={onCloseCreate}>
          {errorMsg && <div className="error" style={{ marginBottom: 8 }}>{String(errorMsg)}</div>}
          <NewsForm onSubmit={handleCreate} submitting={create.isPending} />
        </Modal>
      )}

      {modal.type === 'edit' && (
        <Modal title="Editar noticia" onClose={onCloseEdit}>
          {loadingEdit || !editData ? (
            <div className="ghost">Cargando…</div>
          ) : (
            <>
              {errorMsg && <div className="error" style={{ marginBottom: 8 }}>{String(errorMsg)}</div>}
              <NewsForm
                defaultValues={{
                  title: editData.title,
                  author: editData.author,
                  content: editData.content,
                  status: editData.status,
                  image_url: editData.image_url ?? '',
                }}
                onSubmit={handleUpdate}
                submitting={update.isPending}
              />
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
