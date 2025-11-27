import { useState } from 'react';
import { FolderKanban } from 'lucide-react';
import ProjectsList from '../Components/ProjectsList';
import AddProjectButton from '../Components/AddProjectButton';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import StatusFilter from '../../Shared/components/StatusFilter';
import WorkStatusFilter from '../Components/WorkStatusFilter';
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
                <div style={{ backgroundColor: "#4CAF8C", color: "white", width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "16px" }}>
                  <FolderKanban size={32} strokeWidth={2} />
                </div>
                <h1 className="projects-dashboard__title">Gestión de Proyectos</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <BackToDashboardButton />
              </div>
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
                  <WorkStatusFilter
                    statusFilter={statusFilter}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                {/* Active Filter */}
                <div className="projects-dashboard__filter-group">
                  <label className="projects-dashboard__filter-label">Activo/Inactivo:</label>
                  <StatusFilter
                    statusFilter={activeFilter}
                    onStatusChange={handleActiveChange}
                  />
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