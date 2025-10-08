import GenericModal from "../../Entrepreneurs/Components/GenericModal";
import type { Project } from '../Services/ProjectsServices';
import EditProjectForm from './EditProjectForm';

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProjectModal = ({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) => {
  return (
    <GenericModal
      show={isOpen}
      onClose={onClose}
      title="Editar Proyecto"
      size="xl"
      maxHeight={true}
    >
      <EditProjectForm
        project={project}
        onSuccess={onSuccess}
      />
    </GenericModal>
  );
};

export default EditProjectModal;