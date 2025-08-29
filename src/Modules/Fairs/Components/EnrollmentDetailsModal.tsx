import GenericModal from './GenericModal';
import type { FairEnrollment } from '../Services/FairsServices';
import '../Styles/EnrollmentDetailsModal.css';

interface EnrollmentDetailsModalProps {
  enrollment: FairEnrollment | null;
  show: boolean;
  onClose: () => void;
}

const EnrollmentDetailsModal = ({ enrollment, show, onClose }: EnrollmentDetailsModalProps) => {
  if (!enrollment) return null;

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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendiente', className: 'enrollment-details__status--pending' },
      approved: { label: 'Aprobada', className: 'enrollment-details__status--approved' },
      rejected: { label: 'Rechazada', className: 'enrollment-details__status--rejected' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const statusBadge = getStatusBadge(enrollment.status);

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles de la Solicitud" size="xl" maxHeight>
      <div className="enrollment-details">
        {/* Header con información básica */}
        <div className="enrollment-details__header">
          <div className="enrollment-details__header-info">
            <h3 className="enrollment-details__name">
              {enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.first_lastname}
            </h3>
            <span className={`enrollment-details__status ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="enrollment-details__registration-date">
            Solicitud enviada: {formatDate(enrollment.registration_date || '')}
          </p>
        </div>

        {/* Información de la Feria */}
        <div className="enrollment-details__section">
          <h4 className="enrollment-details__section-title">Información de la Feria</h4>
          <div className="enrollment-details__info-grid">
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Nombre de la Feria</span>
              <p className="enrollment-details__text">{enrollment.fair?.name}</p>
            </div>
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Ubicación</span>
              <p className="enrollment-details__text">{enrollment.fair?.location}</p>
            </div>
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Tipo de Feria</span>
              <p className="enrollment-details__text">
                {enrollment.fair?.typeFair === 'interna' ? 'Interna' : 'Externa'}
              </p>
            </div>
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Fecha de la Feria</span>
              <p className="enrollment-details__text">
                {enrollment.fair?.date ? formatDate(enrollment.fair.date) : 'No especificada'}
              </p>
            </div>
          </div>
        </div>

        {/* Información del Stand */}
        <div className="enrollment-details__section">
          <h4 className="enrollment-details__section-title">Stand Asignado</h4>
          <div className="enrollment-details__info-grid">
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Código del Stand</span>
              <div className="enrollment-details__stand-code">
                {enrollment.stand?.stand_code}
              </div>
            </div>
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Estado del Stand</span>
              <span className={`enrollment-details__stand-status ${
                enrollment.stand?.status ? 'enrollment-details__stand-status--occupied' : 'enrollment-details__stand-status--available'
              }`}>
                {enrollment.stand?.status ? 'Ocupado' : 'Disponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Información del Emprendedor */}
        <div className="enrollment-details__section">
          <h4 className="enrollment-details__section-title">Datos del Emprendedor</h4>
          <div className="enrollment-details__info-grid">
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Nombre Completo</span>
              <p className="enrollment-details__text">
                {enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.second_name} {enrollment.entrepreneur?.person?.first_lastname} {enrollment.entrepreneur?.person?.second_lastname}
              </p>
            </div>
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Email</span>
              <p className="enrollment-details__text">{enrollment.entrepreneur?.person?.email}</p>
            </div>
            {enrollment.entrepreneur?.person?.phones && enrollment.entrepreneur.person.phones.length > 0 && (
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Teléfonos</span>
                <div className="enrollment-details__phone-list">
                  {enrollment.entrepreneur.person.phones.map((phone, index) => (
                    <p key={index} className="enrollment-details__text">
                      {phone.number} ({phone.type === 'personal' ? 'Personal' : 'Negocio'})
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="enrollment-details__info-item">
              <span className="enrollment-details__label">Experiencia (años)</span>
              <p className="enrollment-details__text">{enrollment.entrepreneur?.experience}</p>
            </div>
          </div>
        </div>

        {/* Información del Emprendimiento */}
        {enrollment.entrepreneurship && (
          <div className="enrollment-details__section">
            <h4 className="enrollment-details__section-title">Detalles del Emprendimiento</h4>
            <div className="enrollment-details__info-grid">
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Nombre del Emprendimiento</span>
                <p className="enrollment-details__text">{enrollment.entrepreneurship.name}</p>
              </div>
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Descripción</span>
                <p className="enrollment-details__text">{enrollment.entrepreneurship.description}</p>
              </div>
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Ubicación del Negocio</span>
                <p className="enrollment-details__text">{enrollment.entrepreneurship.location}</p>
              </div>
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Categoría</span>
                <div className="enrollment-details__category">
                  <span className="enrollment-details__category-badge">
                    {enrollment.entrepreneurship.category}
                  </span>
                </div>
              </div>
              {enrollment.entrepreneurship.approach && (
                <div className="enrollment-details__info-item">
                  <span className="enrollment-details__label">Enfoque</span>
                  <span className="enrollment-details__approach-badge">
                    {enrollment.entrepreneurship.approach === 'social' ? 'Social' : 
                     enrollment.entrepreneurship.approach === 'cultural' ? 'Cultural' : 'Ambiental'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Redes Sociales del Emprendedor */}
        {(enrollment.entrepreneur?.facebook_url || enrollment.entrepreneur?.instagram_url) && (
          <div className="enrollment-details__section">
            <h4 className="enrollment-details__section-title">Redes Sociales</h4>
            <div className="enrollment-details__social-media">
              {enrollment.entrepreneur.facebook_url && (
                <a href={enrollment.entrepreneur.facebook_url} target="_blank" rel="noopener noreferrer" className="enrollment-details__social-item">
                  <div className="enrollment-details__social-icon enrollment-details__social-icon--facebook">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="enrollment-details__social-content">
                    <span className="enrollment-details__label">Facebook</span>
                    <p className="enrollment-details__text">{enrollment.entrepreneur.facebook_url}</p>
                  </div>
                </a>
              )}

              {enrollment.entrepreneur.instagram_url && (
                <a href={enrollment.entrepreneur.instagram_url} target="_blank" rel="noopener noreferrer" className="enrollment-details__social-item">
                  <div className="enrollment-details__social-icon enrollment-details__social-icon--instagram">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className="enrollment-details__social-content">
                    <span className="enrollment-details__label">Instagram</span>
                    <p className="enrollment-details__text">{enrollment.entrepreneur.instagram_url}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Pie de página con ID */}
        <div className="enrollment-details__footer">
          <div className="enrollment-details__footer-info">
            <p className="enrollment-details__footer-text">
              ID de Solicitud: #{enrollment.id_enrrolment_fair}
            </p>
            {enrollment.entrepreneur?.id_entrepreneur && (
              <p className="enrollment-details__footer-text">
                ID del Emprendedor: #{enrollment.entrepreneur.id_entrepreneur}
              </p>
            )}
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export default EnrollmentDetailsModal;