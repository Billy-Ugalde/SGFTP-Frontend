import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/context/AuthContext';
import headerStyles from '../styles/Header.module.css';
import {
  Menu,
  X,
  ChevronDown,
  Edit3,
  LogOut,
  Settings
} from 'lucide-react';

const Header: React.FC = () => {
  const adminRoles = ['super_admin', 'general_admin', 'fair_admin', 'content_admin', 'auditor'];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
  };

  const toggleUserMenu = () => setUserMenuOpen(o => !o);
  const toggleMobileMenu = () => setMobileMenuOpen(o => !o);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (window.innerWidth <= 768) {
        const navElement = document.querySelector(`.${headerStyles.nav}`);
        if (navElement && !navElement.contains(e.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
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

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
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

        {/* Botón hamburguesa para móvil */}
        <button
          className={headerStyles.mobileMenuToggle}
          onClick={toggleMobileMenu}
          aria-label="Menú principal"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`${headerStyles.navContainer} ${mobileMenuOpen ? headerStyles.navOpen : ''}`}>
          <ul className={headerStyles.nav}>
            {/* NUEVO ORDEN: Eventos, Proyectos, Actividades, Ferias, Emprendedores, Noticias, Involúcrate */}
            <li><a href="#eventos" onClick={handleNavLinkClick}>Eventos</a></li>
            <li><a href="#proyectos" onClick={handleNavLinkClick}>Proyectos</a></li>
            <li><a href="#actividades" onClick={handleNavLinkClick}>Actividades</a></li>
            <li><a href="#fairs" onClick={handleNavLinkClick}>Ferias</a></li>
            <li><a href="#emprendedores" onClick={handleNavLinkClick}>Emprendedores</a></li>
            <li><a href="#noticias" onClick={handleNavLinkClick}>Noticias</a></li>
            <li><a href="#involve" onClick={handleNavLinkClick}>Involúcrate</a></li>
          </ul>
        </nav>

        <div className={headerStyles.loginBtnContainer} ref={menuRef}>
          {!isAuthenticated && (
            <Link to="/login" className={headerStyles.loginBtn} onClick={() => setMobileMenuOpen(false)}>
              Iniciar Sesión
            </Link>
          )}

          {isAuthenticated && user?.person && (
            <div className={headerStyles.userMenuCluster}>
              <span className={headerStyles.userDisplayName}>
                {user.person.firstName} {user.person.firstLastname}
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
                  {initials(user.person.firstName, user.person.firstLastname)}
                </span>
                <ChevronDown size={16} className={headerStyles.avatarCaret} />
              </button>

              {userMenuOpen && (
                <div className={headerStyles.userDropdown} role="menu">
                  <button
                    className={headerStyles.editProfileBtn}
                    onClick={() => {
                      setUserMenuOpen(false);
                      setMobileMenuOpen(false);
                      navigate('/perfil');
                    }}
                    aria-label="Editar perfil"
                    title="Editar perfil"
                  >
                    <Edit3 size={16} />
                    Editar perfil
                  </button>

                  <div className={headerStyles.userInfo}>
                    <div className={headerStyles.userName}>
                      {user.person.firstName} {user.person.firstLastname}
                    </div>
                    {user.person.email && <div className={headerStyles.userEmail}>{user.person.email}</div>}
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
                        setMobileMenuOpen(false);
                        navigate('/admin/dashboard');
                      }}
                    >
                      <Settings size={16} />
                      Panel administrativo
                    </button>
                  )}

                  <button
                    className={`${headerStyles.menuItem} ${headerStyles.logout}`}
                    onClick={async () => {
                      setUserMenuOpen(false);
                      setMobileMenuOpen(false);
                      await logout();
                      await checkAuth();
                      navigate('/', { replace: true });
                    }}
                  >
                    <LogOut size={16} />
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