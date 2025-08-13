import GenericModal from "./GenericModal";
import EditFairForm from "./EditFairForm";
import { useState } from "react";
import type { Fair } from "../Services/FairsServices";
import '../Styles/EditFairButton.css';

interface EditFairButtonProps {
  fair: Fair;
}

const EditFairButton: React.FC<EditFairButtonProps> = ({ fair }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowEditModal(true)}
        className="edit-fair-button"
      >
        <svg className="edit-fair-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Editar
      </button>

      <GenericModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar Feria: ${fair.name}`}
        size="xl"
        maxHeight={true}
      >
        <EditFairForm
          fair={fair}
          onSuccess={() => setShowEditModal(false)}
        />
      </GenericModal>
    </>
  );
};

export default EditFairButton;