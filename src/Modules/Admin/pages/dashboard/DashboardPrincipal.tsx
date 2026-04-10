import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/context/AuthContext';
import { getAvailableModules } from '../../../Shared/utils/rolePermissions';
import type { ModuleKey } from '../../../Shared/utils/rolePermissions';
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
  Phone,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { getRecentModules, getRelativeTime, recordModuleVisit } from '../../utils/recentModules';
import '../../styles/dashboard-principal.css';

interface ModuleConfig {
  title: string;
  icon: LucideIcon;
  colorClass: string;
  route: string;
}


const ALL_MODULES: Record<ModuleKey, ModuleConfig> = {
  ferias:        { title: 'Ferias',         icon: ShoppingBag,  colorClass: 'c-orange', route: '/admin/ferias'        },
  informativo:   { title: 'Informativo',    icon: BookType,     colorClass: 'c-purple', route: '/admin/informativo'   },
  donadores:     { title: 'Donadores',      icon: Banknote,     colorClass: 'c-pink',   route: '/admin/donadores'     },
  emprendedores: { title: 'Emprendedores',  icon: Briefcase,    colorClass: 'c-blue',   route: '/admin/emprendedores' },
  proyectos:     { title: 'Proyectos',      icon: FolderKanban, colorClass: 'c-indigo', route: '/admin/proyectos'     },
  usuarios:      { title: 'Usuarios',       icon: Users,        colorClass: 'c-teal',   route: '/admin/usuarios'      },
  actividades:   { title: 'Actividades',    icon: CalendarDays, colorClass: 'c-green',  route: '/admin/actividades'   },
  voluntarios:   { title: 'Voluntarios',    icon: HandHelping,  colorClass: 'c-yellow', route: '/admin/voluntarios'   },
  noticias:      { title: 'Noticias',       icon: FileText,     colorClass: 'c-gray',   route: '/admin/noticias'      },
  newsletters:   { title: 'Newsletters',    icon: Mail,         colorClass: 'c-red',    route: '/admin/newsletters'   },
  auditoria:     { title: 'Auditoría',      icon: Scale,        colorClass: 'c-teal',   route: '/admin/auditoria'     },
};

const ROLE_LABELS: Record<string, string> = {
  super_admin:   'Super Admin',
  general_admin: 'Admin General',
  fair_admin:    'Admin de Ferias',
  content_admin: 'Admin de Contenido',
  auditor:       'Auditor',
};

const DashboardPrincipal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!user) return null;

  const initials = `${user.person.firstName[0]}${user.person.firstLastname[0]}`.toUpperCase();
  const fullName = `${user.person.firstName} ${user.person.firstLastname}`;
  const primaryRole = user.roles
    .map((r) => ROLE_LABELS[r])
    .filter(Boolean)[0] ?? user.roles[0];

  const availableModules = getAvailableModules(user.roles);
  const currentDate = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentTime = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const getGreeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="dashboard-page">
      {/* Greeting */}
      <div className="home-wrap">
        <div className="home-wrap-inner">
          <div>
            <div className="home-greeting">{getGreeting()}</div>
            <div className="home-sub">Panel de Administración</div>
          </div>
          <div className="home-clock">
            <div className="home-clock-time">{currentTime}</div>
            <div className="home-clock-date">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="recent-section">

        {/* Recently visited */}
        <div className="sec-label">Visitados recientemente</div>
        {(() => {
          const recent = getRecentModules(user.id).filter((e) =>
            ALL_MODULES[e.key as ModuleKey] && availableModules.includes(e.key as ModuleKey)
          );
          if (recent.length === 0) {
            return (
              <p style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '32px' }}>
                Aún no has visitado ningún módulo.
              </p>
            );
          }
          return (
            <div className="recent-grid">
              {recent.map((entry) => {
                const module = ALL_MODULES[entry.key as ModuleKey];
                const IconComponent = module.icon;
                return (
                  <div
                    key={entry.key}
                    className="rec-card"
                    onClick={() => { recordModuleVisit(user.id, entry.key); navigate(module.route); }}
                  >
                    <div className={`rec-icon ${module.colorClass}`}>
                      <IconComponent size={22} strokeWidth={1.8} />
                    </div>
                    <div className="rec-name">{module.title}</div>
                    <div className="rec-meta">{getRelativeTime(entry.visitedAt)}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}


      </div>

      {/* User profile card */}
      <div className="profile-section">
        <div className="sec-label">Mi perfil</div>
        <div className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <div className="profile-name">{fullName}</div>
            <div className="profile-role">{primaryRole}</div>
            <div className="profile-details">
              <div className="profile-detail-row">
                <Mail size={13} />
                <span>{user.person.email}</span>
              </div>
              <div className="profile-detail-row">
                <Phone size={13} />
                <span>{user.person.phonePrimary}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="profile-btn" onClick={() => navigate('/admin/perfil')}>
          Ver perfil
        </button>
      </div>

      {/* Gradient text */}
      <div className="gradient-text-section">
        <div className="gradient-text">Fundación Tamarindo Park</div>
      </div>
    </div>
  );
};

export default DashboardPrincipal;
