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
    ? new Date(d).toLocaleDateString('es-CR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

export default function NewsDetailModal({ news, onClose }: Props) {
  if (!news) return null;

  return (
    <GenericModal
      show={true}
      onClose={onClose}
      title={news.title}
      size="xl"
      maxHeight
    >
      <div className="news-details">
        {/* Contenido */}
        <div className="news-details__section">
          <h4 className="news-details__section-title">Contenido</h4>
          <p className="news-details__content">{news.content}</p>
        </div>

        {/* Imagen */}
        {news.image_url && (
          <div className="news-details__section">
            <h4 className="news-details__section-title">Imagen</h4>
            <div className="news-details__image-container">
              <img
                src={getProxiedImageUrl(news.image_url)}
                alt={news.title}
                className="news-details__image"
              />
            </div>
          </div>
        )}

        {/* Metadatos */}
        <div className="news-details__section">
          <h4 className="news-details__section-title">Detalles</h4>
          <div className="news-details__info-grid">
            <div className="news-details__info-item">
              <span className="news-details__label">Autor</span>
              <p className="news-details__text">{news.author ?? '—'}</p>
            </div>
            <div className="news-details__info-item">
              <span className="news-details__label">Fecha de publicación</span>
              <p className="news-details__text">{formatDate(news.publicationDate)}</p>
            </div>
            {news.lastUpdated && (
              <div className="news-details__info-item">
                <span className="news-details__label">Última modificación</span>
                <p className="news-details__text">{formatDate(news.lastUpdated)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GenericModal>
  );
}
