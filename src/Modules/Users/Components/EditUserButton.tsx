import React, { useState } from 'react';
import type { User } from '../Services/UserService';
import EditUserForm from './EditUserForm';
import '../styles/EditUserButton.css';

interface EditUserButtonProps {
  user: User;
}

const EditUserButton: React.FC<EditUserButtonProps> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <>
      <button 
        className="edit-user-btn"
        onClick={handleOpenForm}
      >
        <svg className="edit-user-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Editar
      </button>
      
      {showForm && (
        <div className="edit-user-modal">
          <div className="edit-user-modal__backdrop" onClick={handleCloseForm} />
          <div className="edit-user-modal__content">
            <div className="edit-user-modal__header">
              <h2 className="edit-user-modal__title">Editar Usuario</h2>
              <button 
                className="edit-user-modal__close"
                onClick={handleCloseForm}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EditUserForm user={user} onSuccess={handleCloseForm} />
          </div>
        </div>
      )}
    </>
  );
};

export default EditUserButton;