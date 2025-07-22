import GenericModal from "./GenericModal";
import EditFairForm from "./EditFairForm";
import { useState } from "react";
import type { Fair } from "../Services/FairsServices";

interface EditFairButtonProps {
  fair: Fair;
}

const EditFairButton: React.FC<EditFairButtonProps> = ({ fair }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowEditModal(true)}
        style={{
          width: '100%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 'medium',
          color: '#1d4ed8',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <svg style={{
          height: '1rem',
          width: '1rem',
          marginRight: '0.5rem'
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit
      </button>

      <GenericModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Fair: ${fair.name}`}
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