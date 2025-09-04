import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [eventsOpen, setEventsOpen] = useState(false);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header>
      <div className="header-content">
        <div className="logo-title-container" onClick={handleLogoClick}>
          <div className="logo">
            <div className="logo-icon">🐢</div>
            <div>
              <h2>Tamarindo Park Foundation</h2>
              <p className="logo-subtitle">Tu voz, nuestro proyecto</p>
            </div>
          </div>
        </div>

        <nav>
          <ul className="nav">
            <li><a href="#noticias">Noticias</a></li>
            <li
              className="dropdown"
              onMouseEnter={() => setEventsOpen(true)}
              onMouseLeave={() => setEventsOpen(false)}
            >
              <button
                className="dropdown-trigger"
                onClick={() => setEventsOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={eventsOpen}
              >
                Eventos <span className="caret">▾</span>
              </button>

              <ul className={`dropdown-menu ${eventsOpen ? 'show' : ''}`} role="menu">
                <li role="none">
                  <a role="menuitem" href="#eventos" onClick={() => setEventsOpen(false)}>
                    Próximos
                  </a>
                </li>
                <li role="none">
                  <a role="menuitem" href="#proyectos" onClick={() => setEventsOpen(false)}>
                    Realizados
                  </a>
                </li>
              </ul>
            </li>

            <li><a href="#entrepreneurs">Emprendedores</a></li>
            <li><a href="#involve">Involúcrate</a></li>
          </ul>
        </nav>

        <div className="login-btn-container">
          <Link to="/login" className="login-btn">Iniciar Sesión</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
