import GenericModal from './GenericModal';
import type { Stand, FairEnrollment } from '../Services/FairsServices';
import '../Styles/StandDetailsModal.css';

interface StandDetailsModalProps {
  stand: Stand;
  enrollment: FairEnrollment | null;
  show: boolean;
  onClose: () => void;
}

const StandDetailsModal: React.FC<StandDetailsModalProps> = ({ 
  stand, 
  enrollment, 
  show, 
  onClose 
}) => {

  return (
    <GenericModal 
      show={show} 
      onClose={onClose} 
      title={`Stand ${stand.stand_code}`} 
      size="lg"
    >
      <div className="stand-details-modal">
        {/* Header del stand */}
        <div className="stand-details-modal__header">
          <div className="stand-details-modal__stand-info">
            <div className="stand-details-modal__stand-badge">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Stand {stand.stand_code}</span>
            </div>
            <div className={`stand-details-modal__status ${
              stand.status 
                ? 'stand-details-modal__status--occupied' 
                : 'stand-details-modal__status--available'
            }`}>
              {stand.status ? 'Ocupado' : 'Disponible'}
            </div>
          </div>
        </div>

        {enrollment ? (
          // Información del emprendedor asignado
          <div className="stand-details-modal__content">
            {/* Datos del Emprendedor */}
            <div className="stand-details-modal__section">
              <h3 className="stand-details-modal__section-title">Datos del Emprendedor</h3>
              
              <div className="stand-details-modal__info-grid">
                <div className="stand-details-modal__info-item">
                  <span className="stand-details-modal__label">NOMBRE COMPLETO</span>
                  <p className="stand-details-modal__text">
                    {enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.second_name ? enrollment.entrepreneur.person.second_name + ' ' : ''}{enrollment.entrepreneur?.person?.first_lastname} {enrollment.entrepreneur?.person?.second_lastname || ''}
                  </p>
                </div>
                
                <div className="stand-details-modal__info-item">
                  <span className="stand-details-modal__label">EMAIL</span>
                  <p className="stand-details-modal__text">
                    {enrollment.entrepreneur?.person?.email}
                  </p>
                </div>
                
                {(enrollment.entrepreneur?.person?.phone_primary || enrollment.entrepreneur?.person?.phone_secondary) && (
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">TELÉFONOS</span>
                    <div className="stand-details-modal__phone-list">
                      {enrollment.entrepreneur.person.phone_primary && (
                        <p className="stand-details-modal__text">
                          {enrollment.entrepreneur.person.phone_primary} (Principal)
                        </p>
                      )}
                      {enrollment.entrepreneur.person.phone_secondary && (
                        <p className="stand-details-modal__text">
                          {enrollment.entrepreneur.person.phone_secondary} (Secundario)
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="stand-details-modal__info-item">
                  <span className="stand-details-modal__label">EXPERIENCIA (AÑOS)</span>
                  <p className="stand-details-modal__text">
                    {enrollment.entrepreneur?.experience}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles del Emprendimiento */}
            {enrollment.entrepreneur?.entrepreneurship && (
              <div className="stand-details-modal__section">
                <h3 className="stand-details-modal__section-title">Detalles del Emprendimiento</h3>

                <div className="stand-details-modal__info-grid">
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">NOMBRE DEL EMPRENDIMIENTO</span>
                    <p className="stand-details-modal__text">
                      {enrollment.entrepreneur.entrepreneurship.name}
                    </p>
                  </div>
                  
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">UBICACIÓN DEL NEGOCIO</span>
                    <p className="stand-details-modal__text">
                      {enrollment.entrepreneur.entrepreneurship.location}
                    </p>
                  </div>
                  
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">CATEGORÍA</span>
                    <div className="stand-details-modal__category-badge">
                      {enrollment.entrepreneur.entrepreneurship.category}
                    </div>
                  </div>
                  
                  {enrollment.entrepreneur.entrepreneurship.approach && (
                    <div className="stand-details-modal__info-item">
                      <span className="stand-details-modal__label">ENFOQUE</span>
                      <div className="stand-details-modal__approach-badge">
                        {enrollment.entrepreneur.entrepreneurship.approach === 'social' ? 'Social' : 
                         enrollment.entrepreneur.entrepreneurship.approach === 'cultural' ? 'Cultural' : 'Ambiental'}
                      </div>
                    </div>
                  )}
                  
                  <div className="stand-details-modal__info-item stand-details-modal__info-item--full">
                    <span className="stand-details-modal__label">DESCRIPCIÓN</span>
                    <p className="stand-details-modal__text">
                      {enrollment.entrepreneur.entrepreneurship.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Redes Sociales */}
            {(enrollment.entrepreneur?.facebook_url || enrollment.entrepreneur?.instagram_url) && (
              <div className="stand-details-modal__section">
                <h3 className="stand-details-modal__section-title">Redes Sociales</h3>
                <div className="stand-details-modal__social-links">
                  {enrollment.entrepreneur.facebook_url && (
                    <a 
                      href={enrollment.entrepreneur.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="stand-details-modal__social-link stand-details-modal__social-link--facebook"
                    >
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </a>
                  )}
                  
                  {enrollment.entrepreneur.instagram_url && (
                    <a 
                      href={enrollment.entrepreneur.instagram_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="stand-details-modal__social-link stand-details-modal__social-link--instagram"
                    >
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Stand disponible
          <div className="stand-details-modal__content">
            <div className="stand-details-modal__available-notice">
              <div className="stand-details-modal__available-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stand-details-modal__available-content">
                <h3>Stand Disponible</h3>
                <p>Este stand está disponible para ser asignado a un emprendedor.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </GenericModal>
  );
};

export default StandDetailsModal;