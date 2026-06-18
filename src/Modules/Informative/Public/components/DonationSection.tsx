import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HandCoins, Shirt, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import styles from '../styles/DonationSection.module.css';

const API_BASE: string = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';

const processImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.includes('/images/proxy')) return trimmed;
  if (trimmed.includes('drive.google.com')) {
    return `${API_BASE}/images/proxy?url=${encodeURIComponent(trimmed)}`;
  }
  return trimmed;
};

interface Props {
  onDonateClick: () => void;
  accountsImage?: string | null;
}

const donationTypes = [
  { icon: <HandCoins size={24} />, title: 'Dinero',          description: 'Contribuciones económicas para financiar nuestros proyectos' },
  { icon: <ShoppingBag size={24} />, title: 'Artículos',     description: 'Materiales, equipos o artículos de utilidad' },
  { icon: <Shirt size={24} />, title: 'Ropa y Alimentos',    description: 'Ayuda directa para las familias de nuestra comunidad' },
  { icon: <Heart size={24} />, title: 'Otros',               description: 'Cualquier tipo de apoyo que puedas brindar' },
];

const DonationSection: React.FC<Props> = ({ onDonateClick, accountsImage }) => {
  const imageUrl = processImageUrl(accountsImage);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  return (
    <section className={styles.ctaSection} id="donaciones">
      <div className={styles.ctaContainer}>
        <div className={styles.ctaContent}>

          {/* ── Header centrado ── */}
          <div className={styles.ctaHeader}>
            <h2 className={styles.ctaTitle}>¿Quieres Hacer una Donación?</h2>
            <p className={styles.ctaSubtitle}>
              Tu apoyo impulsa el desarrollo cultural, ambiental y social de nuestra comunidad.
              Víveres, ropa, dinero u otros artículos — cada contribución suma.
              Únete a nuestra red de donantes y aliados estratégicos.
            </p>
          </div>

          {/* ── Cuerpo: imagen izquierda + cards derecha ── */}
          <div className={imageUrl ? styles.bodyLayout : styles.bodyFull}>

            {/* Columna izquierda: 4 cards en columna única */}
            <div className={styles.benefitsGrid}>
              {donationTypes.map((type, i) => (
                <div key={i} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>{type.icon}</div>
                  <div>
                    <h3 className={styles.benefitTitle}>{type.title}</h3>
                    <p className={styles.benefitDesc}>{type.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Columna derecha: imagen de cuentas */}
            {imageUrl && (
              <div className={styles.imageCol}>
                <h3 className={styles.accountsTitle}>Información de Cuentas Bancarias</h3>
                <button
                  type="button"
                  className={styles.accountsSection}
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Ampliar información de cuentas"
                >
                  <img
                    src={imageUrl}
                    alt="Información de cuentas para donaciones"
                    className={styles.accountsImg}
                    width="372"
                    height="238"
                  />
                </button>
                <p className={styles.accountsHint}>Haz clic en la imagen para ampliar</p>
              </div>
            )}

          </div>

          {/* ── Botón centrado ── */}
          <button className={styles.ctaButton} onClick={onDonateClick}>
            <span>Quiero Hacer una Donación</span>
            <ArrowRight size={20} />
          </button>

        </div>
      </div>

      {lightboxOpen && imageUrl && createPortal(
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            className={styles.lightboxImg}
            src={imageUrl}
            alt="Información de cuentas para donaciones"
            onClick={e => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </section>
  );
};

export default DonationSection;
