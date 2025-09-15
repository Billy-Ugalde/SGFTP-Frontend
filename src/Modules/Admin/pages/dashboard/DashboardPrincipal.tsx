import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/context/AuthContext';
import { getAvailableModules } from '../../../Shared/utils/rolePermissions';
import type { ModuleKey } from '../../../Shared/utils/rolePermissions';

import '../../styles/dashboard-principal.css';

interface ModuleConfig {
  title: string;
  icon: string;
  description: string;
  className: string;
  route: string;
}

// Configuración de módulos usando las clases CSS existentes
const ALL_MODULES: Record<ModuleKey, ModuleConfig> = {
  ferias: {
    title: 'Ferias',
    icon: '🎪',
    description: 'Gestión del módulo ferias.',
    className: 'ferias',
    route: '/admin/ferias',
  },
  informativo: {
    title: 'Informativo',
    icon: '📰',
    description: 'Centro de noticias y comunicaciones. Publica actualizaciones y mantén informada a la comunidad.',
    className: 'informativo',
    route: '/admin/informativo',
  },
  donadores: {
    title: 'Donadores',
    icon: '💰',
    description: 'Gestiona la base de datos de donadores, historial de contribuciones y relaciones.',
    className: 'donadores',
    route: '/admin/donadores',
  },
  emprendedores: {
    title: 'Emprendedores',
    icon: '🚀',
    description: 'Directorio de emprendedores, seguimiento de startups y programas de mentoría.',
    className: 'emprendedores',
    route: '/admin/emprendedores',
  },
  usuarios: {
    title: 'Usuarios',
    icon: '👥',
    description: 'Administra permisos de usuario, roles del sistema y control de acceso a funcionalidades.',
    className: 'roles',
    route: '/admin/usuarios',
  },
};

const DashboardPrincipal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/login');
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

  const availableModules = getAvailableModules(user.role);
  const accessibleModules = availableModules.map(moduleKey => ({
    key: moduleKey,
    ...ALL_MODULES[moduleKey]
  }));

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-container">
        <div className="header">
          <h1>Panel de Administración</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>

        <div className="cards-grid">
          {accessibleModules.map((module) => (
            <div
              key={module.key}
              className={`card ${module.className}`}
              onClick={() => handleNavigation(module.route)}
            >
              <div className="card-icon">{module.icon}</div>
              <h2>{module.title}</h2>
              <p className="card-description">{module.description}</p>
              <div className="stats-bar"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPrincipal;