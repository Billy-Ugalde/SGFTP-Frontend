import { useProjects, useToggleProjectActive } from '../Services/ProjectsServices';
import ProjectsTable from './ProjectsTable';
import type { Project, ProjectStatus } from '../Services/ProjectsServices';
import '../Styles/ProjectsList.css';
import { useState, useMemo } from 'react';
import ProjectDetailsModal from './ProjectsDetailsModal';
import ConfirmationModal from '../../Fairs/Components/ConfirmationModal';

interface ProjectsListProps {
  searchTerm: string;
  statusFilter: 'all' | ProjectStatus;
  activeFilter: 'all' | 'active' | 'inactive';
}

const ProjectsList = ({ searchTerm, statusFilter, activeFilter }: ProjectsListProps) => {
  const { data: projects = [], isLoading, error } = useProjects();
  const toggleProjectActive = useToggleProjectActive();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [projectToToggle, setProjectToToggle] = useState<Project | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.Aim.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || project.Status === statusFilter;

      const matchesActive = activeFilter === 'all' || 
        (activeFilter === 'active' && project.Active) ||
        (activeFilter === 'inactive' && !project.Active);

      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [projects, searchTerm, statusFilter, activeFilter]);


  const stats = useMemo(() => {
    return {
      total: filteredProjects.length,
      active: filteredProjects.filter(project => project.Active).length,
      inactive: filteredProjects.filter(project => !project.Active).length,
    };
  }, [filteredProjects]);


  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);


  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleEdit = (project: Project) => {
    // TODO: Implement edit functionality
    console.log('Edit:', project);
  };

  // Manejar clic en el botón de activar/inactivar
  const handleToggleActiveClick = (project: Project) => {
    setProjectToToggle(project);
    setShowConfirmationModal(true);
  };

  // Confirmar la activación/inactivación
  const confirmToggleActive = async () => {
    if (!projectToToggle || !projectToToggle.Id_project) {
      setShowConfirmationModal(false);
      return;
    }

    setIsProcessing(true);

    try {
      await toggleProjectActive.mutateAsync({
        id_project: projectToToggle.Id_project,
        active: !projectToToggle.Active
      });
      
      setShowConfirmationModal(false);
      setProjectToToggle(null);
    } catch (error: any) {
      console.error('Error al cambiar estado del proyecto:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancelar la acción
  const cancelToggleActive = () => {
    setShowConfirmationModal(false);
    setProjectToToggle(null);
  };

  // Construir mensaje de confirmación
  const buildConfirmationMessage = (project: Project) => {
    const action = project.Active ? 'inactivar' : 'activar';
    const projectName = project.Name;

    if (project.Active) {
      return `Se ${action}á el proyecto "${projectName}". No podrá ser visible en la sección informativa del sistema.`;
    } else {
      return `Se ${action}á el proyecto "${projectName}". Podrá ser visible en la sección informativa del sistema.`;
    }
  };

  if (isLoading) {
    return (
      <div className="projects-list__loading">
        <div className="projects-list__loading-spinner"></div>
        <p>Cargando proyectos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-list__error">
        <div className="projects-list__error-icon">⚠️</div>
        <h3>Error al cargar los proyectos</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="projects-list">
      {/* Modal de confirmación */}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelToggleActive}
        onConfirm={confirmToggleActive}
        title={projectToToggle?.Active ? "¿Inactivar proyecto?" : "¿Activar proyecto?"}
        message={projectToToggle ? buildConfirmationMessage(projectToToggle) : ''}
        confirmText={projectToToggle?.Active ? "Sí, inactivar" : "Sí, activar"}
        cancelText="Cancelar"
        type={projectToToggle?.Active ? "warning" : "info"}
        isLoading={isProcessing}
      />

      {/* Stats */}
      <div className="projects-list__stats">
        <div className="projects-list__stat-card projects-list__stat-card--total">
          <div className="projects-list__stat-content">
            <div className="projects-list__stat-icon projects-list__stat-icon--total">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <p className="projects-list__stat-label projects-list__stat-label--total">Total Proyectos</p>
              <p className="projects-list__stat-value projects-list__stat-value--total">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="projects-list__stat-card projects-list__stat-card--active">
          <div className="projects-list__stat-content">
            <div className="projects-list__stat-icon projects-list__stat-icon--active">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="projects-list__stat-label projects-list__stat-label--active">Activos</p>
              <p className="projects-list__stat-value projects-list__stat-value--active">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="projects-list__stat-card projects-list__stat-card--inactive">
          <div className="projects-list__stat-content">
            <div className="projects-list__stat-icon projects-list__stat-icon--inactive">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="projects-list__stat-label projects-list__stat-label--inactive">Inactivos</p>
              <p className="projects-list__stat-value projects-list__stat-value--inactive">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination info */}
      {totalPages > 1 && (
        <div className="projects-list__pagination-info">
          <p className="projects-list__results-text">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProjects.length)} de {filteredProjects.length} proyectos
          </p>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="projects-list__empty">
          <div className="projects-list__empty-icon">📋</div>
          <h3>No se encontraron proyectos</h3>
          <p>No hay proyectos que coincidan con los filtros aplicados.</p>
        </div>
      ) : (
        <>
          <ProjectsTable
            data={currentProjects}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onToggleActive={handleToggleActiveClick}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="projects-list__pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="projects-list__pagination-btn projects-list__pagination-btn--prev"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              <div className="projects-list__pagination-numbers">
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="projects-list__pagination-number"
                    >
                      1
                    </button>
                    <span className="projects-list__pagination-ellipsis">...</span>
                  </>
                )}

                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`projects-list__pagination-number ${currentPage === page ? 'projects-list__pagination-number--active' : ''}`}
                  >
                    {page}
                  </button>
                ))}

                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    <span className="projects-list__pagination-ellipsis">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="projects-list__pagination-number"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="projects-list__pagination-btn projects-list__pagination-btn--next"
              >
                Siguiente
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      <ProjectDetailsModal
        project={selectedProject}
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};

export default ProjectsList;