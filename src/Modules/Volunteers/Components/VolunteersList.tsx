import { useState, useMemo, lazy, Suspense } from 'react';
import { Users } from 'lucide-react';
import { useVolunteers, useToggleVolunteerActive } from '../Services/VolunteersServices';
import VolunteersTable from './VolunteersTable';
import type { Volunteer } from '../Types';
import '../Styles/VolunteersList.css';
import GenericModal from './GenericModal';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';

const VolunteerDetailsModal = lazy(() => import('./VolunteerDetailsModal'));
const EditVolunteerForm = lazy(() => import('./EditVolunteerForm'));
import { copyToggleActive } from '../../Shared/utils/confirmationCopy';
import { ListState, useSuccessAlert, EmptyState, StatCards } from '../../Shared/components';

interface VolunteersListProps {
  searchTerm?: string;
  statusFilter?: 'all' | 'active' | 'inactive';
}

const VolunteersList = ({
  searchTerm = '',
  statusFilter = 'all'
}: VolunteersListProps) => {
  const { data: volunteers, isLoading, error, refetch } = useVolunteers();
  const toggleVolunteerActive = useToggleVolunteerActive();

  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [volunteerToToggle, setVolunteerToToggle] = useState<Volunteer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'error'; text: string } | null>(null);
  const { showSuccess } = useSuccessAlert();

  const showError = (text: string) => {
    setActionMessage({ type: 'error', text });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleViewDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetailsModal(true);
    setShowEditModal(false);
  };

  const handleEditClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedVolunteer(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
  };

 
  const handleToggleActiveClick = (volunteer: Volunteer) => {
    setVolunteerToToggle(volunteer);
    setShowConfirmationModal(true);
  };

  const confirmToggleActive = async () => {
    if (!volunteerToToggle || !volunteerToToggle.id_volunteer) {
      setShowConfirmationModal(false);
      return;
    }

    setIsProcessing(true);

    try {
      await toggleVolunteerActive.mutateAsync({
        id_volunteer: volunteerToToggle.id_volunteer,
        is_active: !volunteerToToggle.is_active
      });
      const action = volunteerToToggle.is_active ? 'inactivado' : 'activado';
      showSuccess(`Voluntario ${action} exitosamente.`);
      setShowConfirmationModal(false);
      setVolunteerToToggle(null);
    } catch (error: any) {
      console.error('Error al cambiar estado del voluntario:', error);
      const action = volunteerToToggle.is_active ? 'inactivar' : 'activar';
      showError(`Error al ${action} el voluntario`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelToggleActive = () => {
    setShowConfirmationModal(false);
    setVolunteerToToggle(null);
  };

  
  const filteredVolunteers = useMemo(() => {
    if (!volunteers) return [];

    const sortedVolunteers = [...volunteers].sort((a, b) => {
      const dateA = new Date(a.registration_date || '').getTime();
      const dateB = new Date(b.registration_date || '').getTime();
      return dateB - dateA;
    });

    return sortedVolunteers.filter(volunteer => {
      const fullName = `${volunteer.person?.first_name ?? ''} ${volunteer.person?.second_name ?? ''} ${volunteer.person?.first_lastname ?? ''} ${volunteer.person?.second_lastname ?? ''}`.toLowerCase();
      const email = volunteer.person?.email?.toLowerCase() || '';

      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && volunteer.is_active) ||
        (statusFilter === 'inactive' && !volunteer.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!volunteers) return { total: 0, active: 0, inactive: 0 };

    return {
      total: volunteers.length,
      active: volunteers.filter(v => v.is_active).length,
      inactive: volunteers.filter(v => !v.is_active).length,
    };
  }, [volunteers]);

  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVolunteers = filteredVolunteers.slice(startIndex, startIndex + itemsPerPage);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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

  if (isLoading || error) {
    return (
      <ListState
        isLoading={isLoading}
        error={error}
        loadingText="Cargando voluntarios..."
        errorTitle="No se pudieron cargar los voluntarios"
        errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
        onRetry={refetch}
      />
    );
  }

  if (filteredVolunteers.length === 0) {
    return (
      <div>
        {volunteers && volunteers.length > 0 && (
          <StatCards stats={[
            { icon: <Users strokeWidth={1.75} />, label: 'Total Voluntarios', value: stats.total, variant: 'total' },
            { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Activos', value: stats.active, variant: 'active' },
            { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Inactivos', value: stats.inactive, variant: 'inactive' },
          ]} />
        )}

        <EmptyState recurso="voluntarios" />
      </div>
    );
  }

  const volunteerToggleCopy = volunteerToToggle
    ? copyToggleActive({
        resourceWord: 'voluntario',
        resourcePhrase: 'al voluntario',
        name: `${volunteerToToggle.person?.first_name || ''} ${volunteerToToggle.person?.first_lastname || ''}`.trim(),
        turningOff: volunteerToToggle.is_active,
        offDetail: 'Dejará de figurar como activo en el listado.',
        onDetail: 'Volverá a figurar como activo en el listado.',
      })
    : { title: '', message: '', confirmText: '' };

  return (
    <div className="volunteers-list">
      {/* Modal de confirmación */}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelToggleActive}
        onConfirm={confirmToggleActive}
        title={volunteerToggleCopy.title}
        message={volunteerToggleCopy.message}
        confirmText={volunteerToggleCopy.confirmText}
        cancelText="Cancelar"
        type={volunteerToToggle?.is_active ? "warning" : "info"}
        isLoading={isProcessing}
      />

      {/* Action alert */}
      {actionMessage && (
        <div className={`volunteers-list__alert volunteers-list__alert--${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

      {/* Stats */}
      <StatCards stats={[
        { icon: <Users strokeWidth={1.75} />, label: 'Total Voluntarios', value: stats.total, variant: 'total' },
        { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Activos', value: stats.active, variant: 'active' },
        { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Inactivos', value: stats.inactive, variant: 'inactive' },
      ]} />

      {/* Table */}
      <VolunteersTable
        data={currentVolunteers}
        onViewDetails={handleViewDetails}
        onEdit={handleEditClick}
        onToggleActive={handleToggleActiveClick}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="volunteers-list__pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="volunteers-list__pagination-btn volunteers-list__pagination-btn--prev"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <div className="volunteers-list__pagination-numbers">
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="volunteers-list__pagination-number"
                >
                  1
                </button>
                <span className="volunteers-list__pagination-ellipsis">...</span>
              </>
            )}

            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`volunteers-list__pagination-number ${currentPage === page ? 'volunteers-list__pagination-number--active' : ''}`}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="volunteers-list__pagination-ellipsis">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="volunteers-list__pagination-number"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="volunteers-list__pagination-btn volunteers-list__pagination-btn--next"
          >
            Siguiente
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span className="volunteers-list__pagination-info">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredVolunteers.length)} de {filteredVolunteers.length}
          </span>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <Suspense fallback={null}>
          <VolunteerDetailsModal
            volunteer={selectedVolunteer}
            show={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedVolunteer(null);
            }}
          />
        </Suspense>
      )}

      {/* Edit Modal */}
      {selectedVolunteer && showEditModal && (
        <GenericModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          title={`Editar: ${selectedVolunteer.person?.first_name} ${selectedVolunteer.person?.first_lastname}`}
          size="xl"
          maxHeight
          closeOnBackdrop={false}
        >
          <Suspense fallback={null}>
            <EditVolunteerForm
              volunteer={selectedVolunteer}
              onSuccess={handleEditSuccess}
            />
          </Suspense>
        </GenericModal>
      )}
    </div>
  );
};

export default VolunteersList;