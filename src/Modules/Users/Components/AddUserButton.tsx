import React, { useState } from 'react';
import AddUserForm from './AddUserForm';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import '../Styles/AddUserButton.css';

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
        <AddUserForm onSuccess={() => setShowForm(false)} />
      </GenericModal>
    </>
  );
};

export default AddUserButton;
