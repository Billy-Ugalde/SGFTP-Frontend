import React, { useState, lazy, Suspense } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import '../Styles/AddUserButton.css';

const AddUserForm = lazy(() => import('./AddUserForm'));

const AddUserButton: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button className="add-user-btn" onClick={() => setShowForm(true)}>
        Nuevo Usuario
      </button>

      <GenericModal
        show={showForm}
        onClose={() => setShowForm(false)}
        title="Crear Nuevo Usuario"
        size="xl"
        maxHeight
      >
        <Suspense fallback={null}>
          <AddUserForm onSuccess={() => setShowForm(false)} />
        </Suspense>
      </GenericModal>
    </>
  );
};

export default AddUserButton;
