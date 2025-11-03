import { useState } from 'react';
import { useStandsByFair, useFairEnrollmentsByFair } from '../Services/FairsServices';
import StandDetailsModal from './StandDetailsModal';
import GenericModal from './GenericModal';
import type { Fair, Stand, FairEnrollment } from '../Services/FairsServices';
import '../Styles/StandsInfoModal.css';

interface StandsInfoModalProps {
  fair: Fair;
}

const StandsInfoModal: React.FC<StandsInfoModalProps> = ({ fair }) => {
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<FairEnrollment | null>(null);
  const [showStandModal, setShowStandModal] = useState(false);
  const [showEntrepreneurModal, setShowEntrepreneurModal] = useState(false);

  const { data: stands, isLoading: loadingStands } = useStandsByFair(fair.id_fair);
  const { data: enrollments, isLoading: loadingEnrollments } = useFairEnrollmentsByFair(fair.id_fair);

  const isInternal = fair.typeFair === 'interna';
  const approvedEnrollments = enrollments?.filter(e => e.status === 'approved') || [];
  const occupiedStands = stands?.filter(s => s.status) || [];
  const availableStands = stands?.filter(s => !s.status) || [];

  const handleStandClick = (stand: Stand) => {
    if (!stand.status) return;
    
    const enrollment = approvedEnrollments.find(e => e.stand?.id_stand === stand.id_stand);
    setSelectedStand(stand);
    setSelectedEnrollment(enrollment || null);
    setShowStandModal(true);
  };

  const handleEntrepreneurClick = (enrollment: FairEnrollment) => {
    setSelectedEnrollment(enrollment);
    setShowEntrepreneurModal(true);
  };

  const getStandsPerRow = (totalStands: number) => {
    if (totalStands <= 10) return 5;
    if (totalStands <= 30) return 10;
    if (totalStands <= 60) return 12;
    return 15;
  };

  if (loadingStands || loadingEnrollments) {
    return (
      <div className="stands-info-modal__loading">
        <svg className="stands-info-modal__loading-spinner" fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Cargando información de stands...</span>
      </div>
    );
  }

  return (
    <div className="stands-info-modal">
      {/* Header con estadísticas */}
      <div className="stands-info-modal__header">
        <div className="stands-info-modal__stats">
          <div className="stands-info-modal__stat stands-info-modal__stat--total">
            <div className="stands-info-modal__stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <span className="stands-info-modal__stat-label">Total</span>
              <span className="stands-info-modal__stat-value">{fair.stand_capacity}</span>
            </div>
          </div>

          <div className="stands-info-modal__stat stands-info-modal__stat--available">
            <div className="stands-info-modal__stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="stands-info-modal__stat-label">Disponibles</span>
              <span className="stands-info-modal__stat-value">{availableStands.length}</span>
            </div>
          </div>

          <div className="stands-info-modal__stat stands-info-modal__stat--occupied">
            <div className="stands-info-modal__stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <span className="stands-info-modal__stat-label">Ocupados</span>
              <span className="stands-info-modal__stat-value">{occupiedStands.length}</span>
            </div>
          </div>
        </div>
      </div>

      {isInternal ? (
        // Vista para ferias internas - Mapa de stands
        <div className="stands-info-modal__content">
          <div className="stands-info-modal__section-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3>Mapa de Stands</h3>
          </div>

          <div className="stands-info-modal__legend">
            <div className="stands-info-modal__legend-item">
              <div className="stands-info-modal__legend-color stands-info-modal__legend-color--available"></div>
              <span>Disponible</span>
            </div>
            <div className="stands-info-modal__legend-item">
              <div className="stands-info-modal__legend-color stands-info-modal__legend-color--occupied"></div>
              <span>Ocupado (click para ver detalles)</span>
            </div>
          </div>

          {stands && stands.length > 0 ? (
            <div 
              className="stands-info-modal__grid"
              style={{ 
                gridTemplateColumns: `repeat(${getStandsPerRow(stands.length)}, 1fr)`,
                gap: stands.length > 30 ? '0.25rem' : '0.5rem'
              }}
            >
              {stands.map((stand) => (
                <button
                  key={stand.id_stand}
                  onClick={() => handleStandClick(stand)}
                  disabled={!stand.status}
                  className={`stands-info-modal__stand ${
                    stand.status 
                      ? 'stands-info-modal__stand--occupied' 
                      : 'stands-info-modal__stand--available'
                  } ${
                    stands.length > 50 
                      ? 'stands-info-modal__stand--small' 
                      : ''
                  }`}
                  title={`Stand ${stand.stand_code} - ${stand.status ? 'Ocupado (click para detalles)' : 'Disponible'}`}
                >
                  {stand.stand_code}
                </button>
              ))}
            </div>
          ) : (
            <div className="stands-info-modal__no-data">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h4>No hay stands configurados</h4>
              <p>Esta feria aún no tiene stands asignados.</p>
            </div>
          )}
        </div>
      ) : (
        // Vista para ferias externas - Lista de emprendedores
        <div className="stands-info-modal__content">
          <div className="stands-info-modal__section-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3>Emprendedores Inscritos</h3>
          </div>

          {approvedEnrollments.length > 0 ? (
            <div className="stands-info-modal__entrepreneurs-list">
              {approvedEnrollments.map((enrollment, index) => (
                <button
                  key={enrollment.id_enrrolment_fair} 
                  className="stands-info-modal__entrepreneur-card stands-info-modal__entrepreneur-card--clickable"
                  onClick={() => handleEntrepreneurClick(enrollment)}
                >
                  <div className="stands-info-modal__entrepreneur-number">
                    #{index + 1}
                  </div>
                  <div className="stands-info-modal__entrepreneur-avatar">
                    {enrollment.entrepreneur?.person?.first_name?.charAt(0)}
                    {enrollment.entrepreneur?.person?.first_lastname?.charAt(0)}
                  </div>
                  <div className="stands-info-modal__entrepreneur-info">
                    <h4 className="stands-info-modal__entrepreneur-name">
                      {enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.first_lastname}
                    </h4>
                    <p className="stands-info-modal__entrepreneur-business">
                      {enrollment.entrepreneur?.entrepreneurship?.name || 'Sin emprendimiento registrado'}
                    </p>
                    <p className="stands-info-modal__entrepreneur-email">
                      {enrollment.entrepreneur?.person?.email}
                    </p>
                  </div>
                  <div className="stands-info-modal__entrepreneur-badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Aprobado
                  </div>
                  <div className="stands-info-modal__click-indicator">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="stands-info-modal__no-data">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h4>No hay emprendedores inscritos</h4>
              <p>Esta feria externa aún no tiene participantes aprobados.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para detalles del stand */}
      {showStandModal && selectedStand && (
        <StandDetailsModal
          stand={selectedStand}
          enrollment={selectedEnrollment}
          show={showStandModal}
          onClose={() => {
            setShowStandModal(false);
            setSelectedStand(null);
            setSelectedEnrollment(null);
          }}
        />
      )}

      {/* Modal para detalles del emprendedor en ferias externas */}
      {showEntrepreneurModal && selectedEnrollment && (
        <GenericModal
          show={showEntrepreneurModal}
          onClose={() => {
            setShowEntrepreneurModal(false);
            setSelectedEnrollment(null);
          }}
          title={`${selectedEnrollment.entrepreneur?.person?.first_name} ${selectedEnrollment.entrepreneur?.person?.first_lastname}`}
          size="lg"
        >
          <div className="stand-details-modal">
            {/* Datos del Emprendedor */}
            <div className="stand-details-modal__section">
              <h3 className="stand-details-modal__section-title">Datos del Emprendedor</h3>
              
              <div className="stand-details-modal__info-grid">
                <div className="stand-details-modal__info-item">
                  <span className="stand-details-modal__label">NOMBRE COMPLETO</span>
                  <p className="stand-details-modal__text">
                    {selectedEnrollment.entrepreneur?.person?.first_name} {selectedEnrollment.entrepreneur?.person?.second_name ? selectedEnrollment.entrepreneur.person.second_name + ' ' : ''}{selectedEnrollment.entrepreneur?.person?.first_lastname} {selectedEnrollment.entrepreneur?.person?.second_lastname || ''}
                  </p>
                </div>
                
                <div className="stand-details-modal__info-item">
                  <span className="stand-details-modal__label">EMAIL</span>
                  <p className="stand-details-modal__text">
                    {selectedEnrollment.entrepreneur?.person?.email}
                  </p>
                </div>
                
                {(selectedEnrollment.entrepreneur?.person?.phone_primary || selectedEnrollment.entrepreneur?.person?.phone_secondary) && (
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">TELÉFONOS</span>
                    <div className="stand-details-modal__phone-list">
                      {selectedEnrollment.entrepreneur.person.phone_primary && (
                        <p className="stand-details-modal__text">
                          {selectedEnrollment.entrepreneur.person.phone_primary} (Principal)
                        </p>
                      )}
                      {selectedEnrollment.entrepreneur.person.phone_secondary && (
                        <p className="stand-details-modal__text">
                          {selectedEnrollment.entrepreneur.person.phone_secondary} (Secundario)
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="stand-details-modal__info-item">
                  <span className="stand-details-modal__label">EXPERIENCIA (AÑOS)</span>
                  <p className="stand-details-modal__text">
                    {selectedEnrollment.entrepreneur?.experience}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles del Emprendimiento */}
            {selectedEnrollment.entrepreneur?.entrepreneurship && (
              <div className="stand-details-modal__section">
                <h3 className="stand-details-modal__section-title">Detalles del Emprendimiento</h3>

                <div className="stand-details-modal__info-grid">
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">NOMBRE DEL EMPRENDIMIENTO</span>
                    <p className="stand-details-modal__text">
                      {selectedEnrollment.entrepreneur.entrepreneurship.name}
                    </p>
                  </div>
                  
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">UBICACIÓN DEL NEGOCIO</span>
                    <p className="stand-details-modal__text">
                      {selectedEnrollment.entrepreneur.entrepreneurship.location}
                    </p>
                  </div>
                  
                  <div className="stand-details-modal__info-item">
                    <span className="stand-details-modal__label">CATEGORÍA</span>
                    <div className="stand-details-modal__category-badge">
                      {selectedEnrollment.entrepreneur.entrepreneurship.category}
                    </div>
                  </div>
                  
                  {selectedEnrollment.entrepreneur.entrepreneurship.approach && (
                    <div className="stand-details-modal__info-item">
                      <span className="stand-details-modal__label">ENFOQUE</span>
                      <div className="stand-details-modal__approach-badge">
                        {selectedEnrollment.entrepreneur.entrepreneurship.approach === 'social' ? 'Social' : 
                         selectedEnrollment.entrepreneur.entrepreneurship.approach === 'cultural' ? 'Cultural' : 'Ambiental'}
                      </div>
                    </div>
                  )}
                  
                  <div className="stand-details-modal__info-item stand-details-modal__info-item--full">
                    <span className="stand-details-modal__label">DESCRIPCIÓN</span>
                    <p className="stand-details-modal__text">
                      {selectedEnrollment.entrepreneur.entrepreneurship.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Redes Sociales */}
            {(selectedEnrollment.entrepreneur?.facebook_url || selectedEnrollment.entrepreneur?.instagram_url) && (
              <div className="stand-details-modal__section">
                <h3 className="stand-details-modal__section-title">Redes Sociales</h3>
                <div className="stand-details-modal__social-links">
                  {selectedEnrollment.entrepreneur.facebook_url && (
                    <a 
                      href={selectedEnrollment.entrepreneur.facebook_url} 
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
                  
                  {selectedEnrollment.entrepreneur.instagram_url && (
                    <a 
                      href={selectedEnrollment.entrepreneur.instagram_url} 
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
        </GenericModal>
      )}
    </div>
  );
};

export default StandsInfoModal;