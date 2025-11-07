import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/context/AuthContext';
import headerStyles from '../styles/Header.module.css';

const Header: React.FC = () => {
  const adminRoles = ['super_admin', 'general_admin', 'fair_admin', 'content_admin', 'auditor'];
  const [eventsOpen, setEventsOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout, checkAuth } = useAuth();

  const hasAdminAccess = () => {
    if (!user?.roles) return false;
    return user.roles.some(role => adminRoles.includes(role));
  };
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

  const getRoleDisplayName = (roleName: string): string => {
    const roleTranslations: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'general_admin': 'Administrador General',
      'fair_admin': 'Administrador de Ferias',
      'content_admin': 'Administrador de Contenido',
      'auditor': 'Auditor',
      'entrepreneur': 'Emprendedor',
      'volunteer': 'Voluntario'
    };

    return roleTranslations[roleName] || roleName;
  };

  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.headerContent}>
        <div className={headerStyles.logoTitleContainer} onClick={handleLogoClick}>
          <div className={headerStyles.logo}>
            <div className={headerStyles.logoIcon}>
              <img
                src="/turtle-icon.svg"
                alt="Logo"
                className={headerStyles.logoImage}
              />
            </div>
            <div>
              <h2>Tamarindo Park Foundation</h2>
              <p className={headerStyles.logoSubtitle}>Tu voz, nuestro proyecto</p>
            </div>
          </div>
        </div>

        <nav>
          <ul className={headerStyles.nav}>
            <li><a href="#noticias">Noticias</a></li>
            <li
              className={headerStyles.dropdown}
              onMouseEnter={() => setEventsOpen(true)}
              onMouseLeave={() => setEventsOpen(false)}
            >
              <button
                className={headerStyles.dropdownTrigger}
                onClick={() => setEventsOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={eventsOpen}
              >
                Eventos <span className={headerStyles.caret}>▾</span>
              </button>

              <ul className={`${headerStyles.dropdownMenu} ${eventsOpen ? headerStyles.show : ''}`} role="menu">
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

        <div className={headerStyles.loginBtnContainer}>
          {!isAuthenticated && (
            <Link to="/login" className={headerStyles.loginBtn}>Iniciar Sesión</Link>
          )}

          {isAuthenticated && user && (
            <div className={headerStyles.userMenuCluster} ref={menuRef}>
              <span className={headerStyles.userDisplayName}>
                {user.firstName} {user.firstLastname}
              </span>

              <button
                className={headerStyles.userAvatarBtn}
                onClick={toggleUserMenu}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                aria-label="Cuenta de usuario"
                title="Cuenta de usuario"
              >
                <span className={headerStyles.avatarCircle}>
                  {initials(user.firstName, user.firstLastname)}
                </span>
              </button>

              {userMenuOpen && (
                <div className={headerStyles.userDropdown} role="menu">
                  <button
                    className={headerStyles.editProfileBtn}
                    data-tooltip="Editar perfil"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/perfil');
                    }}
                    aria-label="Editar perfil"
                    title="Editar perfil"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor" />
                    </svg>
                  </button>

                  <div className={headerStyles.userInfo}>
                    <div className={headerStyles.userName}>
                      {user.firstName} {user.firstLastname}
                    </div>
                    {user.email && <div className={headerStyles.userEmail}>{user.email}</div>}
                    <div className={headerStyles.userRolesContainer}>
                      {user.roles?.map(role => (
                        <span key={role} className={headerStyles.userRoleBadge}>
                          {getRoleDisplayName(role)}
                        </span>
                      )) || <span className={headerStyles.userRoleBadge}>usuario</span>}
                    </div>
                  </div>

                  <div className={headerStyles.menuSeparator} />

                  {hasAdminAccess() && (
                    <button
                      className={headerStyles.menuItem}
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/admin/dashboard');
                      }}
                    >
                      Panel administrativo
                    </button>
                  )}

                  <button
                    className={`${headerStyles.menuItem} ${headerStyles.logout}`}
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
