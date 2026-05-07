import React from 'react';
import '../Styles/AddActivityButton.css';

interface AddActivityButtonProps {
  onClick: () => void;
}

const AddActivityButton: React.FC<AddActivityButtonProps> = ({ onClick }) => {
  return (
    <button className="add-activity-button" onClick={onClick}>
      Nueva Actividad
    </button>
  );
};

export default AddActivityButton;