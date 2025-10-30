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
      <div
        className="news-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar en esquina superior derecha */}
        <button
          type="button"
          className="news-detail-modal__close"
          aria-label="Cerrar vista"
          onClick={onClose}
        >
          ×
        </button>

        {/* 1. Título */}
        <div className="news-detail-modal__header">
          <h2 className="news-detail-modal__title">{news.title}</h2>
        </div>

        {/* 2. Descripción/Contenido */}
        <div className="news-detail-modal__content">
          {news.content}
        </div>

        {/* 3. Foto */}
        {news.image_url && (
          <div className="news-detail-modal__image">
            <img
              src={getProxiedImageUrl(news.image_url)}
              alt={news.title}
            />
          </div>
        )}

        {/* 4. Detalles en formato lista */}
        <div className="news-detail-modal__details">
          <div className="news-detail-modal__detail-item">
            <span className="news-detail-modal__detail-label">Autor:</span>
            <span className="news-detail-modal__detail-value">{news.author ?? '—'}</span>
          </div>
          <div className="news-detail-modal__detail-item">
            <span className="news-detail-modal__detail-label">Publicado:</span>
            <span className="news-detail-modal__detail-value">{formatDate(news.publicationDate)}</span>
          </div>
          {news.lastUpdated && (
            <div className="news-detail-modal__detail-item">
              <span className="news-detail-modal__detail-label">Última modificación:</span>
              <span className="news-detail-modal__detail-value">{formatDate(news.lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
