import { useState, useMemo } from 'react';
import { useFairs, useUpdateFairStatus, useUpdateFairArchived } from '../Services/FairsServices';
import EditFairButton from './EditFairButton';
import StandsInfoButton from './StandsInfoButton';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { copyArchive, copyToggleActive } from '../../Shared/utils/confirmationCopy';
import { useSuccessAlert, EmptyState } from '../../Shared/components';
import GenericModal from './GenericModal';
import FairsTable from './FairsTable';
import { ListState } from '../../Shared/components';
import '../Styles/FairsList.css';

interface Fair {
  id_fair: number;
  name: string;
  description: string;
  conditions: string;
  location: string;
  typeFair: string;
  stand_capacity: number;
  status: boolean;
  archived: boolean;
  date: string;
}

interface FairsListProps {
  searchTerm?: string;
  statusFilter?: string;
  viewMode?: 'cards' | 'table';
}

const FairsList = ({ searchTerm = '', statusFilter = 'all', viewMode = 'table' }: FairsListProps) => {
  const { data: fairs, isLoading, error, refetch } = useFairs();
  const updateStatus = useUpdateFairStatus();
  const updateArchived = useUpdateFairArchived();
  const { showSuccess } = useSuccessAlert();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'table' ? 10 : 10;

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [fairToToggle, setFairToToggle] = useState<Fair | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [fairToArchive, setFairToArchive] = useState<Fair | null>(null);
  const [isUpdatingArchived, setIsUpdatingArchived] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFair, setSelectedFair] = useState<Fair | null>(null);

  const handleToggleStatusClick = (fair: Fair) => {
    setFairToToggle(fair);
    setShowConfirmationModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!fairToToggle) return;
    
    setIsUpdatingStatus(true);
    try {
      await updateStatus.mutateAsync({
        id_fair: fairToToggle.id_fair,
        status: !fairToToggle.status
      });
      showSuccess(`La feria ha sido ${fairToToggle.status ? 'inactivada' : 'activada'} exitosamente.`);
      setShowConfirmationModal(false);
      setFairToToggle(null);
    } catch (error) {
      console.error('Error actualizando el estado de la feria:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cancelToggleStatus = () => {
    setShowConfirmationModal(false);
    setFairToToggle(null);
  };

  const handleToggleArchiveClick = (fair: Fair) => {
    setFairToArchive(fair);
    setShowArchiveModal(true);
  };

  const confirmToggleArchive = async () => {
    if (!fairToArchive) return;

    setIsUpdatingArchived(true);
    try {
      await updateArchived.mutateAsync({
        id_fair: fairToArchive.id_fair,
        archived: !fairToArchive.archived,
      });
      showSuccess(`La feria ha sido ${fairToArchive.archived ? 'restaurada' : 'archivada'} exitosamente.`);
      setShowArchiveModal(false);
      setFairToArchive(null);
    } catch (error) {
      console.error('Error actualizando el estado de archivo de la feria:', error);
    } finally {
      setIsUpdatingArchived(false);
    }
  };

  const cancelToggleArchive = () => {
    setShowArchiveModal(false);
    setFairToArchive(null);
  };

  const handleViewDetails = (fair: Fair) => {
    setSelectedFair(fair);
    setShowDetailsModal(true);
  };
  
  const renderFairDate = (dateString: string): string => {
    if (!dateString) return 'Sin fecha asignada';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} ${timeStr}`;
    } catch {
      return 'Fecha inválida';
    }
  };

  const filteredFairs = useMemo(() => {
    if (!fairs) return [];
    
    const sortedFairs = [...fairs].sort((a, b) => b.id_fair - a.id_fair);
    
    return sortedFairs.filter(fair => {
      const matchesSearch = fair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fair.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fair.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && fair.status) ||
                           (statusFilter === 'inactive' && !fair.status);
      
      return matchesSearch && matchesStatus;
    });
  }, [fairs, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredFairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFairs = filteredFairs.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.querySelector('.fairs-dashboard__main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (isLoading || error) {
    return (
      <ListState
        isLoading={isLoading}
        error={error}
        loadingText="Cargando ferias..."
        errorTitle="No se pudieron cargar las ferias"
        errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
        onRetry={refetch}
      />
    );
  }

  if (!fairs || fairs.length === 0) {
    return <EmptyState recurso="ferias" genero="f" />;
  }

  if (filteredFairs.length === 0) {
    return (
      <div>
        {/* Resumen de Estadísticas */}
        <div className="fairs-list__stats">
          <div className="fairs-list__stat-card fairs-list__stat-card--total">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--total">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--total">Total de Ferias</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--total">{fairs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="fairs-list__stat-card fairs-list__stat-card--active">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--active">Ferias Activas</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--active">{fairs.filter(fair => fair.status).length}</p>
              </div>
            </div>
          </div>
          
          <div className="fairs-list__stat-card fairs-list__stat-card--inactive">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--inactive">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--inactive">Ferias Inactivas</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--inactive">{fairs.filter(fair => !fair.status).length}</p>
              </div>
            </div>
          </div>
        </div>

        <EmptyState recurso="ferias" genero="f" />
      </div>
    );
  }

  const statusToggleCopy = fairToToggle
    ? copyToggleActive({
        resourceWord: 'feria',
        resourcePhrase: 'la feria',
        name: fairToToggle.name,
        turningOff: fairToToggle.status,
        offDetail: 'Los usuarios no podrán inscribirse hasta que la reactives.',
        onDetail: 'Los usuarios podrán inscribirse de inmediato.',
      })
    : { title: '', message: '', confirmText: '' };

  const archiveCopy = fairToArchive
    ? copyArchive({
        resourceWord: 'feria',
        resourcePhrase: 'la feria',
        name: fairToArchive.name,
        unarchiving: fairToArchive.archived,
        unarchiveDetail: 'Volverá a estar visible en la lista principal.',
        archiveDetail: 'Dejará de mostrarse en la lista principal.',
      })
    : { title: '', message: '', confirmText: '' };

  return (
    <div className="fairs-list">
      {/* Modal de Confirmación */}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelToggleStatus}
        onConfirm={confirmToggleStatus}
        title={statusToggleCopy.title}
        message={statusToggleCopy.message}
        confirmText={statusToggleCopy.confirmText}
        cancelText="Cancelar"
        type={fairToToggle?.status ? "warning" : "info"}
        isLoading={isUpdatingStatus}
      />

      {/* Modal de Confirmación de Archivo */}
      <ConfirmationModal
        show={showArchiveModal}
        onClose={cancelToggleArchive}
        onConfirm={confirmToggleArchive}
        title={archiveCopy.title}
        message={archiveCopy.message}
        confirmText={archiveCopy.confirmText}
        cancelText="Cancelar"
        type={fairToArchive?.archived ? "info" : "warning"}
        isLoading={isUpdatingArchived}
      />

      {/* Modal de Detalles Completos */}
      <GenericModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedFair(null);
        }}
        title={`Detalles de la Feria: ${selectedFair?.name || ''}`}
        size="lg"
      >
        {selectedFair && (
          <div className="fairs-list__details-modal">
            <div className="fairs-list__details-section">
              <h4 className="fairs-list__details-section-title">Información General</h4>
              <div className="fairs-list__details-grid">
                <div className="fairs-list__details-item">
                  <span className="fairs-list__details-label">Nombre:</span>
                  <span className="fairs-list__details-value">{selectedFair.name}</span>
                </div>
                <div className="fairs-list__details-item">
                  <span className="fairs-list__details-label">Ubicación:</span>
                  <span className="fairs-list__details-value">{selectedFair.location}</span>
                </div>
                <div className="fairs-list__details-item">
                  <span className="fairs-list__details-label">Tipo:</span>
                  <span className="fairs-list__details-value">
                    Feria {selectedFair.typeFair === 'interna' ? 'Interna' : 'Externa'}
                  </span>
                </div>
                <div className="fairs-list__details-item">
                  <span className="fairs-list__details-label">Capacidad:</span>
                  <span className="fairs-list__details-value">{selectedFair.stand_capacity} stands</span>
                </div>
                <div className="fairs-list__details-item">
                  <span className="fairs-list__details-label">Estado:</span>
                  <span className={`fairs-list__details-status ${selectedFair.status ? 'fairs-list__details-status--active' : 'fairs-list__details-status--inactive'}`}>
                    {selectedFair.status ? '✓ Activa' : '✕ Inactiva'}
                  </span>
                </div>
                <div className="fairs-list__details-item">
                  <span className="fairs-list__details-label">Fecha:</span>
                  <span className="fairs-list__details-value">
                    {selectedFair.date ? new Date(selectedFair.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Sin fecha asignada'}
                  </span>
                </div>
              </div>
            </div>

            <div className="fairs-list__details-section">
              <h4 className="fairs-list__details-section-title">Descripción</h4>
              <div className="fairs-list__details-item">
                <p className="fairs-list__details-description">{selectedFair.description}</p>
              </div>
            </div>

            <div className="fairs-list__details-section">
              <h4 className="fairs-list__details-section-title">Condiciones de Participación</h4>
              <div className="fairs-list__details-item">
                <p className="fairs-list__details-conditions">{selectedFair.conditions}</p>
              </div>
            </div>
          </div>
        )}
      </GenericModal>

      {/* Resumen de Estadísticas */}
      <div className="fairs-list__stats">
        <div className="fairs-list__stat-card fairs-list__stat-card--total">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--total">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--total">Total de Ferias</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--total">{fairs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="fairs-list__stat-card fairs-list__stat-card--active">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--active">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--active">Ferias Activas</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--active">{fairs.filter(fair => fair.status).length}</p>
            </div>
          </div>
        </div>
        
        <div className="fairs-list__stat-card fairs-list__stat-card--inactive">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--inactive">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--inactive">Ferias Inactivas</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--inactive">{fairs.filter(fair => !fair.status).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Tabla */}
      {viewMode === 'table' ? (
        <FairsTable
          data={currentFairs}
          onViewDetails={handleViewDetails}
          onToggleStatus={handleToggleStatusClick}
          onToggleArchive={handleToggleArchiveClick}
          isUpdatingStatus={updateStatus.isPending}
          isUpdatingArchived={updateArchived.isPending}
        />
      ) : (
      /* Grid de Ferias */
      <div className="fairs-list__grid">
        {currentFairs.map(fair => (
          <div key={fair.id_fair} className="fairs-list__card">
            {/* Encabezado */}
            <div className="fairs-list__card-header">
              <div className="fairs-list__card-title-row">
                <h3 className="fairs-list__card-title">{fair.name}</h3>
                <span className={`fairs-list__card-status ${fair.status ? 'fairs-list__card-status--active' : 'fairs-list__card-status--inactive'}`}>
                  {fair.status ? '✓ Activa' : '✕ Inactiva'}
                </span>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="fairs-list__card-body">
              {/* Info */}
              <div className="fairs-list__card-info-section">
                <div className="fairs-list__card-info">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="fairs-list__card-info-text">{fair.location}</span>
                </div>
                <div className="fairs-list__card-info">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="fairs-list__card-info-text">Feria {fair.typeFair === 'interna' ? 'Interna' : 'Externa'}</span>
                </div>
                <div className="fairs-list__card-info">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="fairs-list__card-info-text">{renderFairDate(fair.date)}</span>
                </div>
                <div className="fairs-list__card-info">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="fairs-list__card-info-text">{fair.stand_capacity} stands disponibles</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="fairs-list__card-actions">
                <button
                  onClick={() => handleViewDetails(fair)}
                  className="fairs-list__details-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalles
                </button>

                <div className="fairs-list__action-buttons">
                  <EditFairButton fair={fair} />
                  <StandsInfoButton fair={fair} />
                </div>

                <div className="fairs-list__action-buttons">
                  <button
                    onClick={() => handleToggleStatusClick(fair)}
                    disabled={updateStatus.isPending}
                    className={`fairs-list__toggle-btn ${fair.status ? 'fairs-list__toggle-btn--active' : 'fairs-list__toggle-btn--inactive'} ${updateStatus.isPending ? 'fairs-list__toggle-btn--loading' : ''}`}
                  >
                    {updateStatus.isPending ? (
                      <>
                        <svg className="fairs-list__toggle-spinner" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {fair.status ? 'Desactivar' : 'Activar'}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleArchiveClick(fair)}
                    disabled={updateArchived.isPending}
                    className={`fairs-list__archive-btn ${fair.archived ? 'fairs-list__archive-btn--unarchive' : ''} ${updateArchived.isPending ? 'fairs-list__archive-btn--loading' : ''}`}
                  >
                    {updateArchived.isPending ? (
                      <>
                        <svg className="fairs-list__toggle-spinner" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        {fair.archived ? 'Desarchivar' : 'Archivar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="fairs-list__pagination">
          <div className="fairs-list__pagination-btns">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="fairs-list__pagination-btn fairs-list__pagination-btn--nav"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {currentPage > 3 && totalPages > 5 && (
              <>
                <button onClick={() => handlePageChange(1)} className="fairs-list__pagination-number">1</button>
                <span className="fairs-list__pagination-ellipsis">…</span>
              </>
            )}

            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`fairs-list__pagination-number${currentPage === page ? ' fairs-list__pagination-number--active' : ''}`}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="fairs-list__pagination-ellipsis">…</span>
                <button onClick={() => handlePageChange(totalPages)} className="fairs-list__pagination-number">{totalPages}</button>
              </>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="fairs-list__pagination-btn fairs-list__pagination-btn--nav"
            >
              Siguiente
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <span className="fairs-list__pagination-info">
            {`${startIndex + 1}–${Math.min(endIndex, filteredFairs.length)} de ${filteredFairs.length}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default FairsList;