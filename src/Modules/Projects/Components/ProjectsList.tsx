import { useProjects, useToggleProjectActive } from '../Services/ProjectsServices';
import ProjectsTable from './ProjectsTable';
import type { Project, ProjectStatus } from '../Services/ProjectsServices';
import '../Styles/ProjectsList.css';
import { useState } from 'react';
import ProjectDetailsModal from './ProjectsDetailsModal';

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
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.Aim.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.Status === statusFilter;

    const matchesActive = activeFilter === 'all' || 
     (activeFilter === 'active' && project.Active) ||
     (activeFilter === 'inactive' && !project.Active);

    return matchesSearch && matchesStatus && matchesActive;
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleEdit = (project: Project) => {
    // TODO: Implement edit functionality
    console.log('Edit:', project);
  };

  const handleToggleActive = async (project: Project) => {
    if (!project.Id_project) {
      showMessage('error', 'Error: ID del proyecto no disponible');
      return;
    }

    try {
      await toggleProjectActive.mutateAsync({
        id_project: project.Id_project,
        active: !project.Active
      });
      
      showMessage('success', `Proyecto ${!project.Active ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar estado del proyecto:', error);
      showMessage('error', 
        error?.response?.data?.message || 
        `Error al ${!project.Active ? 'activar' : 'desactivar'} el proyecto`
      );
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
      {/* Mensaje de acción */}
      {actionMessage && (
        <div className={`projects-list__message projects-list__message--${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

      <div className="projects-list__header">
        {/* <div className="projects-list__count">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'} encontrado{filteredProjects.length === 1 ? '' : 's'}
        </div> */}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="projects-list__empty">
          <div className="projects-list__empty-icon">📋</div>
          <h3>No se encontraron proyectos</h3>
          <p>No hay proyectos que coincidan con los filtros aplicados.</p>
        </div>
      ) : (
        <ProjectsTable
          data={filteredProjects}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
        />
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