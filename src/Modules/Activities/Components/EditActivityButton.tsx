import React from 'react';
import { Edit2 } from 'lucide-react';
import '../Styles/EditActivityButton.css';

interface EditActivityButtonProps {
  onClick: () => void;
}

const EditActivityButton: React.FC<EditActivityButtonProps> = ({ onClick }) => {
  return (
    <button className="btn-action btn-edit" onClick={onClick}>
      <Edit2 size={16} />
      Editar
    </button>
  );
};

export default EditActivityButton;