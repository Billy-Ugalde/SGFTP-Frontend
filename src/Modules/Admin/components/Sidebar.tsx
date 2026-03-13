import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/context/AuthContext';
import { getAvailableModules } from '../../Shared/utils/rolePermissions';
import type { ModuleKey } from '../../Shared/utils/rolePermissions';
import {
  Tent,
  BookType,
  HeartHandshake,
  Rocket,
  FolderKanban,
  Users,
  Sprout,
  HandHelping,
  FileText,
  Mail,
  Home,
  ChevronRight,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import '../styles/sidebar.css';

interface ModuleConfig {
  title: string;
  icon: LucideIcon;
  route: string;
  group: 'principal' | 'gestion' | 'comunidad' | 'publicaciones';
}

const ALL_MODULES: Record<ModuleKey, ModuleConfig> = {
  ferias: {
    title: 'Ferias',
    icon: Tent,
    route: '/admin/ferias',
    group: 'gestion',
  },
  informativo: {
    title: 'Informativo',
    icon: BookType,
    route: '/admin/informativo',
    group: 'publicaciones',
  },
  donadores: {
    title: 'Donadores',
    icon: HeartHandshake,
    route: '/admin/donadores',
    group: 'comunidad',
  },
  emprendedores: {
    title: 'Emprendedores',
    icon: Rocket,
    route: '/admin/emprendedores',
    group: 'comunidad',
  },
  proyectos: {
    title: 'Proyectos',
    icon: FolderKanban,
    route: '/admin/proyectos',
    group: 'gestion',
  },
  usuarios: {
    title: 'Usuarios',
    icon: Users,
    route: '/admin/usuarios',
    group: 'comunidad',
  },
  actividades: {
    title: 'Actividades',
    icon: Sprout,
    route: '/admin/actividades',
    group: 'gestion',
  },
  voluntarios: {
    title: 'Voluntarios',
    icon: HandHelping,
    route: '/admin/voluntarios',
    group: 'comunidad',
  },
  noticias: {
    title: 'Noticias',
    icon: FileText,
    route: '/admin/noticias',
    group: 'publicaciones',
  },
  newsletters: {
    title: 'Newsletters',
    icon: Mail,
    route: '/admin/newsletters',
    group: 'publicaciones',
  },
};

const GROUP_LABELS = {
  principal: 'PRINCIPAL',
  gestion: 'GESTIÓN',
  comunidad: 'COMUNIDAD',
  publicaciones: 'PUBLICACIONES',
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!user) return null;

  const availableModules = getAvailableModules(user.roles);
  const accessibleModules = availableModules.map((moduleKey) => ({
    key: moduleKey,
    ...ALL_MODULES[moduleKey],
  }));

  const groupedModules = accessibleModules.reduce((acc, module) => {
    if (!acc[module.group]) {
      acc[module.group] = [];
    }
    acc[module.group].push(module);
    return acc;
  }, {} as Record<string, typeof accessibleModules>);

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const isActive = (route: string) => {
    if (route === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(route) && location.pathname !== '/admin' && location.pathname !== '/admin/';
  };

  return (
    <aside
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <LayoutGrid className="sidebar-logo-icon" />
        </div>
        <span className="sidebar-title">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Inicio */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">PRINCIPAL</div>
          <button
            onClick={() => handleNavigation('/admin')}
            className={`sidebar-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}
            data-module="inicio"
          >
            <div className="sidebar-item-content">
              <Home className="sidebar-item-icon" />
              <span className="sidebar-item-text">Inicio</span>
            </div>
            <ChevronRight className="sidebar-item-arrow" />
          </button>
        </div>

        {/* Módulos dinámicos agrupados */}
        {Object.entries(groupedModules).map(([group, modules]) => (
          <div key={group} className="sidebar-section">
            <div className="sidebar-section-title">
              {GROUP_LABELS[group as keyof typeof GROUP_LABELS]}
            </div>
            {modules.map((module) => {
              const IconComponent = module.icon;
              const active = isActive(module.route);

              return (
                <button
                  key={module.key}
                  onClick={() => handleNavigation(module.route)}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  data-module={module.key}
                >
                  <div className="sidebar-item-content">
                    <IconComponent className="sidebar-item-icon" />
                    <span className="sidebar-item-text">{module.title}</span>
                  </div>
                  <ChevronRight className="sidebar-item-arrow" />
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
