import GenericModal from "./GenericModal";
import AddFairForm from "./AddFairForm";
import { useState } from "react";
import '../Styles/AddFairButton.css';

const AddFairButton = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        className="add-fair-button"
      >
        {/* <svg className="add-fair-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg> */}
        Nueva Feria
      </button>

      <GenericModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Formulario de Feria"
        size="xl"
        maxHeight={true}
        closeOnBackdrop={false}
      >
        <AddFairForm onSuccess={() => setShowAddModal(false)} />
      </GenericModal>
    </>
  );
};

export default AddFairButton;