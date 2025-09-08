import GenericModal from "./GenericModal";
import EnrollmentManagementModal from "./EnrollmentManagementModal";
import { useState } from "react";
import { useFairEnrollments } from '../Services/FairsServices';
import '../Styles/EnrollmentManagementButton.css';

const EnrollmentManagementButton = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: enrollments } = useFairEnrollments();
  
  const pendingCount = enrollments?.filter(enrollment => enrollment.status === 'pending').length || 0;
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="enrollment-management-button"
      >
        <svg className="enrollment-management-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Administrar Solicitudes
        {pendingCount > 0 && (
          <span className="enrollment-management-button__badge">
            {pendingCount}
          </span>
        )}
      </button>

      <GenericModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Gestión de Solicitudes de Ferias"
        size="xl"
        maxHeight={true}
      >
        <EnrollmentManagementModal onClose={() => setShowModal(false)} />
      </GenericModal>
    </>
  );
};

export default EnrollmentManagementButton;