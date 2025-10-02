import React from 'react';
import { Plus } from 'lucide-react';
import '../Styles/AddActivityButton.css';

interface AddActivityButtonProps {
  onClick: () => void;
}

const AddActivityButton: React.FC<AddActivityButtonProps> = ({ onClick }) => {
  return (
    <button className="btn-primary" onClick={onClick}>
      <Plus size={20} />
      Nueva Actividad
    </button>
  );
};

export default AddActivityButton;