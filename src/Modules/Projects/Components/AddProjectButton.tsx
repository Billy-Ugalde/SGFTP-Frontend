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
        Nuevo Proyecto
      </button>

      {showAddModal && (
        <GenericModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Crear Nuevo Proyecto"
          size="xl"
          maxHeight={true}
          closeOnBackdrop={false}
        >
          <AddProjectForm onSuccess={() => setShowAddModal(false)} />
        </GenericModal>
      )}
    </>
  );
};

export default AddProjectButton;