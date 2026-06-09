import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../../../config/env';
import GenericModal from './GenericModal';
import type { Entrepreneur, Entrepreneurship } from '../Types';
import { formatPhoneForDisplay } from '../../../shared/utils/phone.utils';
import '../Styles/EntrepreneurDetailsModal.css';
import {
  CookingPot,
  Shirt,
  Palette,
  House,
  Drama,
  Sparkles
} from 'lucide-react';

interface EntrepreneurDetailsModalProps {
  entrepreneur: Entrepreneur | null;
  show: boolean;
  onClose: () => void;
}

const getProxyImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('/images/proxy')) return url;
  if (url.includes('drive.google.com')) {
    return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

const getFallbackUrl = (url: string): string | null => {
  if (!url || !url.includes('drive.google.com')) return null;

  let fileId: string | null = null;
  const patterns = [
    /thumbnail\?id=([^&]+)/,
    /[?&]id=([^&]+)/,
    /\/d\/([^/]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      fileId = match[1];
      break;
    }
  }

  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` : null;
};

const GalleryImage = ({ url, alt, onOpen }: { url: string; alt: string; onOpen?: () => void }) => {
  const [hasError, setHasError] = useState(false);
  const proxyUrl = getProxyImageUrl(url);
  const clickable = !!proxyUrl && !hasError && !!onOpen;

  return (
    <div
      className={`entrepreneur-details__image-container${clickable ? ' entrepreneur-details__image-container--clickable' : ''}`}
      onClick={clickable ? onOpen : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? 'Ampliar imagen' : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen!(); } } : undefined}
    >
      {proxyUrl && !hasError ? (
        <img
          src={proxyUrl}
          alt={alt}
          className="entrepreneur-details__image"
          crossOrigin="anonymous"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.dataset.fallbackAttempted) {
              target.dataset.fallbackAttempted = 'true';
              const fallbackUrl = getFallbackUrl(url);
              if (fallbackUrl && fallbackUrl !== proxyUrl) {
                target.src = fallbackUrl;
                return;
              }
            }
            setHasError(true);
          }}
        />
      ) : (
        <div className="entrepreneur-details__image-placeholder">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={hasError
                ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                : "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              }
            />
          </svg>
          <span>{hasError ? 'Error al cargar imagen' : 'Sin imagen'}</span>
        </div>
      )}
    </div>
  );
};

const EntrepreneurDetailsModal = ({ entrepreneur, show, onClose }: EntrepreneurDetailsModalProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleryImages = useMemo(() => {
    const e = entrepreneur?.entrepreneurship;
    if (!e) return [] as { url: string; key: string }[];
    return [
      { url: e.url_1, key: 'url_1' },
      { url: e.url_2, key: 'url_2' },
      { url: e.url_3, key: 'url_3' },
    ].filter((img): img is { url: string; key: string } => !!img.url);
  }, [entrepreneur]);

  const galleryUrls = useMemo(
    () => galleryImages.map(img => getProxyImageUrl(img.url)),
    [galleryImages]
  );

  useEffect(() => {
    if (!show) setLightboxIndex(null);
  }, [show]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(i => (i === null ? i : (i + 1) % galleryUrls.length));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(i => (i === null ? i : (i - 1 + galleryUrls.length) % galleryUrls.length));
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [lightboxIndex, galleryUrls.length]);

  if (!entrepreneur) return null;

  const getCategoryIcon = (category: string) => {
    const iconProps = {
      size: 14,
      className: "entrepreneur-details__category-icon"
    };
    switch (category) {
      case 'Comida':          return <CookingPot {...iconProps} />;
      case 'Artesanía':       return <Palette {...iconProps} />;
      case 'Vestimenta':      return <Shirt {...iconProps} />;
      case 'Accesorios':      return <Palette {...iconProps} />;
      case 'Decoración':      return <House {...iconProps} />;
      case 'Demostración':    return <Drama {...iconProps} />;
      case 'Otra categoría':  return <Sparkles {...iconProps} />;
      default:                return <Sparkles {...iconProps} />;
    }
  };

  const getApproachInfo = (approach: Entrepreneurship['approach']) => {
    const approaches = {
      social:    { label: 'Social',    color: 'bg-green-100 text-green-800'   },
      ambiental: { label: 'Ambiental', color: 'bg-blue-100 text-blue-800'    },
      cultural:  { label: 'Cultural',  color: 'bg-purple-100 text-purple-800' }
    };
    return approaches[approach] || { label: 'Sin enfoque', color: 'bg-gray-100 text-gray-800' };
  };

  const hasSocial = entrepreneur.facebook_url || entrepreneur.instagram_url;

  const fullName = [
    entrepreneur.person?.first_name,
    entrepreneur.person?.second_name,
    entrepreneur.person?.first_lastname,
    entrepreneur.person?.second_lastname
  ].filter(Boolean).join(' ');

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles del Emprendedor" size="xl" maxHeight>
      <div className="entrepreneur-details">

        <div className="entrepreneur-details__hero">
          <h3 className="entrepreneur-details__name">
            {entrepreneur.entrepreneurship?.name || fullName}
          </h3>
        </div>

        <div className={`entrepreneur-details__body${!entrepreneur.entrepreneurship ? ' entrepreneur-details__body--single' : ''}`}>

          <section className="entrepreneur-details__panel">
            <h4 className="entrepreneur-details__panel-title">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Datos Personales
            </h4>

            <dl className="entrepreneur-details__rows">
              <div className="entrepreneur-details__row">
                <dt className="entrepreneur-details__row-label">Nombre</dt>
                <dd className="entrepreneur-details__row-value">{fullName}</dd>
              </div>
              <div className="entrepreneur-details__row">
                <dt className="entrepreneur-details__row-label">Email</dt>
                <dd className="entrepreneur-details__row-value">{entrepreneur.person?.email}</dd>
              </div>
              <div className="entrepreneur-details__row">
                <dt className="entrepreneur-details__row-label">Teléfono</dt>
                <dd className="entrepreneur-details__row-value">
                  {formatPhoneForDisplay(entrepreneur.person?.phone_primary) || 'N/A'}
                </dd>
              </div>
              {entrepreneur.person?.phone_secondary && (
                <div className="entrepreneur-details__row">
                  <dt className="entrepreneur-details__row-label">Tel. Secundario</dt>
                  <dd className="entrepreneur-details__row-value">
                    {formatPhoneForDisplay(entrepreneur.person.phone_secondary)}
                  </dd>
                </div>
              )}
              <div className="entrepreneur-details__row">
                <dt className="entrepreneur-details__row-label">Experiencia</dt>
                <dd className="entrepreneur-details__row-value">
                  {entrepreneur.experience} {Number(entrepreneur.experience) === 1 ? 'año' : 'años'}
                </dd>
              </div>
            </dl>

            {hasSocial && (
              <div className="entrepreneur-details__social">
                {entrepreneur.facebook_url && (
                  <a
                    href={entrepreneur.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="entrepreneur-details__social-link entrepreneur-details__social-link--fb"
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                )}
                {entrepreneur.instagram_url && (
                  <a
                    href={entrepreneur.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="entrepreneur-details__social-link entrepreneur-details__social-link--ig"
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </a>
                )}
              </div>
            )}
          </section>

          {entrepreneur.entrepreneurship && (
            <section className="entrepreneur-details__panel">
              <h4 className="entrepreneur-details__panel-title">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Emprendimiento
              </h4>

              <p className="entrepreneur-details__eship-desc">{entrepreneur.entrepreneurship.description}</p>

              <dl className="entrepreneur-details__rows">
                <div className="entrepreneur-details__row">
                  <dt className="entrepreneur-details__row-label">Ubicación</dt>
                  <dd className="entrepreneur-details__row-value">{entrepreneur.entrepreneurship.location}</dd>
                </div>
                <div className="entrepreneur-details__row">
                  <dt className="entrepreneur-details__row-label">Categoría</dt>
                  <dd className="entrepreneur-details__row-value entrepreneur-details__row-value--flex">
                    {getCategoryIcon(entrepreneur.entrepreneurship.category)}
                    {entrepreneur.entrepreneurship.category}
                  </dd>
                </div>
                {entrepreneur.entrepreneurship.approach && (
                  <div className="entrepreneur-details__row">
                    <dt className="entrepreneur-details__row-label">Enfoque</dt>
                    <dd className="entrepreneur-details__row-value">
                      <span className={`entrepreneur-details__approach-badge entrepreneur-details__approach-badge--${entrepreneur.entrepreneurship.approach}`}>
                        {getApproachInfo(entrepreneur.entrepreneurship.approach).label}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </div>

        {galleryImages.length > 0 && (
          <section className="entrepreneur-details__gallery">
            <h4 className="entrepreneur-details__panel-title">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imágenes del Emprendimiento
            </h4>
            <div className="entrepreneur-details__gallery-grid">
              {galleryImages.map((img, i) => (
                <GalleryImage
                  key={img.key}
                  url={img.url}
                  alt={`Imagen ${i + 1} del emprendimiento`}
                  onOpen={() => setLightboxIndex(i)}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {lightboxIndex !== null && galleryUrls[lightboxIndex] && createPortal(
        <div className="entrepreneur-lightbox" onClick={() => setLightboxIndex(null)}>
          <button
            className="entrepreneur-lightbox__close"
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar"
          >
            ×
          </button>

          {galleryUrls.length > 1 && (
            <button
              className="entrepreneur-lightbox__nav entrepreneur-lightbox__prev"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(i => (i === null ? i : (i - 1 + galleryUrls.length) % galleryUrls.length));
              }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
          )}

          <img
            className="entrepreneur-lightbox__img"
            src={galleryUrls[lightboxIndex]}
            alt="Imagen del emprendimiento"
            crossOrigin="anonymous"
            onClick={(e) => e.stopPropagation()}
          />

          {galleryUrls.length > 1 && (
            <>
              <button
                className="entrepreneur-lightbox__nav entrepreneur-lightbox__next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(i => (i === null ? i : (i + 1) % galleryUrls.length));
                }}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
              <span className="entrepreneur-lightbox__count">{lightboxIndex + 1} / {galleryUrls.length}</span>
            </>
          )}
        </div>,
        document.body
      )}
    </GenericModal>
  );
};

export default EntrepreneurDetailsModal;
