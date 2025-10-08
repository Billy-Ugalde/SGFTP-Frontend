import { useState } from 'react';
import type { Project } from '../Services/ProjectsServices';
import EditProjectButton from './EditProjectButton';
import EditProjectModal from './EditProjectModal';
import '../Styles/EditProject.css';

interface EditProjectProps {
  project: Project;
  onProjectUpdated: () => void;
}

const EditProject = ({ project, onProjectUpdated }: EditProjectProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    onProjectUpdated();
  };

  return (
    <>
      <EditProjectButton
        project={project}
        onClick={handleEditClick}
      />
      <EditProjectModal
        project={project}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default EditProject;