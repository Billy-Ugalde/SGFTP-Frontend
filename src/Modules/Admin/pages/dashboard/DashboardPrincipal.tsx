import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/context/AuthContext';
import { getAvailableModules } from '../../../Shared/utils/rolePermissions';
import type { ModuleKey } from '../../../Shared/utils/rolePermissions';
import {
  Store,
  BookType,
  HandHeart,
  Amphora,
  FolderKanban,
  Users,
  Sprout,
  HandHelping,
  FileText,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

import '../../styles/dashboard-principal.css';

interface ModuleConfig {
  title: string;
  icon: LucideIcon;
  description: string;
  className: string;
  route: string;
}

const ALL_MODULES: Record<ModuleKey, ModuleConfig> = {
  ferias: {
    title: 'Ferias',
    icon: Store,
    description: 'Gestión del módulo ferias.',
    className: 'ferias',
    route: '/admin/ferias',
  },
  informativo: {
    title: 'Informativo',
    icon: BookType,
    description:
      'Centro de noticias y comunicaciones. Publica actualizaciones y mantén informada a la comunidad.',
    className: 'informativo',
    route: '/admin/informativo',
  },
  donadores: {
    title: 'Donadores',
    icon: HandHeart,
    description:
      'Gestiona la base de datos de donadores, historial de contribuciones y relaciones.',
    className: 'donadores',
    route: '/admin/donadores',
  },
  emprendedores: {
    title: 'Emprendedores',
    icon: Amphora,
    description:
      'Gestión de emprendedores registrados en la fundación.',
    className: 'emprendedores',
    route: '/admin/emprendedores',
  },
  proyectos: {
    title: 'Proyectos',
    icon: FolderKanban,
    description:
      'Administración de Proyectos',
    className: 'proyectos',
    route: '/admin/proyectos',
  },
  usuarios: {
    title: 'Usuarios',
    icon: Users,
    description:
      'Administra permisos de usuario, roles del sistema y control de acceso a funcionalidades.',
    className: 'roles',
    route: '/admin/usuarios',
  },
  actividades: {
    title: 'Actividades',
    icon: Sprout,
    description:
      'Gestión de actividades ambientales. Crear, editar y coordinar eventos sostenibles.',
    className: 'actividades',
    route: '/admin/actividades',
  },
  voluntarios: {
    title: 'Voluntarios',
    icon: HandHelping,
    description:
      'Gestión de voluntarios.',
    className: 'voluntarios',
    route: '/admin/voluntarios',
  },
  noticias: {
    title: 'Noticias',
    icon: FileText,
    description: 'Gestiona publicaciones, estado público y archivo de noticias.',
    className: 'noticias',
    route: '/admin/noticias',
  },
  newsletters: {
    title: 'Newsletters',
    icon: Mail,
    description:
      'Gestión de newsletters.',
    className: 'newsletters',
    route: '/admin/newsletters',
  },
};

const DashboardPrincipal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, checkAuth, isLoading } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (e) {
      console.error('Error al cerrar sesión (continuando a Home):', e);
    } finally {
      try { await checkAuth(); } catch (_) { }
      navigate('/', { replace: true });
    }
  };

  const handleNavigation = (route: string): void => {
    navigate(route);
  };

  if (isLoading || !user) {
    return (
      <div className="admin-dashboard-container">
        <div className="dashboard-container">
          <div>Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  const availableModules = getAvailableModules(user.roles);
  const accessibleModules = availableModules.map((moduleKey) => ({
    key: moduleKey,
    ...ALL_MODULES[moduleKey],
  }));

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      <div className="dashboard-container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>{getGreeting()} 👋</h1>
            <p className="header-subtitle">Panel de Administración · {currentDate}</p>
          </div>

          <div className="header-actions">
            <div className="user-info">
              <span>{user.person.firstName} {user.person.lastName}</span>
            </div>

            <button
              className="home-btn"
              onClick={() => navigate('/')}
              title="Ir a la vista pública"
            >
              Vista Pública
            </button>

            <button className="logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Visitados Recientemente */}
          <div className="section-title">Visitados recientemente</div>
          <div className="cards-grid">
            {accessibleModules.slice(0, 4).map((module) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={module.key}
                  className={`card ${module.className}`}
                  onClick={() => handleNavigation(module.route)}
                >
                  <div className="card-icon">
                    <IconComponent size={24} strokeWidth={2} />
                  </div>
                  <h2>{module.title}</h2>
                  <p className="card-time">Ayer</p>
                </div>
              );
            })}
          </div>

          {/* Actividad Reciente */}
          <div className="section-title">Actividad reciente</div>
          <div className="activity-section">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot green"></div>
                <p className="activity-text">
                  Nueva feria registrada — <span className="activity-highlight green">Feria Nacional 2026</span>
                </p>
              </div>

              <div className="activity-item">
                <div className="activity-dot blue"></div>
                <p className="activity-text">
                  Usuario <span className="activity-highlight blue">maria.garcia@cr</span> creó una cuenta
                </p>
              </div>

              <div className="activity-item">
                <div className="activity-dot amber"></div>
                <p className="activity-text">
                  Proyecto <span className="activity-highlight amber">Verde Comunal</span> cambió a estado Pendiente
                </p>
              </div>

              <div className="activity-item">
                <div className="activity-dot purple"></div>
                <p className="activity-text">
                  Newsletter <span className="activity-highlight purple">Campaña Marzo</span> enviada a 1,284 usuarios
                </p>
              </div>

              <div className="activity-item">
                <div className="activity-dot pink"></div>
                <p className="activity-text">
                  Donación registrada — <span className="activity-highlight pink">Fundación ABC · ₡150,000</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPrincipal;