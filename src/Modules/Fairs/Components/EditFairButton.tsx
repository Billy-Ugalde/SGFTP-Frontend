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
        className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
      >
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
