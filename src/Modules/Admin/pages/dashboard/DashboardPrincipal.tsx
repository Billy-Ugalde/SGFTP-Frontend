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

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-container">
        <div className="header">
          <h1>Panel de Administración</h1>

          <div className="header-actions">
            <div className="user-info">
              <span>Bienvenido, {user.person.firstName}</span>
            </div>

            <button
              className="home-btn"
              onClick={() => navigate('/')}
              title="Ir a la vista pública"
            >
              Home
            </button>
          </div>
        </div>

        <div className="cards-grid">
          {accessibleModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.key}
                className={`card ${module.className}`}
                onClick={() => handleNavigation(module.route)}
              >
                <div className="card-icon">
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h2>{module.title}</h2>
                <p className="card-description">{module.description}</p>
                <div className="stats-bar"></div>
              </div>
            );
          })}
        </div>

        <div className="section-separator" />

        <div className="footer-actions">
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPrincipal;