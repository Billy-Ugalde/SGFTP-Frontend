import { useState, useMemo } from 'react';
import { useVolunteers, useToggleVolunteerActive } from '../Services/VolunteersServices';
import VolunteersTable from './VolunteersTable';
import type { Volunteer } from '../Types';
import '../Styles/VolunteersList.css';
import VolunteerDetailsModal from './VolunteerDetailsModal';
import GenericModal from './GenericModal';
import EditVolunteerForm from './EditVolunteerForm';
import ConfirmationModal from '../../Fairs/Components/ConfirmationModal';

interface VolunteersListProps {
  searchTerm?: string;
  statusFilter?: 'all' | 'active' | 'inactive';
}

const VolunteersList = ({
  searchTerm = '',
  statusFilter = 'all'
}: VolunteersListProps) => {
  const { data: volunteers, isLoading, error } = useVolunteers();
  const toggleVolunteerActive = useToggleVolunteerActive();

  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [volunteerToToggle, setVolunteerToToggle] = useState<Volunteer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      
      setShowConfirmationModal(false);
      setVolunteerToToggle(null);
    } catch (error: any) {
      console.error('Error al cambiar estado del voluntario:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelToggleActive = () => {
    setShowConfirmationModal(false);
    setVolunteerToToggle(null);
  };

  
  const buildConfirmationMessage = (volunteer: Volunteer) => {
    const action = volunteer.is_active ? 'inactivar' : 'activar';
    const volunteerName = `${volunteer.person?.first_name || ''} ${volunteer.person?.first_lastname || ''}`.trim();

    if (volunteer.is_active) {
      return `Se ${action}á al voluntario "${volunteerName}".`;
    } else {
      return `Se ${action}á al voluntario "${volunteerName}".`;
    }
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

  if (isLoading) {
    return (
      <div className="volunteers-list__loading">
        <div className="volunteers-list__loading-content">
          <svg className="volunteers-list__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando voluntarios...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volunteers-list__error">
        <svg className="volunteers-list__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="volunteers-list__error-title">Error al cargar los voluntarios</h3>
        <p className="volunteers-list__error-text">Por favor intenta refrescar la página</p>
      </div>
    );
  }

  if (filteredVolunteers.length === 0) {
    return (
      <div>
        {volunteers && volunteers.length > 0 && (
          <div className="volunteers-list__stats">
            <div className="volunteers-list__stat-card volunteers-list__stat-card--total">
              <div className="volunteers-list__stat-content">
                <div className="volunteers-list__stat-icon volunteers-list__stat-icon--total">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="volunteers-list__stat-label volunteers-list__stat-label--total">Total Voluntarios</p>
                  <p className="volunteers-list__stat-value volunteers-list__stat-value--total">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="volunteers-list__stat-card volunteers-list__stat-card--active">
              <div className="volunteers-list__stat-content">
                <div className="volunteers-list__stat-icon volunteers-list__stat-icon--active">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="volunteers-list__stat-label volunteers-list__stat-label--active">Activos</p>
                  <p className="volunteers-list__stat-value volunteers-list__stat-value--active">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="volunteers-list__stat-card volunteers-list__stat-card--inactive">
              <div className="volunteers-list__stat-content">
                <div className="volunteers-list__stat-icon volunteers-list__stat-icon--inactive">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="volunteers-list__stat-label volunteers-list__stat-label--inactive">Inactivos</p>
                  <p className="volunteers-list__stat-value volunteers-list__stat-value--inactive">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="volunteers-list__empty">
          <div className="volunteers-list__empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="volunteers-list__empty-title">No se encontraron voluntarios</h3>
          <p className="volunteers-list__empty-text">
            No hay voluntarios que coincidan con los filtros aplicados. Intenta ajustar tu búsqueda o filtro de estado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteers-list">
      {/* Modal de confirmación */}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelToggleActive}
        onConfirm={confirmToggleActive}
        title={volunteerToToggle?.is_active ? "¿Inactivar voluntario?" : "¿Activar voluntario?"}
        message={volunteerToToggle ? buildConfirmationMessage(volunteerToToggle) : ''}
        confirmText={volunteerToToggle?.is_active ? "Sí, inactivar" : "Sí, activar"}
        cancelText="Cancelar"
        type={volunteerToToggle?.is_active ? "warning" : "info"}
        isLoading={isProcessing}
      />

      {/* Stats */}
      <div className="volunteers-list__stats">
        <div className="volunteers-list__stat-card volunteers-list__stat-card--total">
          <div className="volunteers-list__stat-content">
            <div className="volunteers-list__stat-icon volunteers-list__stat-icon--total">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="volunteers-list__stat-label volunteers-list__stat-label--total">Total Voluntarios</p>
              <p className="volunteers-list__stat-value volunteers-list__stat-value--total">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="volunteers-list__stat-card volunteers-list__stat-card--active">
          <div className="volunteers-list__stat-content">
            <div className="volunteers-list__stat-icon volunteers-list__stat-icon--active">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="volunteers-list__stat-label volunteers-list__stat-label--active">Activos</p>
              <p className="volunteers-list__stat-value volunteers-list__stat-value--active">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="volunteers-list__stat-card volunteers-list__stat-card--inactive">
          <div className="volunteers-list__stat-content">
            <div className="volunteers-list__stat-icon volunteers-list__stat-icon--inactive">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="volunteers-list__stat-label volunteers-list__stat-label--inactive">Inactivos</p>
              <p className="volunteers-list__stat-value volunteers-list__stat-value--inactive">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination info */}
      {totalPages > 1 && (
        <div className="volunteers-list__pagination-info">
          <p className="volunteers-list__results-text">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredVolunteers.length)} de {filteredVolunteers.length} voluntarios
          </p>
        </div>
      )}

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
        </div>
      )}

      {/* Details Modal */}
      <VolunteerDetailsModal
        volunteer={selectedVolunteer}
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedVolunteer(null);
        }}
      />

      {/* Edit Modal */}
      {selectedVolunteer && showEditModal && (
        <GenericModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          title={`Editar: ${selectedVolunteer.person?.first_name} ${selectedVolunteer.person?.first_lastname}`}
          size="lg"
          maxHeight
          closeOnBackdrop={false}
        >
          <EditVolunteerForm
            volunteer={selectedVolunteer}
            onSuccess={handleCloseEditModal}
          />
        </GenericModal>
      )}
    </div>
  );
};

export default VolunteersList;