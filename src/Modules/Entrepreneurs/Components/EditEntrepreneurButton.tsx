import type { Entrepreneur } from "../Types";
import '../Styles/EditEntrepreneurButton.css';

interface EditEntrepreneurButtonProps {
  entrepreneur: Entrepreneur;
  onClick: () => void; 
}

const EditEntrepreneurButton: React.FC<EditEntrepreneurButtonProps> = ({ onClick }) => { 

  return (
    <>
      <button
        onClick={onClick} 
        className="edit-entrepreneur-button"
      >
        <svg className="edit-entrepreneur-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Editar
      </button>
    </>
  );
};

export default EditEntrepreneurButton;