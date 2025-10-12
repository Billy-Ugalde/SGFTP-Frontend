import { useEffect } from 'react';
import type { NewsBE } from '../Services/NewsServices';
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
    ? new Date(d).toLocaleDateString('es-CR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

export default function NewsDetailModal({ news, onClose }: Props) {
  // Cerrar modal con ESC
  useEffect(() => {
    if (!news) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [news, onClose]);

  if (!news) return null;

  return (
    <div
      className="news-detail-modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <article
        className="news-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="news-detail-modal__header">
          <h2 className="news-detail-modal__title">{news.title}</h2>
          <button
            type="button"
            className="news-detail-modal__close"
            aria-label="Cerrar vista"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <section className="news-detail-modal__body">
          <div className="news-detail-modal__grid">
            {news.image_url && (
              <div className="news-detail-modal__image">
                <img
                  src={getProxiedImageUrl(news.image_url)}
                  alt={news.title}
                />
              </div>
            )}

            <div className="news-detail-modal__content">
              {news.content}
            </div>
          </div>
        </section>

        <footer className="news-detail-modal__meta">
          <span><strong>Autor:</strong> {news.author ?? '—'}</span>
          <span><strong>Publicado:</strong> {formatDate(news.publicationDate)}</span>
          {news.lastUpdated && (
            <span><strong>Última modificación:</strong> {formatDate(news.lastUpdated)}</span>
          )}
        </footer>
      </article>
    </div>
  );
}
