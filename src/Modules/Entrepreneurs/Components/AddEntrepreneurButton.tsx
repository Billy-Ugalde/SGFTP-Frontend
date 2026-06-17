import { lazy, Suspense, useState } from "react";
import '../Styles/AddEntrepreneurButton.css';

const GenericModal = lazy(() => import("./GenericModal"));
const AddEntrepreneurForm = lazy(() => import("./AddEntrepreneurForm"));

const AddEntrepreneurButton = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAddModal(true)}
        className="add-entrepreneur-button"
      >
        Nuevo Emprendedor
      </button>

      {showAddModal && (
        <Suspense fallback={null}>
          <GenericModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Formulario de Emprendedor"
            size="xl"
            maxHeight={true}
          >
            <AddEntrepreneurForm onSuccess={() => setShowAddModal(false)} />
          </GenericModal>
        </Suspense>
      )}
    </>
  );
};

export default AddEntrepreneurButton;