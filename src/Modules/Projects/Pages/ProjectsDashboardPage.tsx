import { useState } from 'react';
import ProjectsList from '../Components/ProjectsList';
import AddProjectButton from '../Components/AddProjectButton';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import '../Styles/ProjectsDashboardPage.css';
import type { ProjectStatus } from '../Services/ProjectsServices';

const ProjectsDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const handleStatusChange = (status: 'all' | ProjectStatus) => {
    setStatusFilter(status);
  };

  const handleActiveChange = (active: 'all' | 'active' | 'inactive') => {
    setActiveFilter(active);
  };

  return (
    <div className="projects-dashboard">
      {/* Header Section */}
      <div className="projects-dashboard__header">
        <div className="projects-dashboard__header-container">
          {/* Main Title Section */}
          <div className="projects-dashboard__title-section">
            {/* Fila superior: ícono, título y botón */}
            <div className="projects-dashboard__title-row">
              {/* Espaciador izquierdo */}
              <div style={{ flex: 1 }}></div>

              {/* Centro: ícono + título */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div className="projects-dashboard__title-icon">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: "40px", height: "40px", background: "#dbeafe", padding: "10px", borderRadius: "16px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                </div>
                <h1 className="projects-dashboard__title">Gestión de Proyectos</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <BackToDashboardButton />
              </div>
            </div>

            {/* Emoji y descripción */}
            <div className="projects-dashboard__emoji-container">
              <div className="projects-dashboard__emoji">🚀</div>
            </div>

            <p className="projects-dashboard__description">
              Administrar y gestionar todos los proyectos de la{' '}
              <span className="projects-dashboard__foundation-name">
                Fundación Tamarindo Park
              </span>
              . Crear nuevos proyectos, revisar el progreso y gestionar el estado de cada iniciativa.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="projects-dashboard__main">
        {/* Action Bar */}
        <div className="projects-dashboard__action-bar">
          <div className="projects-dashboard__action-content">
            <div className="projects-dashboard__directory-header">
              <h2 className="projects-dashboard__directory-title">
                Lista de Proyectos
              </h2>
              <p className="projects-dashboard__directory-description">
                Gestiona y supervisa todos los proyectos activos y en desarrollo
              </p>
            </div>

            <div className="projects-dashboard__controls">
              {/* Controls Row */}
              <div className="projects-dashboard__controls-row">
                {/* Status Filter */}
                <div className="projects-dashboard__filter-group">
                  <label className="projects-dashboard__filter-label">Estado del Proyecto:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value as 'all' | ProjectStatus)}
                    className="projects-dashboard__filter-select"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="planning">Planificación</option>
                    <option value="execution">Ejecución</option>
                    <option value="suspended">Suspendido</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>

                {/* Active Filter */}
                <div className="projects-dashboard__filter-group">
                  <label className="projects-dashboard__filter-label">Activo/Inactivo:</label>
                  <select
                    value={activeFilter}
                    onChange={(e) => handleActiveChange(e.target.value as 'all' | 'active' | 'inactive')}
                    className="projects-dashboard__filter-select"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>

                {/* Search Bar */}
                <div className="projects-dashboard__search-group">
                  <label className="projects-dashboard__filter-label">&nbsp;</label>
                  <div className="projects-dashboard__search-wrapper">
                    <div className="projects-dashboard__search-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar proyectos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="projects-dashboard__search-input"
                    />
                  </div>
                </div>

                {/* Add Project Button */}
                <div className="projects-dashboard__button-group">
                  <label className="projects-dashboard__filter-label">&nbsp;</label>
                  <AddProjectButton />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <ProjectsList
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          activeFilter={activeFilter}
        />
      </div>

      {/* Footer */}
      <div className="projects-dashboard__footer">
        <div className="projects-dashboard__footer-container">
          <div className="projects-dashboard__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsDashboardPage;