import React from 'react';
import '../Styles/AddDonorButton.css';

interface AddDonorButtonProps {
  onClick: () => void;
  label?: string;
}

const AddDonorButton: React.FC<AddDonorButtonProps> = ({ onClick, label = 'Nueva Donación' }) => {
  return (
    <button className="add-donor-button" onClick={onClick}>
      {label}
    </button>
  );
};

export default AddDonorButton;

