import GenericModal from './GenericModal';
import type { FairEnrollment } from '../Services/FairsServices';
import '../Styles/EnrollmentDetailsModal.css';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { siFacebook, siInstagram } from 'simple-icons';

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
  const isInternalFair = enrollment.fair?.typeFair === 'interna';

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

        {/* Stand Asignado (para ferias internas) o Mensaje de participación (para externas) */}
        <div className="enrollment-details__section">
          {isInternalFair ? (
            <>
              <h4 className="enrollment-details__section-title">
                {enrollment.status === 'pending' ? 'Stand por Asignar' : 
                 enrollment.status === 'approved' ? 'Stand Asignado' : 
                 'Stand Rechazado'}
              </h4>
              {enrollment.status === 'pending' ? (
                <div className="enrollment-details__participation-notice enrollment-details__participation-notice--pending">
                  <div className="enrollment-details__participation-icon">
                    <Clock size={24} />
                  </div>
                  <div className="enrollment-details__participation-content">
                    <p className="enrollment-details__participation-text">
                      <strong>{enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.first_lastname}</strong> solicita participar en esta feria interna.
                    </p>
                    <p className="enrollment-details__participation-description">
                      El stand se asignará una vez que la solicitud sea aprobada.
                    </p>
                    {/* Mostrar información del stand solicitado */}
                    {enrollment.stand && (
                      <div className="enrollment-details__info-grid" style={{ marginTop: '1rem' }}>
                        <div className="enrollment-details__info-item">
                          <span className="enrollment-details__label">Stand Solicitado</span>
                          <div className="enrollment-details__stand-code enrollment-details__stand-code--pending">
                            {enrollment.stand.stand_code}
                          </div>
                        </div>
                        <div className="enrollment-details__info-item">
                          <span className="enrollment-details__label">Estado del Stand</span>
                          <span className={`enrollment-details__stand-status ${
                            enrollment.stand.status ? 'enrollment-details__stand-status--occupied' : 'enrollment-details__stand-status--available'
                          }`}>
                            {enrollment.stand.status ? 'Ocupado' : 'Disponible'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : enrollment.status === 'approved' ? (
                <div className="enrollment-details__participation-notice enrollment-details__participation-notice--approved">
                  <div className="enrollment-details__participation-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="enrollment-details__participation-content">
                    <p className="enrollment-details__participation-text">
                      <strong>{enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.first_lastname}</strong> fue aprobado para participar en esta feria interna.
                    </p>
                    <p className="enrollment-details__participation-description">
                      Se ha asignado el stand correspondiente para su participación.
                    </p>
                    <div className="enrollment-details__info-grid" style={{ marginTop: '1rem' }}>
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
                </div>
              ) : (
                <div className="enrollment-details__participation-notice enrollment-details__participation-notice--rejected">
                  <div className="enrollment-details__participation-icon">
                    <XCircle size={24} />
                  </div>
                  <div className="enrollment-details__participation-content">
                    <p className="enrollment-details__participation-text">
                      <strong>{enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.first_lastname}</strong> tuvo su solicitud rechazada para participar en esta feria interna.
                    </p>
                    <p className="enrollment-details__participation-description">
                      No se asignó el stand solicitado debido al rechazo.
                    </p>
                    {/* Mostrar información del stand que fue rechazado */}
                    {enrollment.stand && (
                      <div className="enrollment-details__info-grid" style={{ marginTop: '1rem' }}>
                        <div className="enrollment-details__info-item">
                          <span className="enrollment-details__label">Stand Considerado</span>
                          <div className="enrollment-details__stand-code enrollment-details__stand-code--rejected">
                            {enrollment.stand.stand_code}
                          </div>
                        </div>
                        <div className="enrollment-details__info-item">
                          <span className="enrollment-details__label">Estado de la Solicitud</span>
                          <span className="enrollment-details__stand-status enrollment-details__stand-status--rejected">
                            No Asignado
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h4 className="enrollment-details__section-title">
                {enrollment.status === 'pending' ? 'Solicitud de Participación' : 
                 enrollment.status === 'approved' ? 'Participación Aprobada' : 
                 'Solicitud Rechazada'}
              </h4>
              <div className={`enrollment-details__participation-notice enrollment-details__participation-notice--${enrollment.status}`}>
                <div className="enrollment-details__participation-icon">
                  {enrollment.status === 'pending' ? (
                    <Clock size={24} />
                  ) : enrollment.status === 'approved' ? (
                    <CheckCircle size={24} />
                  ) : (
                    <XCircle size={24} />
                  )}
                </div>
                <div className="enrollment-details__participation-content">
                  <p className="enrollment-details__participation-text">
                    <strong>{enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.first_lastname}</strong>{' '}
                    {enrollment.status === 'pending' ? 'solicita participar en esta feria externa.' :
                     enrollment.status === 'approved' ? 'fue aprobado para participar en esta feria externa.' :
                     'tuvo su solicitud rechazada para participar en esta feria externa.'}
                  </p>
                  <p className="enrollment-details__participation-description">
                    {enrollment.status === 'pending' ? 'La solicitud está pendiente de revisión.' :
                     enrollment.status === 'approved' ? 'Puede participar en la feria externa.' :
                     'La solicitud no fue aprobada.'}
                  </p>
                </div>
              </div>
            </>
          )}
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

        {/* Detalles del Emprendimiento */}
        {enrollment.entrepreneur?.entrepreneurship && (
          <div className="enrollment-details__section">
            <h4 className="enrollment-details__section-title">Detalles del Emprendimiento</h4>
            <div className="enrollment-details__info-grid">
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Nombre del Emprendimiento</span>
                <p className="enrollment-details__text">{enrollment.entrepreneur.entrepreneurship.name}</p>
              </div>
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Ubicación del Negocio</span>
                <p className="enrollment-details__text">{enrollment.entrepreneur.entrepreneurship.location}</p>
              </div>
              <div className="enrollment-details__info-item">
                <span className="enrollment-details__label">Categoría</span>
                <div className="enrollment-details__category">
                  <span className="enrollment-details__category-badge">
                    {enrollment.entrepreneur.entrepreneurship.category}
                  </span>
                </div>
              </div>
              {enrollment.entrepreneur.entrepreneurship.approach && (
                <div className="enrollment-details__info-item">
                  <span className="enrollment-details__label">Enfoque</span>
                  <span className="enrollment-details__approach-badge">
                    {enrollment.entrepreneur.entrepreneurship.approach === 'social' ? 'Social' : 
                     enrollment.entrepreneur.entrepreneurship.approach === 'cultural' ? 'Cultural' : 'Ambiental'}
                  </span>
                </div>
              )}
              <div className="enrollment-details__info-item enrollment-details__info-item--full-width">
                <span className="enrollment-details__label">Descripción</span>
                <p className="enrollment-details__text">{enrollment.entrepreneur.entrepreneurship.description}</p>
              </div>
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
                    <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill={`#${siFacebook.hex}`}>
                      <path d={siFacebook.path} />
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
                    <svg role="img" viewBox="0 0 24 24" width="20" height="20" fill={`#${siInstagram.hex}`}>
                      <path d={siInstagram.path} />
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
      </div>
    </GenericModal>
  );
};

export default EnrollmentDetailsModal;