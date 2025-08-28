import GenericModal from "./GenericModal";
import EditEntrepreneurForm from "./EditEntrepreneurForm";
import { useState } from "react";
import type { Entrepreneur } from "../Services/EntrepreneursServices";
import '../Styles/EditEntrepreneurButton.css';

interface EditEntrepreneurButtonProps {
  entrepreneur: Entrepreneur;
}

const EditEntrepreneurButton: React.FC<EditEntrepreneurButtonProps> = ({ entrepreneur }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowEditModal(true)}
        className="edit-entrepreneur-button"
      >
        <svg className="edit-entrepreneur-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Editar
      </button>

      <GenericModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar: ${entrepreneur.person?.first_name} ${entrepreneur.person?.first_lastname}`}
        size="xl"
        maxHeight={true}
      >
        <EditEntrepreneurForm
          entrepreneur={entrepreneur}
          onSuccess={() => setShowEditModal(false)}
        />
      </GenericModal>
    </>
  );
};

export default EditEntrepreneurButton;