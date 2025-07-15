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
      {/* Edit Button */}
      <button
        onClick={() => setShowEditModal(true)}
        className="px-3 py-1 text-sm font-medium text-emerald-600 
                  border border-emerald-600 rounded hover:bg-emerald-50
                  focus:ring-2 focus:ring-emerald-200 transition-colors duration-200"
        aria-label={`Edit fair: ${fair.name}`}
      >
        Edit
      </button>
      
      {/* Modal */}
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
          onCancel={() => setShowEditModal(false)}
        />
      </GenericModal>
    </>
  );
};

export default EditFairButton;