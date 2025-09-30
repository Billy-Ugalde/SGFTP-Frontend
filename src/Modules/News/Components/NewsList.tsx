import React, { useState } from 'react';
import type { News } from '../Services/NewsServices';
import StatusBadge from './StatusBadge';
import NewsForm from './NewsForm';
import { useSetNewsStatus } from '../Services/NewsServices';
import ConfirmationModal from '../../Fairs/Components/ConfirmationModal'; // reusamos el componente (no estilos)
import '../Styles/NewsList.css';

interface Props { items: News[]; }

const NewsList: React.FC<Props> = ({ items }) => {
  const [editing, setEditing] = useState<null | number>(null);
  const [archiving, setArchiving] = useState<null | number>(null);
  const [publishing, setPublishing] = useState<null | number>(null);

  return (
    <div className="news-list">
      {items.map((n) => (
        <div key={n.id_news} className="news-card">
          <div className="news-card__header">
            <h3 className="news-card__title">{n.title}</h3>
            <StatusBadge status={n.status} />
          </div>

          <div className="news-card__body">
            <div className="news-card__meta">
              <span>Autor: <b>{n.author}</b></span>
              <span>Actualizado: {new Date(n.lastUpdated).toLocaleString()}</span>
            </div>
            <p className="news-card__desc">
              {n.content.length > 220 ? n.content.slice(0, 220) + '…' : n.content}
            </p>
            {n.image_url && (
              <div className="news-card__extra">
                <a href={n.image_url} target="_blank" rel="noreferrer">Ver imagen</a>
              </div>
            )}
          </div>

          <div className="news-card__footer">
            <button className="secondary-btn" onClick={() => setEditing(n.id_news)}>Editar</button>
            {n.status !== 'published' && (
              <button className="primary-btn" onClick={() => setPublishing(n.id_news)}>Publicar</button>
            )}
            {n.status !== 'archived' && (
              <button className="danger-btn" onClick={() => setArchiving(n.id_news)}>Archivar</button>
            )}
          </div>

          {editing === n.id_news && (
            <NewsForm mode="edit" id_news={n.id_news} onClose={() => setEditing(null)} />
          )}

          {publishing === n.id_news && (
            <StatusChange
              id={n.id_news}
              to="published"
              type="info"
              onClose={() => setPublishing(null)}
              title="¿Publicar noticia?"
              message="La noticia será visible en la vista pública."
              confirmText="Sí, publicar"
            />
          )}

          {archiving === n.id_news && (
            <StatusChange
              id={n.id_news}
              to="archived"
              type="warning"
              onClose={() => setArchiving(null)}
              title="¿Archivar noticia?"
              message="La noticia dejará de ser visible en la vista pública (no se elimina)."
              confirmText="Sí, archivar"
            />
          )}
        </div>
      ))}

      {items.length === 0 && <div style={{ padding: 16 }}>No hay noticias que coincidan con el filtro.</div>}
    </div>
  );
};

const StatusChange: React.FC<{
  id: number;
  to: 'published' | 'archived';
  title: string;
  message: string;
  confirmText: string;
  type: 'warning' | 'danger' | 'info';
  onClose: () => void;
}> = ({ id, to, title, message, confirmText, type, onClose }) => {
  const { mutateAsync, isPending } = useSetNewsStatus(id);

  return (
    <ConfirmationModal
      show={true}
      onClose={onClose}
      onConfirm={async () => { await mutateAsync(to); onClose(); }}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText="Cancelar"
      type={type}
      isLoading={isPending}
    />
  );
};

export default NewsList;
