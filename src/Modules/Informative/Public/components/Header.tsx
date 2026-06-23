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

interface HeaderProps {
  hideNav?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ hideNav = false, onBack }) => {
  const adminRoles = ['super_admin', 'general_admin', 'fair_admin', 'content_admin', 'auditor'];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activitiesMenuOpen, setActivitiesMenuOpen] = useState(false);
  const [involveMenuOpen, setInvolveMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
        setActivitiesMenuOpen(false);
        setInvolveMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const getRoleBadgeClass = (roleName: string): string => {
    const map: Record<string, string> = {
      'super_admin': headerStyles.roleSuperAdmin,
      'general_admin': headerStyles.roleGeneralAdmin,
      'fair_admin': headerStyles.roleFairAdmin,
      'content_admin': headerStyles.roleContentAdmin,
      'auditor': headerStyles.roleAuditor,
      'entrepreneur': headerStyles.roleEntrepreneur,
      'volunteer': headerStyles.roleVolunteer,
    };
    return map[roleName] ?? '';
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`${headerStyles.header} ${scrolled ? headerStyles.headerScrolled : ''}`}>
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
            </div>
          </div>
        </div>

        {/* Botón hamburguesa para móvil */}
        {!hideNav && (
          <button
            className={headerStyles.mobileMenuToggle}
            onClick={toggleMobileMenu}
            aria-label="Menú principal"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        <nav className={`${headerStyles.navContainer} ${mobileMenuOpen ? headerStyles.navOpen : ''}`}>
          <ul className={headerStyles.nav} style={hideNav ? { display: 'none' } : undefined}>
            <li><a href="#propuesta" onClick={handleNavLinkClick}>Propuesta de Valor</a></li>
            <li><a href="#stats" onClick={handleNavLinkClick}>Impacto</a></li>
            <li><a href="#proyectos" onClick={handleNavLinkClick}>Proyectos</a></li>
            <li
              className={headerStyles.dropdown}
              onMouseEnter={() => window.innerWidth > 768 && setActivitiesMenuOpen(true)}
              onMouseLeave={() => window.innerWidth > 768 && setActivitiesMenuOpen(false)}
            >
              <button
                className={headerStyles.dropdownTrigger}
                onClick={(e) => {
                  e.preventDefault();
                  setActivitiesMenuOpen(o => !o);
                }}
                aria-haspopup="menu"
                aria-expanded={activitiesMenuOpen}
              >
                Actividades <ChevronDown size={14} style={{ marginLeft: '4px' }} />
              </button>
              {activitiesMenuOpen && (
                <ul className={headerStyles.dropdownMenu} role="menu">
                  <li role="none">
                    <a
                      role="menuitem"
                      href="#eventos"
                      onClick={() => {
                        setActivitiesMenuOpen(false);
                        handleNavLinkClick();
                      }}
                    >
                      Próximas
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="#realizadas"
                      onClick={() => {
                        setActivitiesMenuOpen(false);
                        handleNavLinkClick();
                      }}
                    >
                      Realizadas
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li><a href="#schools" onClick={handleNavLinkClick}>Escuelas</a></li>
            <li><a href="#fairs" onClick={handleNavLinkClick}>Ferias</a></li>
            <li><a href="#emprendedores" onClick={handleNavLinkClick}>Emprendedores</a></li>
            <li><a href="#noticias" onClick={handleNavLinkClick}>Noticias</a></li>
            <li
              className={headerStyles.dropdown}
              onMouseEnter={() => window.innerWidth > 768 && setInvolveMenuOpen(true)}
              onMouseLeave={() => window.innerWidth > 768 && setInvolveMenuOpen(false)}
            >
              <button
                className={headerStyles.dropdownTrigger}
                onClick={(e) => {
                  e.preventDefault();
                  setInvolveMenuOpen(o => !o);
                }}
                aria-haspopup="menu"
                aria-expanded={involveMenuOpen}
              >
                Involúcrate <ChevronDown size={14} style={{ marginLeft: '4px' }} />
              </button>
              {involveMenuOpen && (
                <ul className={headerStyles.dropdownMenu} role="menu">
                  <li role="none">
                    <a
                      role="menuitem"
                      href="#donaciones"
                      onClick={() => {
                        setInvolveMenuOpen(false);
                        handleNavLinkClick();
                      }}
                    >
                      Donación
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="#become-volunteer"
                      onClick={() => {
                        setInvolveMenuOpen(false);
                        handleNavLinkClick();
                      }}
                    >
                      Voluntariado
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="#become-entrepreneur"
                      onClick={() => {
                        setInvolveMenuOpen(false);
                        handleNavLinkClick();
                      }}
                    >
                      Emprendimiento
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className={headerStyles.loginBtnContainer} ref={menuRef}>
          {onBack && (
            <button className={headerStyles.backBtnHeader} onClick={onBack}>
              <span className={headerStyles.backBtnTextFull}>← Volver al inicio</span>
              <span className={headerStyles.backBtnTextShort}>← Inicio</span>
            </button>
          )}

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
                        <span key={role} className={`${headerStyles.userRoleBadge} ${getRoleBadgeClass(role)}`}>
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
                        navigate('/admin');
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