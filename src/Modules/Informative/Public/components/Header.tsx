import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/context/AuthContext';

const Header: React.FC = () => {
  const [eventsOpen, setEventsOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuth();

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleUserMenu = () => setUserMenuOpen(o => !o);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const initials = (name?: string, last?: string) =>
    `${(name?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}` || '👤';

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
            <li><a href="#fairs">Ferias</a></li>
            <li><a href="#emprendedores">Emprendedores</a></li>
            <li><a href="#involve">Involúcrate</a></li>
          </ul>
        </nav>

        <div className="login-btn-container">
          {!isAuthenticated && !isLoading && (
            <Link to="/login" className="login-btn">Iniciar Sesión</Link>
          )}

          {isAuthenticated && user && (
            <div className="user-menu-cluster" ref={menuRef}>
              <span className="user-display-name">
                {user.firstName} {user.firstLastname}
              </span>

              <button
                className="user-avatar-btn"
                onClick={toggleUserMenu}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                aria-label="Cuenta de usuario"
                title="Cuenta de usuario"
              >
                <span className="avatar-circle">
                  {initials(user.firstName, user.firstLastname)}
                </span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown" role="menu">
                  <button
                    className="edit-profile-btn"
                    data-tooltip="Editar perfil"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/perfil');
                    }}
                    aria-label="Editar perfil"
                    title="Editar perfil"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                    </svg>
                  </button>

                  <div className="user-info">
                    <div className="user-name">
                      {user.firstName} {user.firstLastname}
                    </div>
                    {user.email && <div className="user-email">{user.email}</div>}
                    <div className="user-role-badge">
                      {user.primaryRole || user.roles?.[0] || 'usuario'}
                    </div>
                  </div>

                  <div className="menu-separator" />

                  <button
                    className="menu-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/admin/dashboard');
                    }}
                  >
                    Panel administrativo
                  </button>

                  <button
                    className="menu-item logout"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await logout();
                      await checkAuth();
                      navigate('/', { replace: true });
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
