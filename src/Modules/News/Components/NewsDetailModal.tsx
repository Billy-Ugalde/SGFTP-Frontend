import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { NewsBE } from '../Services/NewsServices';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import '../Styles/NewsDetailModal.css';

type Props = {
  news: NewsBE | null;
  onClose: () => void;
};

const getProxiedImageUrl = (driveUrl?: string) => {
  if (!driveUrl) return '';
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
  return `${apiUrl}/images/proxy?url=${encodeURIComponent(driveUrl)}`;
};

const formatDate = (d?: string) =>
  d
    ? new Date(d.includes('T') ? d : `${d}T00:00:00`).toLocaleDateString('es-CR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

export default function NewsDetailModal({ news, onClose }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!news) setLightboxOpen(false);
  }, [news]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setLightboxOpen(false);
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [lightboxOpen]);

  if (!news) return null;

  const imageUrl = news.image_url ? getProxiedImageUrl(news.image_url) : '';

  return (
    <>
      <GenericModal
        show={true}
        onClose={onClose}
        title={news.title}
        size="xl"
        maxHeight
        className="news-details-modal"
      >
        <article className="news-details">
          <p className="news-details__kicker">
            <span className="news-details__kicker-label">Publicación:</span>{' '}
            <span className="news-details__kicker-date">{formatDate(news.publicationDate)}</span>
          </p>

          {imageUrl && (
            <figure className="news-details__media">
              <button
                type="button"
                className="news-details__media-btn"
                onClick={() => setLightboxOpen(true)}
                aria-label="Ampliar imagen"
              >
                <img src={imageUrl} alt={news.title} className="news-details__image" />
              </button>
              <figcaption className="news-details__media-hint">
                Haz clic en la imagen para ampliar
              </figcaption>
            </figure>
          )}

          <p className="news-details__content">{news.content}</p>

          <div className="news-details__meta">
            <div className="news-details__meta-item">
              <span className="news-details__meta-label">Autor</span>
              <span className="news-details__meta-value">{news.author ?? '—'}</span>
            </div>
            {news.lastUpdated && (
              <div className="news-details__meta-item">
                <span className="news-details__meta-label">Última modificación</span>
                <span className="news-details__meta-value">{formatDate(news.lastUpdated)}</span>
              </div>
            )}
          </div>
        </article>
      </GenericModal>

      {lightboxOpen && imageUrl && createPortal(
        <div className="news-lightbox" onClick={() => setLightboxOpen(false)}>
          <button
            className="news-lightbox__close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            className="news-lightbox__img"
            src={imageUrl}
            alt={news.title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
}
