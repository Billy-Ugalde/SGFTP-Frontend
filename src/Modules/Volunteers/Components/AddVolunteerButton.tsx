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
        Formulario Voluntario
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
