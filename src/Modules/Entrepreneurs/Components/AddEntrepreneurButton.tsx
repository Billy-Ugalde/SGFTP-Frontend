import GenericModal from "./GenericModal";
import AddEntrepreneurForm from "./AddEntrepreneurForm";
import { useState } from "react";
import '../Styles/AddEntrepreneurButton.css';

const AddEntrepreneurButton = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        className="add-entrepreneur-button"
      >
        <svg className="add-entrepreneur-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Emprendedor
      </button>

      <GenericModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Registrar Nuevo Emprendedor"
        size="xl"
        maxHeight={true}
      >
        <AddEntrepreneurForm onSuccess={() => setShowAddModal(false)} />
      </GenericModal>
    </>
  );
};

export default AddEntrepreneurButton;