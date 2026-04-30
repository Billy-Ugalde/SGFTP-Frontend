import GenericModal from "./GenericModal";
import AddVolunteerForm from "./AddVolunteerForm";
import { useState } from "react";
import '../Styles/AddVolunteerButton.css';

const AddVolunteerButton = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        className="add-volunteer-button"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Voluntario
      </button>

      <GenericModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Formulario de Voluntario"
        size="xl"
        maxHeight={true}
      >
        <AddVolunteerForm onSuccess={() => setShowAddModal(false)} />
      </GenericModal>
    </>
  );
};

export default AddVolunteerButton;
