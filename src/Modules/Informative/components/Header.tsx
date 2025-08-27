import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Hace scroll al inicio de la página
  };

  return (
    <header>
      <div className="header-content">
        {/* Logo y Título */}
        <div className="logo-title-container" onClick={handleLogoClick}>
          <div className="logo">
            <div className="logo-icon">🐢</div>
            <div>
              <h2>Tamarindo Park Foundation</h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Tu voz, nuestro proyecto</p>
            </div>
          </div>
        </div>

        {/* Menú de secciones en línea */}
        <nav>
          <ul>
            <li><a href="#noticias">Noticias</a></li>
            <li><a href="#eventos">Eventos</a></li>
            <li><a href="#proyectos">Proyectos</a></li>
            <li><a href="#emprendedores">Emprendedores</a></li>
            <li><a href="#involucrate">Involúcrate</a></li>
          </ul>
        </nav>

        {/* Botón de Iniciar sesión */}
        <div className="login-btn-container">
          <Link to="/login" className="login-btn">Iniciar Sesión</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
