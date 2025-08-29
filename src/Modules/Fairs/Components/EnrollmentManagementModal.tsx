import { useState, useMemo } from 'react';
import { useFairEnrollments, useUpdateEnrollmentStatus } from '../Services/FairsServices';
import EnrollmentDetailsModal from './EnrollmentDetailsModal';
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

  const { data: allEnrollments, isLoading, error } = useFairEnrollments();
  const updateStatus = useUpdateEnrollmentStatus();

  const handleViewDetails = (enrollment: FairEnrollment) => {
    setSelectedEnrollment(enrollment);
    setShowDetailsModal(true);
  };

  const handleApprove = async (enrollment: FairEnrollment) => {
    if (window.confirm(`¿Estás seguro de que quieres aprobar la solicitud de ${enrollment.entrepreneur?.person?.first_name} ${enrollment.entrepreneur?.person?.first_lastname}?`)) {
      try {
        await updateStatus.mutateAsync({ 
          id: enrollment.id_enrrolment_fair!, 
          status: 'approved' 
        });
      } catch (error) {
        alert('Error al aprobar la solicitud. Por favor intenta de nuevo.');
        console.error('Error:', error);
      }
    }
  };

  const handleReject = async (enrollment: FairEnrollment) => {
    if (window.confirm(`¿Estás seguro de que quieres rechazar la solicitud de ${enrollment.entrepreneur?.person?.first_name} ${enrollment.entrepreneur?.person?.first_lastname}?`)) {
      try {
        await updateStatus.mutateAsync({ 
          id: enrollment.id_enrrolment_fair!, 
          status: 'rejected' 
        });
      } catch (error) {
        alert('Error al rechazar la solicitud. Por favor intenta de nuevo.');
        console.error('Error:', error);
      }
    }
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
          <div className="enrollment-management__list">
            {filteredEnrollments.map((enrollment) => (
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
                  <div className="enrollment-management__card-fair-info">
                    <h4 className="enrollment-management__card-fair-name">
                      {enrollment.fair?.name}
                    </h4>
                    <div className="enrollment-management__card-details">
                      <span className="enrollment-management__card-detail">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Stand: {enrollment.stand?.stand_code}
                      </span>
                      <span className="enrollment-management__card-detail">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {enrollment.entrepreneurship?.name}
                      </span>
                    </div>
                  </div>

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
                          onClick={() => handleReject(enrollment)}
                          disabled={updateStatus.isPending}
                          className="enrollment-management__reject-btn"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </button>
                        
                        <button
                          onClick={() => handleApprove(enrollment)}
                          disabled={updateStatus.isPending}
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