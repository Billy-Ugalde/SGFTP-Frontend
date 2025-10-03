import GenericModal from "../../Entrepreneurs/Components/GenericModal";
import AddProjectForm from "./AddProjectForm";
import { useState } from "react";
import '../Styles/AddProjectButton.css';

const AddProjectButton = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        className="add-project-button"
      >
        <svg className="add-project-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Proyecto
      </button>

      <GenericModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Crear Nuevo Proyecto"
        size="xl"
        maxHeight={true}
      >
        <AddProjectForm onSuccess={() => setShowAddModal(false)} />
      </GenericModal>
    </>
  );
};

export default AddProjectButton;