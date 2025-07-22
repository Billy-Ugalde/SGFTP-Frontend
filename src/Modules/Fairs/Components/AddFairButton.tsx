import GenericModal from "./GenericModal";
import AddFairForm from "./AddFairForm";
import { useState } from "react";

const AddFairButton = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(to right, #059669, #047857)',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: '600',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <svg style={{
          height: '1.25rem',
          width: '1.25rem',
          marginRight: '0.5rem'
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Fair
      </button>

      <GenericModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Fair"
        size="xl"
        maxHeight={true}
      >
        <AddFairForm onSuccess={() => setShowAddModal(false)} />
      </GenericModal>
    </>
  );
};

export default AddFairButton;