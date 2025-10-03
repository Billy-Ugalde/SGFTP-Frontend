import React from 'react';
import '../Styles/AddActivityButton.css';

interface AddActivityButtonProps {
  onClick: () => void;
}

const AddActivityButton: React.FC<AddActivityButtonProps> = ({ onClick }) => {
  return (
    <button className="add-activity-button" onClick={onClick}>
      <svg className="add-activity-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Nueva Actividad
    </button>
  );
};

export default AddActivityButton;