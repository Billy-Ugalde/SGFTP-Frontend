import React from 'react';
import '../Styles/AddDonorButton.css';

interface AddDonorButtonProps {
  onClick: () => void;
}

const AddDonorButton: React.FC<AddDonorButtonProps> = ({ onClick }) => {
  return (
    <button className="add-donor-button" onClick={onClick}>
      <svg className="add-donor-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Nuevo Donador
    </button>
  );
};

export default AddDonorButton;

