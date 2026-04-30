import React from 'react';
import '../Styles/AddDonorButton.css';

interface AddDonorButtonProps {
  onClick: () => void;
}

const AddDonorButton: React.FC<AddDonorButtonProps> = ({ onClick }) => {
  return (
    <button className="add-donor-button" onClick={onClick}>
      Nueva Donación
    </button>
  );
};

export default AddDonorButton;

