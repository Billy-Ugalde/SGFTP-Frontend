import React, { useState } from 'react';
import type { User } from '../Services/UserService';
import EditUserForm from './EditUserForm';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import '../Styles/EditUserButton.css';

interface EditUserButtonProps {
  user: User;
}

const EditUserButton: React.FC<EditUserButtonProps> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button className="edit-user-btn" onClick={() => setShowForm(true)}>
        <svg className="edit-user-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Editar
      </button>

      <GenericModal
        show={showForm}
        onClose={() => setShowForm(false)}
        title="Editar Usuario"
        size="lg"
        maxHeight
      >
        <EditUserForm user={user} onSuccess={() => setShowForm(false)} />
      </GenericModal>
    </>
  );
};

export default EditUserButton;
