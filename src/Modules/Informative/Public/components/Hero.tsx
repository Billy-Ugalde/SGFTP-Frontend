import React from 'react';
import type { HeroSection } from '../../services/informativeService';
import { useSectionContent } from '../../Admin/services/contentBlockService';
import heroStyles from '../styles/Hero.module.css';

interface HeroProps {
  data: HeroSection;
}

// Base URL del backend
const API_BASE: string = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';

// Función para convertir URL de Drive al formato proxy (igual que en Footer)
const getProxyImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('/images/proxy')) return url;
  if (url.includes('drive.google.com')) {
    return `${API_BASE}/images/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// Helper para procesar URLs de imágenes
const processImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // URLs de Google Drive usan el proxy
  if (trimmed.includes('drive.google.com')) {
    return getProxyImageUrl(trimmed);
  }

  // URLs absolutas externas
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // URLs relativas
  return `${API_BASE}${trimmed.startsWith('/') ? trimmed : '/' + trimmed}`;
};

const Hero: React.FC<HeroProps> = ({ data }) => {
  // Cargar datos del backend para la sección hero
  const { data: heroData } = useSectionContent('home', 'hero');

  // Obtener la URL de la imagen de fondo
  const backgroundImageUrl = React.useMemo(() => {
    const bgUrl = heroData?.background;
    if (bgUrl && typeof bgUrl === 'string') {
      return processImageUrl(bgUrl);
    }
    // Fallback a la imagen por defecto si no hay nada en el backend
    return data.backgroundImage;
  }, [heroData, data.backgroundImage]);

  return (
    <section
      className={heroStyles.hero}
      id={data.id}
      style={{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
      }}
    >
      <div className={heroStyles.heroContent}>
        <h1>{data.title}</h1>
        <p className={heroStyles.subtitle}><em>{data.subtitle}</em></p>
        <p>{data.description}</p>
      </div>
    </section>
  );
};

export default Hero;
