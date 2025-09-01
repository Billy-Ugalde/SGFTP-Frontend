import { useState, useMemo } from 'react';
import { useFairEnrollments, useUpdateEnrollmentStatus } from '../Services/FairsServices';
import EnrollmentDetailsModal from './EnrollmentDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import type { FairEnrollment } from '../Services/FairsServices';
import '../Styles/EnrollmentManagementModal.css';

interface EnrollmentManagementModalProps {
  onClose: () => void;
}

const EnrollmentManagementModal = ({ onClose }: EnrollmentManagementModalProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<FairEnrollment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados para el modal de confirmación
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'approve' | 'reject'>('approve');
  const [enrollmentToProcess, setEnrollmentToProcess] = useState<FairEnrollment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { data: allEnrollments, isLoading, error } = useFairEnrollments();
  const updateStatus = useUpdateEnrollmentStatus();

  const handleViewDetails = (enrollment: FairEnrollment) => {
    setSelectedEnrollment(enrollment);
    setShowDetailsModal(true);
  };

  const handleApproveClick = (enrollment: FairEnrollment) => {
    setEnrollmentToProcess(enrollment);
    setConfirmationAction('approve');
    setShowConfirmationModal(true);
  };

  const handleRejectClick = (enrollment: FairEnrollment) => {
    setEnrollmentToProcess(enrollment);
    setConfirmationAction('reject');
    setShowConfirmationModal(true);
  };

  const buildConfirmationMessage = (enrollment: FairEnrollment, action: 'approve' | 'reject') => {
    const entrepreneurName = `${enrollment.entrepreneur?.person?.first_name} ${enrollment.entrepreneur?.person?.first_lastname}`;
    const fairName = enrollment.fair?.name;
    const isInternalFair = enrollment.fair?.typeFair === 'interna';
    const standCode = enrollment.stand?.stand_code;

    if (action === 'approve') {
      let message = `Se aprobará la solicitud de participación de ${entrepreneurName} en "${fairName}". `;
      
      if (isInternalFair && standCode) {
        message += `Se asignará el stand ${standCode}. `;
      }
      
      message += isInternalFair 
        ? 'El emprendedor podrá participar en la feria con su stand asignado.'
        : 'El emprendedor podrá participar en la feria externa.';
      
      return message;
    } else {
      let message = `Se rechazará definitivamente la solicitud de ${entrepreneurName} para "${fairName}". `;
      
      if (isInternalFair && standCode) {
        message += `El stand ${standCode} no será asignado. `;
      }
      
      message += 'Esta acción no se puede deshacer.';
      
      return message;
    }
  };

  const confirmAction = async () => {
    if (!enrollmentToProcess) return;
    
    setIsProcessing(true);
    
    try {
      const newStatus = confirmationAction === 'approve' ? 'approved' : 'rejected';
      await updateStatus.mutateAsync({ 
        id: enrollmentToProcess.id_enrrolment_fair!, 
        status: newStatus
      });
      
      setShowConfirmationModal(false);
      setEnrollmentToProcess(null);
      
    } catch (error) {
      const actionText = confirmationAction === 'approve' ? 'aprobar' : 'rechazar';
      console.error(`Error al ${actionText} la solicitud:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmationModal(false);
    setEnrollmentToProcess(null);
    setIsProcessing(false);
  };

  const filteredEnrollments = useMemo(() => {
    if (!allEnrollments) return [];
    
    const enrollmentsByStatus = allEnrollments.filter(enrollment => enrollment.status === activeTab);
    
    return enrollmentsByStatus.filter(enrollment => {
      const entrepreneurName = `${enrollment.entrepreneur?.person?.first_name} ${enrollment.entrepreneur?.person?.first_lastname}`.toLowerCase();
      const fairName = enrollment.fair?.name?.toLowerCase() || '';
      const email = enrollment.entrepreneur?.person?.email?.toLowerCase() || '';
      
      return entrepreneurName.includes(searchTerm.toLowerCase()) ||
             fairName.includes(searchTerm.toLowerCase()) ||
             email.includes(searchTerm.toLowerCase());
    });
  }, [allEnrollments, activeTab, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 1) {
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const getStatusCounts = () => {
    if (!allEnrollments) return { pending: 0, approved: 0, rejected: 0 };
    
    return allEnrollments.reduce((counts, enrollment) => {
      counts[enrollment.status]++;
      return counts;
    }, { pending: 0, approved: 0, rejected: 0 });
  };

  const statusCounts = getStatusCounts();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };
  
  const renderFairInfo = (enrollment: FairEnrollment) => {
    const isInternalFair = enrollment.fair?.typeFair === 'interna';
    
    return (
      <div className="enrollment-management__card-fair-info">
        <h4 className="enrollment-management__card-fair-name">
          {enrollment.fair?.name}
        </h4>
        
        <div className="enrollment-management__card-details">
          {/* Ubicación de la feria */}
          <span className="enrollment-management__card-detail">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {enrollment.fair?.location}
          </span>

          {/* Tipo de feria */}
          <span className="enrollment-management__card-detail">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Feria {isInternalFair ? 'Interna' : 'Externa'}
          </span>

          {/* Información del stand según el tipo de feria y estado */}
          {isInternalFair ? (
            <span className="enrollment-management__card-detail enrollment-management__card-detail--stand">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="enrollment-management__stand-code">
                {enrollment.status === 'pending' ? (
                  <>Stand: {enrollment.stand?.stand_code || 'Por asignar'}</>
                ) : enrollment.status === 'approved' ? (
                  <>Stand asignado: {enrollment.stand?.stand_code}</>
                ) : (
                  'Stand no asignado - Solicitud rechazada'
                )}
              </span>
            </span>
          ) : (
            <span className="enrollment-management__card-detail enrollment-management__card-detail--external">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={`enrollment-management__participation-text enrollment-management__participation-text--${enrollment.status}`}>
                {enrollment.status === 'pending' ? 'Solicita participar en la feria' :
                 enrollment.status === 'approved' ? 'Solicitud aceptada para participar' :
                 'Solicitud rechazada'}
              </span>
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="enrollment-management__loading">
        <div className="enrollment-management__loading-content">
          <svg className="enrollment-management__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando solicitudes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrollment-management__error">
        <svg className="enrollment-management__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="enrollment-management__error-title">Error al cargar las solicitudes</h3>
        <p className="enrollment-management__error-text">Por favor intenta refrescar la página</p>
      </div>
    );
  }

  return (
    <div className="enrollment-management">
      {/* Modal de confirmación */}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelAction}
        onConfirm={confirmAction}
        title={confirmationAction === 'approve' ? "¿Aprobar solicitud?" : "¿Rechazar solicitud?"}
        message={enrollmentToProcess ? buildConfirmationMessage(enrollmentToProcess, confirmationAction) : ''}
        confirmText={confirmationAction === 'approve' ? "Sí, aprobar" : "Sí, rechazar"}
        cancelText="Cancelar"
        type={confirmationAction === 'approve' ? "info" : "danger"}
        isLoading={isProcessing}
      />

      {/* Header con estadísticas */}
      <div className="enrollment-management__header">
        <div className="enrollment-management__stats">
          <div className="enrollment-management__stat-card enrollment-management__stat-card--pending">
            <div className="enrollment-management__stat-content">
              <div className="enrollment-management__stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="enrollment-management__stat-label">Solicitudes Pendientes</p>
                <p className="enrollment-management__stat-value">{statusCounts.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="enrollment-management__stat-card enrollment-management__stat-card--approved">
            <div className="enrollment-management__stat-content">
              <div className="enrollment-management__stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="enrollment-management__stat-label">Aprobadas</p>
                <p className="enrollment-management__stat-value">{statusCounts.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="enrollment-management__stat-card enrollment-management__stat-card--rejected">
            <div className="enrollment-management__stat-content">
              <div className="enrollment-management__stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="enrollment-management__stat-label">Rechazadas</p>
                <p className="enrollment-management__stat-value">{statusCounts.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y controles */}
      <div className="enrollment-management__controls">
        <div className="enrollment-management__tabs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`enrollment-management__tab ${activeTab === 'pending' ? 'enrollment-management__tab--active' : ''}`}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Solicitudes ({statusCounts.pending})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`enrollment-management__tab ${activeTab === 'approved' ? 'enrollment-management__tab--active' : ''}`}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Aprobadas ({statusCounts.approved})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`enrollment-management__tab ${activeTab === 'rejected' ? 'enrollment-management__tab--active' : ''}`}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rechazadas ({statusCounts.rejected})
          </button>
        </div>

        {/* Búsqueda */}
        <div className="enrollment-management__search-wrapper">
          <div className="enrollment-management__search-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar solicitudes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="enrollment-management__search-input"
          />
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="enrollment-management__content">
        {filteredEnrollments.length === 0 ? (
          <div className="enrollment-management__empty">
            <div className="enrollment-management__empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="enrollment-management__empty-title">
              No hay solicitudes {activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas'}
            </h3>
            <p className="enrollment-management__empty-text">
              {activeTab === 'pending' 
                ? 'Todas las solicitudes han sido procesadas.'
                : `No se encontraron solicitudes ${activeTab === 'approved' ? 'aprobadas' : 'rechazadas'}.`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Información de paginación */}
            {totalPages > 1 && (
              <div className="fairs-list__pagination-info">
                <p className="fairs-list__results-text">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredEnrollments.length)} de {filteredEnrollments.length} solicitudes
                </p>
              </div>
            )}

            <div className="enrollment-management__list">
              {currentEnrollments.map((enrollment) => (
                <div key={enrollment.id_enrrolment_fair} className="enrollment-management__card">
                  <div className="enrollment-management__card-header">
                    <div className="enrollment-management__card-avatar">
                      {enrollment.entrepreneur?.person?.first_name?.charAt(0)}
                      {enrollment.entrepreneur?.person?.first_lastname?.charAt(0)}
                    </div>
                    <div className="enrollment-management__card-info">
                      <h3 className="enrollment-management__card-name">
                        {enrollment.entrepreneur?.person?.first_name} {enrollment.entrepreneur?.person?.first_lastname}
                      </h3>
                      <p className="enrollment-management__card-email">{enrollment.entrepreneur?.person?.email}</p>
                      <p className="enrollment-management__card-date">
                        Solicitud: {formatDate(enrollment.registration_date || '')}
                      </p>
                    </div>
                  </div>

                  <div className="enrollment-management__card-body">
                    {renderFairInfo(enrollment)}

                    <div className="enrollment-management__card-actions">
                      <button
                        onClick={() => handleViewDetails(enrollment)}
                        className="enrollment-management__details-btn"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalles
                      </button>
                      
                      {activeTab === 'pending' && (
                        <div className="enrollment-management__action-buttons">
                          <button
                            onClick={() => handleRejectClick(enrollment)}
                            disabled={updateStatus.isPending || isProcessing}
                            className="enrollment-management__reject-btn"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rechazar
                          </button>
                          
                          <button
                            onClick={() => handleApproveClick(enrollment)}
                            disabled={updateStatus.isPending || isProcessing}
                            className="enrollment-management__approve-btn"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Aprobar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="fairs-list__pagination">
                {/* Botón Anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="fairs-list__pagination-btn fairs-list__pagination-btn--prev"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>

                {/* Números de página */}
                <div className="fairs-list__pagination-numbers">
                  {currentPage > 2 && totalPages > 3 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="fairs-list__pagination-number"
                      >
                        1
                      </button>
                      <span className="fairs-list__pagination-ellipsis">...</span>
                    </>
                  )}

                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`fairs-list__pagination-number ${currentPage === page ? 'fairs-list__pagination-number--active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}

                  {currentPage < totalPages - 1 && totalPages > 3 && (
                    <>
                      <span className="fairs-list__pagination-ellipsis">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="fairs-list__pagination-number"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="fairs-list__pagination-btn fairs-list__pagination-btn--next"
                >
                  Siguiente
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles */}
      <EnrollmentDetailsModal
        enrollment={selectedEnrollment}
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEnrollment(null);
        }}
      />
    </div>
  );
};

export default EnrollmentManagementModal;