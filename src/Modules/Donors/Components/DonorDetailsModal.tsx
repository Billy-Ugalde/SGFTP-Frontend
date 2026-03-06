import React from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import { getDonorFullName, humanizeEnum, type Donor } from '../Services/DonorService';
import '../Styles/DonorDetailsModal.css';

interface DonorDetailsModalProps {
  donor: Donor | null;
  show: boolean;
  onClose: () => void;
}

const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({ donor, show, onClose }) => {
  if (!show || !donor) return null;

  const readStatusClass = donor.status ? `donor-details__badge--${String(donor.status).toLowerCase()}` : '';

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles del Donador" size="lg" maxHeight>
      <div>
        <div className="donor-details__header">
          <h3 className="donor-details__name">{getDonorFullName(donor)}</h3>
          <div className="donor-details__badges">
            <span className={`donor-details__badge ${donor.archived ? 'donor-details__badge--archived' : 'donor-details__badge--active'}`}>
              {donor.archived ? 'Archivado' : 'Activo'}
            </span>
            <span className={`donor-details__badge ${readStatusClass}`}>
              {humanizeEnum(donor.status)}
            </span>
          </div>
        </div>

        <div className="donor-details__grid">
          <div className="donor-details__field">
            <span className="donor-details__label">Email</span>
            <p className="donor-details__value">{donor.Email || '—'}</p>
          </div>
          <div className="donor-details__field">
            <span className="donor-details__label">Teléfono</span>
            <p className="donor-details__value">{donor.Phone || '—'}</p>
          </div>
          <div className="donor-details__field">
            <span className="donor-details__label">Tipo de donación</span>
            <p className="donor-details__value">{humanizeEnum(donor.Donation_type)}</p>
          </div>
          <div className="donor-details__field">
            <span className="donor-details__label">Interés</span>
            <p className="donor-details__value">{humanizeEnum(donor.Interest)}</p>
          </div>
          <div className="donor-details__field donor-details__field--full">
            <span className="donor-details__label">Detalles de donación</span>
            <p className="donor-details__value">{donor.Donation_details || '—'}</p>
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export default DonorDetailsModal;

