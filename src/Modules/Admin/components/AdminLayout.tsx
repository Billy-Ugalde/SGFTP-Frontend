import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../Auth/context/AuthContext';
import Sidebar from './Sidebar';
import '../styles/dashboard-principal.css';

const MODULE_TITLES: Record<string, string> = {
  ferias:        'Ferias',
  emprendedores: 'Emprendedores',
  proyectos:     'Proyectos',
  actividades:   'Actividades',
  usuarios:      'Usuarios',
  donadores:     'Donadores',
  voluntarios:   'Voluntarios',
  noticias:      'Noticias',
  informativo:   'Informativo',
  newsletters:   'Newsletters',
  perfil:        'Mi Perfil',
};

const ROLE_LABELS: Record<string, string> = {
  super_admin:    'Super Admin',
  general_admin:  'Admin General',
  fair_admin:     'Admin de Ferias',
  content_admin:  'Admin de Contenido',
  auditor:        'Auditor',
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, checkAuth, isLoading } = useAuth();
  const [theme, setTheme] = React.useState<'dark' | 'light'>(
    () => (localStorage.getItem('admin_theme') as 'dark' | 'light') ?? 'dark'
  );

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('admin_theme', next);
      return next;
    });
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    } finally {
      try { await checkAuth(); } catch (_) {}
      navigate('/', { replace: true });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="admin-dashboard-container">
        <div style={{ padding: '2rem', color: 'var(--t2)' }}>Cargando…</div>
      </div>
    );
  }

  const segment = location.pathname.replace('/admin', '').replace(/^\//, '');
  const isHome = segment === '' || segment === 'dashboard';
  const moduleTitle = MODULE_TITLES[segment];

  const primaryRole = user.roles
    .map((r) => ({ label: ROLE_LABELS[r], level: Object.keys(ROLE_LABELS).indexOf(r) }))
    .filter((r) => r.label)
    .sort((a, b) => a.level - b.level)[0]?.label ?? user.roles[0];

  return (
    <div className="admin-dashboard-container" data-theme={theme}>

      {/* ── Titlebar ── */}
      <div className="tb">
        <div className="tb-center">
          {isHome ? (
            <>
              <span className="tb-welcome">Bienvenido, {user.person.firstName}</span>
              <span className="tb-welcome-sub">Sesión activa · {primaryRole}</span>
            </>
          ) : (
            <span className="tb-welcome">{moduleTitle}</span>
          )}
        </div>
        <div className="tb-right">
          <button className="tb-theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="tb-btn" onClick={() => navigate('/')}>
            Vista Pública
          </button>
          <button className="tb-btn-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="admin-layout">
        <Sidebar />
        <main className="main-scroll">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
