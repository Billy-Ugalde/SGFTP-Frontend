import React, { useState } from 'react';
import AddUserForm from './AddUserForm';
import '../styles/AddUserButton.css';

const AddUserButton: React.FC = () => {
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
        className="add-user-btn"
        onClick={handleOpenForm}
      >
        <svg className="add-user-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nuevo Usuario
      </button>
      
      {showForm && (
        <div className="add-user-modal">
          <div className="add-user-modal__backdrop" onClick={handleCloseForm} />
          <div className="add-user-modal__content">
            <div className="add-user-modal__header">
              <h2 className="add-user-modal__title">Crear Nuevo Usuario</h2>
              <button 
                className="add-user-modal__close"
                onClick={handleCloseForm}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddUserForm onSuccess={handleCloseForm} />
          </div>
        </div>
      )}
    </>
  );
};

export default AddUserButton;