import { useState, useMemo } from 'react';
import { useDeleteEntrepreneur, usePendingEntrepreneurs, useUpdateEntrepreneurStatus } from '../Services/EntrepreneursServices';
import type { Entrepreneur } from '../Types';
import EntrepreneurDetailsModal from './EntrepreneurDetailsModal';
import PendingEntrepreneursTable from './PendingEntrepreneursTable';
import '../Styles/PendingEntrepreneursList.css';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { copyApproveReject } from '../../Shared/utils/confirmationCopy';
import { ListState, useSuccessAlert } from '../../Shared/components';

interface PendingEntrepreneursListProps {
  searchTerm?: string;
  viewMode?: 'cards' | 'table';
}

const PendingEntrepreneursList = ({ searchTerm = '', viewMode = 'cards' }: PendingEntrepreneursListProps) => {
  const { data: pendingEntrepreneurs, isLoading, error, refetch } = usePendingEntrepreneurs();
  const updateStatus = useUpdateEntrepreneurStatus();
  const deleteEntrepreneur = useDeleteEntrepreneur();
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'approve' | 'reject'>('approve');
  const [entrepreneurToProcess, setEntrepreneurToProcess] = useState<Entrepreneur | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'error'; text: string } | null>(null);
  const { showSuccess } = useSuccessAlert();

  const showError = (text: string) => {
    setActionMessage({ type: 'error', text });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleViewDetails = (entrepreneur: Entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setShowDetailsModal(true);
  };

  const handleApproveClick = (entrepreneur: Entrepreneur) => {
    setEntrepreneurToProcess(entrepreneur);
    setConfirmationAction('approve');
    setShowConfirmationModal(true);
  };

  const handleRejectClick = (entrepreneur: Entrepreneur) => {
    setEntrepreneurToProcess(entrepreneur);
    setConfirmationAction('reject');
    setShowConfirmationModal(true);
  };

  const confirmAction = async () => {
    if (!entrepreneurToProcess) return;

    setIsProcessing(true);

    try {
      if (confirmationAction === 'approve') {
        await updateStatus.mutateAsync({
          id_entrepreneur: entrepreneurToProcess.id_entrepreneur!,
          status: 'approved'
        });
        showSuccess('Solicitud aprobada exitosamente');
      } else {
        await deleteEntrepreneur.mutateAsync(entrepreneurToProcess.id_entrepreneur!);
        showSuccess('Solicitud rechazada exitosamente');
      }

      setShowConfirmationModal(false);
      setEntrepreneurToProcess(null);

    } catch (error) {
      const actionText = confirmationAction === 'approve' ? 'aprobar' : 'rechazar';
      showError(`Error al ${actionText} la solicitud`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmationModal(false);
    setEntrepreneurToProcess(null);
  };

  const buildConfirmationMessage = (entrepreneur: Entrepreneur, action: 'approve' | 'reject') => {
    const entrepreneurName = `${entrepreneur.person?.first_name} ${entrepreneur.person?.first_lastname}`;
    const entrepreneurshipName = entrepreneur.entrepreneurship?.name;

    if (action === 'approve') {
      return `Vas a aprobar la solicitud de ${entrepreneurName} para el emprendimiento «${entrepreneurshipName}». El emprendedor quedará registrado.`;
    }
    return `Vas a rechazar la solicitud de ${entrepreneurName} para el emprendimiento «${entrepreneurshipName}». Esta acción no se puede deshacer y se eliminarán los datos asociados.`;
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

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

  if (isLoading || error) {
    return (
      <ListState
        isLoading={isLoading}
        error={error}
        loadingText="Cargando solicitudes de emprendedores..."
        errorTitle="No se pudieron cargar las solicitudes de emprendedores"
        errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
        onRetry={refetch}
      />
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
      {/* Confirmation modal */}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelAction}
        onConfirm={confirmAction}
        {...(entrepreneurToProcess
          ? copyApproveReject({
              approving: confirmationAction === 'approve',
              body: buildConfirmationMessage(entrepreneurToProcess, confirmationAction),
            })
          : { title: '', message: '', confirmText: '' })}
        cancelText="Cancelar"
        type={confirmationAction === 'approve' ? "info" : "danger"}
        isLoading={isProcessing}
      />

      {/* Action alert */}
      {actionMessage && (
        <div className={`pending-entrepreneurs__alert pending-entrepreneurs__alert--${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

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

      {viewMode === 'cards' ? (
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
                        onClick={() => handleRejectClick(entrepreneur)}
                        disabled={updateStatus.isPending}
                        className="pending-entrepreneurs__reject-btn"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rechazar
                      </button>

                      <button
                        onClick={() => handleApproveClick(entrepreneur)}
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
      ) : (
        <PendingEntrepreneursTable
          data={currentEntrepreneurs}
          onViewDetails={handleViewDetails}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pending-entrepreneurs__pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pending-entrepreneurs__pagination-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <div className="pending-entrepreneurs__pagination-numbers">
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button onClick={() => handlePageChange(1)} className="pending-entrepreneurs__pagination-number">1</button>
                <span className="pending-entrepreneurs__pagination-ellipsis">...</span>
              </>
            )}
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pending-entrepreneurs__pagination-number ${currentPage === page ? 'pending-entrepreneurs__pagination-number--active' : ''}`}
              >
                {page}
              </button>
            ))}
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="pending-entrepreneurs__pagination-ellipsis">...</span>
                <button onClick={() => handlePageChange(totalPages)} className="pending-entrepreneurs__pagination-number">{totalPages}</button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pending-entrepreneurs__pagination-btn"
          >
            Siguiente
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span className="pending-entrepreneurs__pagination-info">
            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredEntrepreneurs.length)} de {filteredEntrepreneurs.length}
          </span>
        </div>
      )}

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