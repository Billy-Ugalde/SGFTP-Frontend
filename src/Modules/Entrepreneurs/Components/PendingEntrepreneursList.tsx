import { useState, useMemo } from 'react';
import { useDeleteEntrepreneur, usePendingEntrepreneurs, useUpdateEntrepreneurStatus } from '../Services/EntrepreneursServices';
import EntrepreneurDetailsModal from './EntrepreneurDetailsModal';
import type { Entrepreneur } from '../Services/EntrepreneursServices';
import '../Styles/PendingEntrepreneursList.css';

interface PendingEntrepreneursListProps {
  searchTerm?: string;
}

const PendingEntrepreneursList = ({ searchTerm = '' }: PendingEntrepreneursListProps) => {
  const { data: pendingEntrepreneurs, isLoading, error } = usePendingEntrepreneurs();
  const updateStatus = useUpdateEntrepreneurStatus();
  const deleteEntrepreneur = useDeleteEntrepreneur();
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const handleViewDetails = (entrepreneur: Entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setShowDetailsModal(true);
  };

  const handleApprove = async (entrepreneur: Entrepreneur) => {
    if (window.confirm(`¿Estás seguro de que quieres aprobar la solicitud de ${entrepreneur.person?.first_name} ${entrepreneur.person?.first_lastname}?`)) {
      try {
        await updateStatus.mutateAsync({ 
          id_entrepreneur: entrepreneur.id_entrepreneur!, 
          status: 'approved' 
        });
        alert('¡Solicitud aprobada exitosamente!');
      } catch (error) {
        alert('Error al aprobar la solicitud. Por favor intenta de nuevo.');
        console.error('Error:', error);
      }
    }
  };

  const handleReject = async (entrepreneur: Entrepreneur) => {
    if (window.confirm(`¿Estás seguro de que quieres rechazar y eliminar la solicitud de ${entrepreneur.person?.first_name} ${entrepreneur.person?.first_lastname}?`)) {
      try {
       await deleteEntrepreneur.mutateAsync(entrepreneur.id_entrepreneur!);
        alert('¡Solicitud rechazada y eliminada exitosamente!');
      } catch (error) {
        alert('Hubo un error al rechazar la solicitud. Inténtalo de nuevo.');
        console.error('Error:', error);
      }
    }
  };

  const filteredEntrepreneurs = useMemo(() => {
    if (!pendingEntrepreneurs) return [];
    
    const sortedEntrepreneurs = [...pendingEntrepreneurs].sort((a, b) => {
      const dateA = new Date(a.registration_date || '').getTime();
      const dateB = new Date(b.registration_date || '').getTime();
      return dateB - dateA; // Most recent first
    });
    
    return sortedEntrepreneurs.filter(entrepreneur => {
      const fullName = `${entrepreneur.person?.first_name} ${entrepreneur.person?.first_lastname}`.toLowerCase();
      const entrepreneurshipName = entrepreneur.entrepreneurship?.name?.toLowerCase() || '';
      const email = entrepreneur.person?.email?.toLowerCase() || '';
      
      return fullName.includes(searchTerm.toLowerCase()) ||
             entrepreneurshipName.includes(searchTerm.toLowerCase()) ||
             email.includes(searchTerm.toLowerCase());
    });
  }, [pendingEntrepreneurs, searchTerm]);

  const totalPages = Math.ceil(filteredEntrepreneurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEntrepreneurs = filteredEntrepreneurs.slice(startIndex, startIndex + itemsPerPage);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Comida':
        return '';
      case 'Artesanía':
        return '';
      case 'Vestimenta':
        return '';
      case 'Accesorios':
        return '';
      case 'Decoración':
        return '';
      case 'Demostración':
        return '';
      case 'Otra categoría': 
        return ''
      default:
        return '';
    }
  };

  const getApproachBadge = (approach: string) => {
    const badges = {
      social: { color: '#059669', bg: '#d1fae5', label: 'Social' },
      cultural: { color: '#7c3aed', bg: '#ede9fe', label: 'Cultural' },
      ambiental: { color: '#0891b2', bg: '#cffafe', label: 'Ambiental' }
    };
    return badges[approach as keyof typeof badges] || badges.social;
  };

  if (isLoading) {
    return (
      <div className="pending-entrepreneurs__loading">
        <div className="pending-entrepreneurs__loading-content">
          <svg className="pending-entrepreneurs__loading-spinner" fill="none" viewBox="0 0 24 24">
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
      <div className="pending-entrepreneurs__error">
        <svg className="pending-entrepreneurs__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="pending-entrepreneurs__error-title">Error al cargar las solicitudes</h3>
        <p className="pending-entrepreneurs__error-text">Por favor intenta refrescar la página</p>
      </div>
    );
  }

  if (!pendingEntrepreneurs || pendingEntrepreneurs.length === 0) {
    return (
      <div className="pending-entrepreneurs__empty">
        <div className="pending-entrepreneurs__empty-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="pending-entrepreneurs__empty-title">No hay solicitudes pendientes</h3>
        <p className="pending-entrepreneurs__empty-text">Todas las solicitudes han sido procesadas.</p>
        <div className="pending-entrepreneurs__empty-emoji">⏳</div>
      </div>
    );
  }

  if (filteredEntrepreneurs.length === 0) {
    return (
      <div className="pending-entrepreneurs__empty">
        <div className="pending-entrepreneurs__empty-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="pending-entrepreneurs__empty-title">No se encontraron solicitudes</h3>
        <p className="pending-entrepreneurs__empty-text">
          No hay solicitudes que coincidan con "{searchTerm}". Intenta ajustar tu búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="pending-entrepreneurs">
      {/* Stats */}
      <div className="pending-entrepreneurs__stats">
        <div className="pending-entrepreneurs__stat-card">
          <div className="pending-entrepreneurs__stat-content">
            <div className="pending-entrepreneurs__stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="pending-entrepreneurs__stat-label">Solicitudes Pendientes</p>
              <p className="pending-entrepreneurs__stat-value">{pendingEntrepreneurs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination info */}
      {totalPages > 1 && (
        <div className="pending-entrepreneurs__pagination-info">
          <p className="pending-entrepreneurs__results-text">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEntrepreneurs.length)} de {filteredEntrepreneurs.length} solicitudes
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="pending-entrepreneurs__grid">
        {currentEntrepreneurs.map(entrepreneur => {
          const approachBadge = getApproachBadge(entrepreneur.entrepreneurship?.approach || 'social');
          
          return (
            <div key={entrepreneur.id_entrepreneur} className="pending-entrepreneurs__card">
              <div className="pending-entrepreneurs__card-header">
                <div className="pending-entrepreneurs__card-info">
                  <h3 className="pending-entrepreneurs__card-name">
                    {entrepreneur.person?.first_name} {entrepreneur.person?.first_lastname}
                  </h3>
                  <p className="pending-entrepreneurs__card-email">{entrepreneur.person?.email}</p>
                  <p className="pending-entrepreneurs__card-date">
                    Solicitud: {formatDate(entrepreneur.registration_date || '')}
                  </p>
                </div>
              </div>

              <div className="pending-entrepreneurs__card-body">
                <div className="pending-entrepreneurs__card-entrepreneurship">
                  <div className="pending-entrepreneurs__card-entrepreneurship-header">
                    <span className="pending-entrepreneurs__card-category-icon">
                      {getCategoryIcon(entrepreneur.entrepreneurship?.category || '')}
                    </span>
                    <h4 className="pending-entrepreneurs__card-entrepreneurship-name">
                      {entrepreneur.entrepreneurship?.name}
                    </h4>
                  </div>
                  
                  <div className="pending-entrepreneurs__card-badges">
                    <span className="pending-entrepreneurs__card-category-badge">
                      {entrepreneur.entrepreneurship?.category}
                    </span>
                    <span 
                      className="pending-entrepreneurs__card-approach-badge"
                      style={{ backgroundColor: approachBadge.bg, color: approachBadge.color }}
                    >
                      {approachBadge.label}
                    </span>
                  </div>

                  <p className="pending-entrepreneurs__card-location">
                    Ubicación: {entrepreneur.entrepreneurship?.location}
                  </p>
                </div>

                <div className="pending-entrepreneurs__card-actions">
                  <button
                    onClick={() => handleViewDetails(entrepreneur)}
                    className="pending-entrepreneurs__details-btn"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalles
                  </button>
                  
                  <div className="pending-entrepreneurs__action-buttons">
                    <button
                      onClick={() => handleReject(entrepreneur)}
                      disabled={updateStatus.isPending}
                      className="pending-entrepreneurs__reject-btn"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Rechazar
                    </button>
                    
                    <button
                      onClick={() => handleApprove(entrepreneur)}
                      disabled={updateStatus.isPending}
                      className="pending-entrepreneurs__approve-btn"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Aprobar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      <EntrepreneurDetailsModal
        entrepreneur={selectedEntrepreneur}
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEntrepreneur(null);
        }}
      />
    </div>
  );
};

export default PendingEntrepreneursList;