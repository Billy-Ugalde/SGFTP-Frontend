import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useEntrepreneurs, useToggleEntrepreneurActive } from '../Services/EntrepreneursServices';
import type { Entrepreneur } from '../Types';
import EntrepreneurDetailsModal from './EntrepreneurDetailsModal';
import EditEntrepreneurButton from './EditEntrepreneurButton';
import EditEntrepreneurForm from './EditEntrepreneurForm';
import GenericModal from './GenericModal';
import ApprovedEntrepreneursTable from './ApprovedEntrepreneursTable';
import '../Styles/ApprovedEntrepreneursList.css';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { copyToggleActive } from '../../Shared/utils/confirmationCopy';
import { ListState, useSuccessAlert, EmptyState } from '../../Shared/components';
import { formatPhoneForDisplay } from '../../../shared/utils/phone.utils';

interface ApprovedEntrepreneursListProps {
  searchTerm?: string;
  selectedCategory?: string;
  statusFilter?: 'all' | 'active' | 'inactive';
  viewMode?: 'cards' | 'table';
}

const ApprovedEntrepreneursList = ({ searchTerm = '', selectedCategory = '', statusFilter = 'all', viewMode = 'cards' }: ApprovedEntrepreneursListProps) => { // <--- VALOR PREDETERMINADO
  const { data: entrepreneurs, isLoading, error, refetch } = useEntrepreneurs();
  const toggleActive = useToggleEntrepreneurActive();

  const [pendingToggles, setPendingToggles] = useState<Record<number, boolean>>({});

  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [entrepreneurToToggle, setEntrepreneurToToggle] = useState<Entrepreneur | null>(null);
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
    setShowEditModal(false);
  };

  const handleEditClick = (entrepreneur: Entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEntrepreneur(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
  };

  const handleToggleActiveClick = (entrepreneur: Entrepreneur) => {
    setEntrepreneurToToggle(entrepreneur);
    setShowConfirmationModal(true);
  };

  const confirmToggleActive = async () => {
    if (!entrepreneurToToggle) return;

    setIsProcessing(true);
    setPendingToggles(prev => ({ ...prev, [entrepreneurToToggle.id_entrepreneur!]: true }));

    try {
      await toggleActive.mutateAsync({
        id_entrepreneur: entrepreneurToToggle.id_entrepreneur!,
        active: !entrepreneurToToggle.is_active
      });
      const action = entrepreneurToToggle.is_active ? 'inactivado' : 'activado';
      showSuccess(`Emprendedor ${action} exitosamente`);
      setShowConfirmationModal(false);
      setEntrepreneurToToggle(null);
    } catch (error) {
      const action = entrepreneurToToggle.is_active ? 'inactivar' : 'activar';
      showError(`Error al ${action} el emprendedor`);
    } finally {
      setIsProcessing(false);
      setPendingToggles(prev => ({ ...prev, [entrepreneurToToggle.id_entrepreneur!]: false }));
    }
  };

  const cancelToggleActive = () => {
    setShowConfirmationModal(false);
    setEntrepreneurToToggle(null);
  };

  const filteredEntrepreneurs = useMemo(() => {
    if (!entrepreneurs) return [];

    const sortedEntrepreneurs = [...entrepreneurs].sort((a, b) => {
      const dateA = new Date(a.registration_date || '').getTime();
      const dateB = new Date(b.registration_date || '').getTime();
      return dateB - dateA;
    });

    return sortedEntrepreneurs.filter(entrepreneur => {
      const fullName = `${entrepreneur.person?.first_name} ${entrepreneur.person?.first_lastname}`.toLowerCase();
      const entrepreneurshipName = entrepreneur.entrepreneurship?.name?.toLowerCase() || '';
      const email = entrepreneur.person?.email?.toLowerCase() || '';

      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
        entrepreneurshipName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || entrepreneur.entrepreneurship?.category === selectedCategory;

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && entrepreneur.is_active) ||
        (statusFilter === 'inactive' && !entrepreneur.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [entrepreneurs, searchTerm, selectedCategory, statusFilter]);


  const stats = useMemo(() => {
    if (!entrepreneurs) return { total: 0, active: 0, inactive: 0 };

    const entrepreneursByCategory = entrepreneurs.filter(e => !selectedCategory || e.entrepreneurship?.category === selectedCategory);

    return {
      total: entrepreneursByCategory.length,
      active: entrepreneursByCategory.filter(e => e.is_active).length,
      inactive: entrepreneursByCategory.filter(e => !e.is_active).length,
    };
  }, [entrepreneurs, selectedCategory]);

  const totalPages = Math.ceil(filteredEntrepreneurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEntrepreneurs = filteredEntrepreneurs.slice(startIndex, startIndex + itemsPerPage);


  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        loadingText="Cargando emprendedores..."
        errorTitle="No se pudieron cargar los emprendedores"
        errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
        onRetry={refetch}
      />
    );
  }

  if (filteredEntrepreneurs.length === 0) {
    return (
      <div>
        {entrepreneurs && entrepreneurs.length > 0 && (
          <div className="approved-entrepreneurs__stats">
            <div className="approved-entrepreneurs__stat-card approved-entrepreneurs__stat-card--total">
              <div className="approved-entrepreneurs__stat-content">
                <div className="approved-entrepreneurs__stat-icon approved-entrepreneurs__stat-icon--total">
                  <Users strokeWidth={1.75} />
                </div>
                <div>
                  <p className="approved-entrepreneurs__stat-label approved-entrepreneurs__stat-label--total">Total Emprendedores</p>
                  <p className="approved-entrepreneurs__stat-value approved-entrepreneurs__stat-value--total">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="approved-entrepreneurs__stat-card approved-entrepreneurs__stat-card--active">
              <div className="approved-entrepreneurs__stat-content">
                <div className="approved-entrepreneurs__stat-icon approved-entrepreneurs__stat-icon--active">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="approved-entrepreneurs__stat-label approved-entrepreneurs__stat-label--active">Activos</p>
                  <p className="approved-entrepreneurs__stat-value approved-entrepreneurs__stat-value--active">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="approved-entrepreneurs__stat-card approved-entrepreneurs__stat-card--inactive">
              <div className="approved-entrepreneurs__stat-content">
                <div className="approved-entrepreneurs__stat-icon approved-entrepreneurs__stat-icon--inactive">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="approved-entrepreneurs__stat-label approved-entrepreneurs__stat-label--inactive">Inactivos</p>
                  <p className="approved-entrepreneurs__stat-value approved-entrepreneurs__stat-value--inactive">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <EmptyState recurso="emprendedores" />
      </div>
    );
  }

  const entrepreneurToggleCopy = entrepreneurToToggle
    ? (() => {
        const entrepreneurName = `${entrepreneurToToggle.person?.first_name} ${entrepreneurToToggle.person?.first_lastname}`;
        const entrepreneurshipName = entrepreneurToToggle.entrepreneurship?.name || 'Sin nombre';
        return copyToggleActive({
          resourceWord: 'emprendedor',
          resourcePhrase: 'al emprendedor',
          name: entrepreneurshipName,
          turningOff: entrepreneurToToggle.is_active,
          offDetail: `Persona asociada: ${entrepreneurName}. No será visible en la sección informativa del sistema.`,
          onDetail: `Persona asociada: ${entrepreneurName}. Será visible en la sección informativa del sistema.`,
        });
      })()
    : { title: '', message: '', confirmText: '' };

  return (
    <div className="approved-entrepreneurs">
      {/* Confirmation modal*/}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelToggleActive}
        onConfirm={confirmToggleActive}
        title={entrepreneurToggleCopy.title}
        message={entrepreneurToggleCopy.message}
        confirmText={entrepreneurToggleCopy.confirmText}
        cancelText="Cancelar"
        type={entrepreneurToToggle?.is_active ? "warning" : "info"}
        isLoading={isProcessing}
      />

      {/* Action alert */}
      {actionMessage && (
        <div className={`approved-entrepreneurs__alert approved-entrepreneurs__alert--${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

      {/* Stats */}
      <div className="approved-entrepreneurs__stats">
        <div className="approved-entrepreneurs__stat-card approved-entrepreneurs__stat-card--total">
          <div className="approved-entrepreneurs__stat-content">
            <div className="approved-entrepreneurs__stat-icon approved-entrepreneurs__stat-icon--total">
              <Users strokeWidth={1.75} />
            </div>
            <div>
              <p className="approved-entrepreneurs__stat-label approved-entrepreneurs__stat-label--total">Total Emprendedores</p>
              <p className="approved-entrepreneurs__stat-value approved-entrepreneurs__stat-value--total">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="approved-entrepreneurs__stat-card approved-entrepreneurs__stat-card--active">
          <div className="approved-entrepreneurs__stat-content">
            <div className="approved-entrepreneurs__stat-icon approved-entrepreneurs__stat-icon--active">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="approved-entrepreneurs__stat-label approved-entrepreneurs__stat-label--active">Activos</p>
              <p className="approved-entrepreneurs__stat-value approved-entrepreneurs__stat-value--active">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="approved-entrepreneurs__stat-card approved-entrepreneurs__stat-card--inactive">
          <div className="approved-entrepreneurs__stat-content">
            <div className="approved-entrepreneurs__stat-icon approved-entrepreneurs__stat-icon--inactive">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="approved-entrepreneurs__stat-label approved-entrepreneurs__stat-label--inactive">Inactivos</p>
              <p className="approved-entrepreneurs__stat-value approved-entrepreneurs__stat-value--inactive">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="approved-entrepreneurs__grid">
          {currentEntrepreneurs.map(entrepreneur => {
            const approachBadge = getApproachBadge(entrepreneur.entrepreneurship?.approach || 'social');
            const isActive = entrepreneur.is_active;
            const isToggling = pendingToggles[entrepreneur.id_entrepreneur!] || isProcessing;

            return (
              <div key={entrepreneur.id_entrepreneur} className="approved-entrepreneurs__card">
                <div className="approved-entrepreneurs__card-header">
                  <div className="approved-entrepreneurs__card-title-row">
                    <div className="approved-entrepreneurs__card-info">
                      <h3 className="approved-entrepreneurs__card-name">
                        {entrepreneur.person?.first_name} {entrepreneur.person?.first_lastname}
                      </h3>
                      <span className={`approved-entrepreneurs__card-status ${isActive ? 'approved-entrepreneurs__card-status--active' : 'approved-entrepreneurs__card-status--inactive'}`}>
                        {isActive ? '✓ Activo' : '✕ Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="approved-entrepreneurs__card-contact">
                    <p className="approved-entrepreneurs__card-email"> {entrepreneur.person?.email}</p>
                    <p className="approved-entrepreneurs__card-phone">
                      {formatPhoneForDisplay(entrepreneur.person?.phone_primary) || 'No registrado'}
                      {entrepreneur.person?.phone_secondary && `, ${formatPhoneForDisplay(entrepreneur.person.phone_secondary)}`}
                    </p>
                  </div>
                </div>

                <div className="approved-entrepreneurs__card-body">
                  <div className="approved-entrepreneurs__card-entrepreneurship">
                    <div className="approved-entrepreneurs__card-entrepreneurship-header">
                      <span className="approved-entrepreneurs__card-category-icon">
                        {getCategoryIcon(entrepreneur.entrepreneurship?.category || '')}
                      </span>
                      <h4 className="approved-entrepreneurs__card-entrepreneurship-name">
                        {entrepreneur.entrepreneurship?.name}
                      </h4>
                    </div>

                    <div className="approved-entrepreneurs__card-badges">
                      <span className="approved-entrepreneurs__card-category-badge">
                        {entrepreneur.entrepreneurship?.category}
                      </span>
                      <span
                        className="approved-entrepreneurs__card-approach-badge"
                        style={{ backgroundColor: approachBadge.bg, color: approachBadge.color }}
                      >
                        {approachBadge.label}
                      </span>
                    </div>

                  </div>

                  <div className="approved-entrepreneurs__card-actions">
                    <button
                      onClick={() => handleViewDetails(entrepreneur)}
                      className="approved-entrepreneurs__details-btn"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalles
                    </button>

                    <div className="approved-entrepreneurs__action-buttons">
                      <EditEntrepreneurButton entrepreneur={entrepreneur} onClick={() => handleEditClick(entrepreneur)} />

                      <button
                        onClick={() => handleToggleActiveClick(entrepreneur)}
                        disabled={isToggling}
                        className={`approved-entrepreneurs__toggle-btn ${isActive ? 'approved-entrepreneurs__toggle-btn--active' : 'approved-entrepreneurs__toggle-btn--inactive'} ${isToggling ? 'approved-entrepreneurs__toggle-btn--loading' : ''}`}
                        title={isActive ? 'Inactivar emprendedor' : 'Activar emprendedor'}
                      >
                        {isToggling ? (
                          <>
                            <svg className="approved-entrepreneurs__toggle-spinner" fill="none" viewBox="0 0 24 24">
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
                            {isActive ? 'Inactivar' : 'Activar'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ApprovedEntrepreneursTable
          data={currentEntrepreneurs}
          onViewDetails={handleViewDetails}
          onEdit={handleEditClick}
          onToggleActive={handleToggleActiveClick}
        />)}


      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="approved-entrepreneurs__pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="approved-entrepreneurs__pagination-btn approved-entrepreneurs__pagination-btn--prev"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <div className="approved-entrepreneurs__pagination-numbers">
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="approved-entrepreneurs__pagination-number"
                >
                  1
                </button>
                <span className="approved-entrepreneurs__pagination-ellipsis">...</span>
              </>
            )}

            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`approved-entrepreneurs__pagination-number ${currentPage === page ? 'approved-entrepreneurs__pagination-number--active' : ''}`}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="approved-entrepreneurs__pagination-ellipsis">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="approved-entrepreneurs__pagination-number"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="approved-entrepreneurs__pagination-btn approved-entrepreneurs__pagination-btn--next"
          >
            Siguiente
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span className="approved-entrepreneurs__pagination-info">
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

      {/* Edit Modal */}
      {selectedEntrepreneur && showEditModal && (
        <GenericModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          title={`Editar: ${selectedEntrepreneur.person?.first_name} ${selectedEntrepreneur.person?.first_lastname}`}
          size="xl"
          maxHeight
        >
          <EditEntrepreneurForm
            entrepreneur={selectedEntrepreneur}
            onSuccess={handleEditSuccess}
          />
        </GenericModal>
      )}
    </div>
  );
};

export default ApprovedEntrepreneursList;