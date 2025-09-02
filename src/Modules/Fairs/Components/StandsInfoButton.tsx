import { useState } from 'react';
import GenericModal from './GenericModal';
import StandsInfoModal from './StandsInfoModal';
import type { Fair } from '../Services/FairsServices';
import '../Styles/StandsInfoButton.css';

interface StandsInfoButtonProps {
  fair: Fair;
}

const StandsInfoButton: React.FC<StandsInfoButtonProps> = ({ fair }) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="stands-info-button"
      >
        <svg className="stands-info-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Info de Stands
      </button>

      <GenericModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`Stands - ${fair.name}`}
        size="xl"
        maxHeight={true}
      >
        <StandsInfoModal fair={fair} />
      </GenericModal>
    </>
  );
};

export default StandsInfoButton;