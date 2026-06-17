import GenericModal from "./GenericModal";
import { useState, lazy, Suspense } from "react";
import '../Styles/AddVolunteerButton.css';

const AddVolunteerForm = lazy(() => import('./AddVolunteerForm'));

const AddVolunteerButton = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        className="add-volunteer-button"
      >
        Nuevo Voluntario
      </button>

      <GenericModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Formulario de Voluntario"
        size="xl"
        maxHeight={true}
      >
        <Suspense fallback={null}>
          <AddVolunteerForm onSuccess={() => setShowAddModal(false)} />
        </Suspense>
      </GenericModal>
    </>
  );
};

export default AddVolunteerButton;
