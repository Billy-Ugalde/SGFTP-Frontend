import React, { useEffect } from 'react';

const Header: React.FC = () => {
  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      e.preventDefault();

      const scrollToTarget = () => {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          setTimeout(scrollToTarget, 100); 
        }
      };

      scrollToTarget();
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(a => a.addEventListener('click', handleAnchorClick));

    return () => {
      anchors.forEach(a => a.removeEventListener('click', handleAnchorClick));
    };
  }, []);

  return (
    <header>
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">🐢</div>
          <div>
            <h2>Tamarindo Park Foundation</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Tu voz, nuestro proyecto</p>
          </div>
        </div>
        <nav>
          <ul>
            <li><a href="#hero">Inicio</a></li>
            <li><a href="#noticias">Noticias</a></li>
            <li><a href="#eventos">Eventos</a></li>
            <li><a href="#proyectos">Proyectos</a></li>
            <li><a href="#involve">Involúcrate</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
