import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/context/AuthContext';
import { getAvailableModules } from '../../Shared/utils/rolePermissions';
import type { ModuleKey } from '../../Shared/utils/rolePermissions';
import {
  ShoppingBag,
  BookType,
  Banknote,
  Briefcase,
  FolderKanban,
  Users,
  CalendarDays,
  HandHelping,
  FileText,
  Mail,
  Home,
  LayoutGrid,
  ChevronsLeft,
  ChevronsRight,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { recordModuleVisit } from '../utils/recentModules';
import '../styles/sidebar.css';

interface ModuleConfig {
  title: string;
  icon: LucideIcon;
  route: string;
  group: 'gestion' | 'comunidad' | 'publicaciones';
  colorClass: string;
}

const ALL_MODULES: Record<ModuleKey, ModuleConfig> = {
  ferias:        { title: 'Ferias',        icon: ShoppingBag,  route: '/admin/ferias',        group: 'gestion',       colorClass: 'c-orange' },
  emprendedores: { title: 'Emprendedores', icon: Briefcase,    route: '/admin/emprendedores', group: 'comunidad',     colorClass: 'c-blue'   },
  proyectos:     { title: 'Proyectos',     icon: FolderKanban, route: '/admin/proyectos',     group: 'gestion',       colorClass: 'c-indigo' },
  actividades:   { title: 'Actividades',   icon: CalendarDays, route: '/admin/actividades',   group: 'gestion',       colorClass: 'c-green'  },
  usuarios:      { title: 'Usuarios',      icon: Users,        route: '/admin/usuarios',      group: 'comunidad',     colorClass: 'c-teal'   },
  donadores:     { title: 'Donadores',     icon: Banknote,     route: '/admin/donadores',     group: 'comunidad',     colorClass: 'c-pink'   },
  voluntarios:   { title: 'Voluntarios',   icon: HandHelping,  route: '/admin/voluntarios',   group: 'comunidad',     colorClass: 'c-yellow' },
  noticias:      { title: 'Noticias',      icon: FileText,     route: '/admin/noticias',      group: 'publicaciones', colorClass: 'c-gray'   },
  informativo:   { title: 'Informativo',   icon: BookType,     route: '/admin/informativo',   group: 'publicaciones', colorClass: 'c-purple' },
  newsletters:   { title: 'Newsletters',   icon: Mail,         route: '/admin/newsletters',   group: 'publicaciones', colorClass: 'c-red'    },
};

const GROUP_ORDER = ['gestion', 'comunidad', 'publicaciones'] as const;
const GROUP_LABELS = {
  gestion:       'Gestión',
  comunidad:     'Comunidad',
  publicaciones: 'Publicaciones',
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isPinned, setIsPinned] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isExpanded = isPinned || isHovered;

  if (!user) return null;

  const availableModules = getAvailableModules(user.roles);
  const accessibleModules = availableModules.map((key) => ({
    key,
    ...ALL_MODULES[key],
  }));

  const groupedModules = GROUP_ORDER.reduce((acc, group) => {
    const mods = accessibleModules.filter((m) => m.group === group);
    if (mods.length > 0) acc[group] = mods;
    return acc;
  }, {} as Record<string, typeof accessibleModules>);

  const isActive = (route: string) => {
    if (route === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return (
      location.pathname.startsWith(route) &&
      location.pathname !== '/admin' &&
      location.pathname !== '/admin/'
    );
  };

  return (
    <aside
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo header */}
      <div className="sb-top">
        <div className="sb-logo">
          <LayoutGrid className="sb-logo-icon" />
        </div>
        <span className="sb-logo-label">Admin Panel</span>
      </div>

      {/* Scroll area */}
      <div className="sb-scroll">

        {/* Principal */}
        <div className="sb-group">
          <div className="sb-group-label">Principal</div>
          <div className="nav-item">
            <button
              className={`nav-btn ${location.pathname === '/admin' || location.pathname === '/admin/' ? 'on' : ''}`}
              onClick={() => navigate('/admin')}
            >
              <div className="nav-icon c-blue">
                <Home size={15} />
              </div>
              <span className="nav-label">Inicio</span>
            </button>
          </div>
        </div>

        {/* Dynamic groups */}
        {GROUP_ORDER.filter((g) => groupedModules[g]).map((group) => (
          <React.Fragment key={group}>
            <div className="sb-div" />
            <div className="sb-group">
              <div className="sb-group-label">{GROUP_LABELS[group]}</div>
              {group === 'gestion' && (
                <div className="nav-item">
                  <div className="nav-btn">
                    <div className="nav-icon c-teal">
                      <Scale size={15} />
                    </div>
                    <span className="nav-label">Auditoría</span>
                  </div>
                </div>
              )}
              {groupedModules[group].map((module) => {
                const IconComponent = module.icon;
                return (
                  <div key={module.key} className="nav-item">
                    <button
                      className={`nav-btn${isActive(module.route) ? ' on' : ''}`}
                      onClick={() => { recordModuleVisit(user.id, module.key); navigate(module.route); }}
                    >
                      <div className={`nav-icon ${module.colorClass}`}>
                        <IconComponent size={15} />
                      </div>
                      <span className="nav-label">{module.title}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}

      </div>

      {/* Toggle pin button */}
      <div className="sb-footer">
        <button className="sb-toggle-btn" onClick={() => setIsPinned((p) => !p)}>
          <div className="sb-toggle-icon">
            {isPinned
              ? <ChevronsLeft size={15} />
              : <ChevronsRight size={15} />}
          </div>
          <span className="sb-toggle-label">
            {isPinned ? 'Colapsar' : 'Fijar panel'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
