import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../Auth/context/AuthContext';
import Sidebar from './Sidebar';
import { SuccessAlertProvider } from '../../Shared/components';
import '../styles/dashboard-principal.css';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, checkAuth, isLoading } = useAuth();
  const [theme, setTheme] = React.useState<'dark' | 'light'>(
    () => (localStorage.getItem('admin_theme') as 'dark' | 'light') ?? 'dark'
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

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
      try { await checkAuth(); } catch (_) { }
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

  return (
    <SuccessAlertProvider>
    <div className="admin-dashboard-container" data-theme={theme}>

      <div className="tb">
        <button
          className="tb-hamburger"
          onClick={() => setIsMobileSidebarOpen(true)}
          title="Menú"
        >
          <Menu size={16} />
        </button>
        <div className="tb-right">
          <button className="tb-theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="tb-btn tb-btn-public" onClick={() => navigate('/')}>
            Vista Pública
          </button>
          <button className="tb-btn-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div
        className={`sb-overlay${isMobileSidebarOpen ? ' active' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <div className="admin-layout">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="main-scroll">
          <Outlet />
        </main>
      </div>

    </div>
    </SuccessAlertProvider>
  );
};

export default AdminLayout;
