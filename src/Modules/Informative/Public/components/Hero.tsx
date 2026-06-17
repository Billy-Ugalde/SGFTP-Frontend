import React, { useEffect } from 'react';
import type { HeroSection } from '../../services/informativeService';
import heroStyles from '../styles/Hero.module.css';

interface HeroProps {
  data: HeroSection;
  backgroundImageUrl?: string;
}

const Hero: React.FC<HeroProps> = ({ data, backgroundImageUrl }) => {
  const bgUrl = backgroundImageUrl || data.backgroundImage;

  // Preload de la imagen de fondo con alta prioridad para mejorar LCP.
  // backgroundImage CSS no es descubierta por el preload scanner del browser.
  useEffect(() => {
    if (!bgUrl) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = bgUrl;
    (link as any).fetchPriority = 'high';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [bgUrl]);

  return (
    <section
      className={heroStyles.hero}
      id={data.id}
      style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
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
