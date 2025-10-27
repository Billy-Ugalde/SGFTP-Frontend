import GenericModal from './GenericModal';
import type { Volunteer } from '../Types';
import '../Styles/VolunteerDetailsModal.css';

interface VolunteerDetailsModalProps {
  volunteer: Volunteer | null;
  show: boolean;
  onClose: () => void;
}

const VolunteerDetailsModal = ({ volunteer, show, onClose }: VolunteerDetailsModalProps) => {
  if (!volunteer) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles del Voluntario" size="xl" maxHeight>
      <div className="volunteer-details">
        <div className="volunteer-details__header">
          <h3 className="volunteer-details__name">
            {volunteer.person?.first_name} {volunteer.person?.second_name} {volunteer.person?.first_lastname} {volunteer.person?.second_lastname}
          </h3>
        </div>

        {/* Sección de Datos Personales */}
        <div className="volunteer-details__section">
          <h4 className="volunteer-details__section-title">Datos Personales</h4>
          <div className="volunteer-details__info-grid">
            <div className="volunteer-details__info-item">
              <span className="volunteer-details__label">Email</span>
              <p className="volunteer-details__text">{volunteer.person?.email || 'N/A'}</p>
            </div>
            {volunteer.person?.phones && volunteer.person.phones.length > 0 && (
              <div className="volunteer-details__info-item">
                <span className="volunteer-details__label">Teléfonos</span>
                <div className="volunteer-details__phone-list">
                  {volunteer.person.phones.map((phone, index) => (
                    <p key={index} className="volunteer-details__text">
                      {phone.number} ({phone.type === 'personal' ? 'Personal' : 'Negocio'})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie de página con fecha de registro */}
        <div className="volunteer-details__footer">
          <div className="volunteer-details__footer-info">
            {volunteer.registration_date && (
              <p className="volunteer-details__footer-text">
                Fecha de registro: {formatDate(volunteer.registration_date)}
              </p>
            )}
            {volunteer.updated_at && (
              <p className="volunteer-details__footer-text">
                Última actualización: {formatDate(volunteer.updated_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export default VolunteerDetailsModal;
