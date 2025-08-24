import React from 'react';
import '../../styles/dashboard-principal.css';

const modules = [
  {
    title: 'Ferias',
    icon: '🎪',
    description: 'Gestión del módulo ferias.',
    className: 'ferias',
    route: '/admin/ferias',
  },
  {
    title: 'Proyectos',
    icon: '📁',
    description: 'Administra el portafolio de proyectos activos, seguimiento de progreso y recursos asignados.',
    className: 'proyectos',
    route: '/admin/proyectos',
  },
  {
    title: 'Informativo',
    icon: '📰',
    description: 'Centro de noticias y comunicaciones. Publica actualizaciones y mantén informada a la comunidad.',
    className: 'informativo',
    route: '/admin/informativo',
  },
  {
    title: 'Donadores',
    icon: '💰',
    description: 'Gestiona la base de datos de donadores, historial de contribuciones y relaciones.',
    className: 'donadores',
    route: '/admin/donadores',
  },
  {
    title: 'Emprendedores',
    icon: '🚀',
    description: 'Directorio de emprendedores, seguimiento de startups y programas de mentoría.',
    className: 'emprendedores',
    route: '/admin/emprendedores',
  },
  {
    title: 'Roles',
    icon: '👥',
    description: 'Administra permisos de usuario, roles del sistema y control de acceso a funcionalidades.',
    className: 'roles',
    route: '/admin/roles',
  },
];

const DashboardPrincipal: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleNavigation = (route: string) => {
    window.location.href = route;
  };

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-container">
        <div className="header">
          <h1>Panel de Administración</h1>
          <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        <div className="cards-grid">
          {modules.map((module, index) => (
            <div
              key={index}
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
