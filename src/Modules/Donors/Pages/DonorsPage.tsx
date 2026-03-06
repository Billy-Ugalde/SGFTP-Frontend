import { useMemo, useState } from 'react';
import { HandHeart } from 'lucide-react';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import AddDonorButton from '../Components/AddDonorButton';
import AddDonorForm from '../Components/AddDonorForm';
import DonorList from '../Components/DonorList.tsx';
import EditDonorForm from '../Components/EditDonorForm.tsx';
import DonorDetailsModal from '../Components/DonorDetailsModal.tsx';
import {
  getDonorFullName,
  humanizeEnum,
  useCreateDonor,
  useDonors,
  useUpdateDonor,
  type CreateDonorDto,
  type Donor,
  type UpdateDonorDto,
} from '../Services/DonorService';
import '../Styles/DonorsPage.css';

type MainSection = 'donors' | 'donations';

const DonorsPage = () => {
  const [activeSection, setActiveSection] = useState<MainSection>('donors');
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: donors = [], isLoading: loadingDonors, error } = useDonors();
  const createDonorMutation = useCreateDonor();
  const updateDonorMutation = useUpdateDonor();

  const filteredDonors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = donors.filter((donor) => {
      if (!term) return true;

      const fullName = getDonorFullName(donor).toLowerCase();
      const email = (donor.Email || '').toLowerCase();
      const phone = (donor.Phone || '').toLowerCase();
      const details = (donor.Donation_details || '').toLowerCase();
      const donationType = humanizeEnum(donor.Donation_type).toLowerCase();
      const interest = humanizeEnum(donor.Interest).toLowerCase();

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        details.includes(term) ||
        donationType.includes(term) ||
        interest.includes(term)
      );
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.Created_at).getTime();
      const dateB = new Date(b.Created_at).getTime();
      return dateB - dateA;
    });
  }, [donors, searchTerm]);

  const stats = useMemo(() => {
    const archived = filteredDonors.filter((d) => d.archived).length;
    return {
      total: filteredDonors.length,
      active: filteredDonors.length - archived,
      archived,
    };
  }, [filteredDonors]);

  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDonors = filteredDonors.slice(startIndex, startIndex + itemsPerPage);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }

    return pages;
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateDonor = async (data: CreateDonorDto) => {
    try {
      await createDonorMutation.mutateAsync(data);
      setCurrentPage(1);
      setShowAddModal(false);
      showMessage('success', 'Donador creado exitosamente');
    } catch (e: any) {
      if (e?.response?.status === 409) {
        showMessage('error', 'Ya existe un donador con esos datos');
      } else if (e?.response?.status === 400) {
        showMessage('error', 'Los datos enviados son inválidos');
      } else {
        showMessage('error', 'Error al crear el donador');
      }
    }
  };

  const handleUpdateDonor = async (id: number, data: UpdateDonorDto) => {
    try {
      await updateDonorMutation.mutateAsync({ id, data });
      setShowEditModal(false);
      setSelectedDonor(null);
      showMessage('success', 'Donador actualizado exitosamente');
    } catch (e: any) {
      if (e?.response?.status === 400) {
        showMessage('error', 'Los datos enviados son inválidos');
      } else {
        showMessage('error', 'Error al actualizar el donador');
      }
      throw e;
    }
  };

  const handleViewDonor = (donor: Donor) => {
    setSelectedDonor(donor);
    setShowDetailsModal(true);
  };

  const handleEditDonor = (donor: Donor) => {
    setSelectedDonor(donor);
    setShowEditModal(true);
  };

  return (
    <div className="donors-dashboard">
      <div className="donors-dashboard__header">
        <div className="donors-dashboard__header-container">
          <div className="donors-dashboard__title-section">
            <div className="donors-dashboard__title-row">
              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    backgroundColor: '#4CAF8C',
                    color: 'white',
                    width: '72px',
                    height: '72px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '16px',
                  }}
                >
                  <HandHeart size={32} strokeWidth={2} />
                </div>
                <h1 className="donors-dashboard__title">Gestión de Donadores</h1>
              </div>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingLeft: '80px' }}>
                <BackToDashboardButton />
              </div>
            </div>

            <p className="donors-dashboard__description">
              Administra el registro de{' '}
              <span className="donors-dashboard__foundation-name">Fundación Tamarindo Park</span>. Crea, edita y consulta
              información de donadores y donaciones.
            </p>
          </div>
        </div>
      </div>

      <div className="donors-dashboard__main">
        <div className="donors-dashboard__section-tabs">
          <button
            className={`donors-dashboard__section-tab ${activeSection === 'donors' ? 'donors-dashboard__section-tab--active' : ''}`}
            onClick={() => setActiveSection('donors')}
          >
            Donadores
          </button>
          <button
            className={`donors-dashboard__section-tab ${activeSection === 'donations' ? 'donors-dashboard__section-tab--active' : ''}`}
            onClick={() => setActiveSection('donations')}
          >
            Donaciones
          </button>
        </div>

        {activeSection === 'donations' ? (
          <div className="donors-list__empty">
            <div className="donors-list__empty-icon">💳</div>
            <h3>Sección de donaciones</h3>
            <p>Esta sección se implementará después. Por ahora, gestiona los donadores en la pestaña anterior.</p>
          </div>
        ) : (
          <>
            <div className="donors-dashboard__action-bar">
              <div className="donors-dashboard__action-content">
                <div className="donors-dashboard__directory-header">
                  <h2 className="donors-dashboard__directory-title">Lista de Donadores</h2>
                  <p className="donors-dashboard__directory-description">
                    Gestiona y supervisa el registro de donadores
                  </p>
                </div>

                <div className="donors-dashboard__controls">
                  <div className="donors-dashboard__controls-row">
                    <div className="donors-dashboard__search-wrapper">
                      <div className="donors-dashboard__search-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar donadores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="donors-dashboard__search-input"
                      />
                    </div>

                    <AddDonorButton onClick={() => setShowAddModal(true)} />
                  </div>
                </div>
              </div>
            </div>

            {actionMessage && (
              <div className={`donors-list__message donors-list__message--${actionMessage.type}`}>
                {actionMessage.text}
              </div>
            )}

            <div className="donors-list__stats">
              <div className="donors-list__stat-card donors-list__stat-card--total">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--total">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--total">Total Donadores</p>
                    <p className="donors-list__stat-value donors-list__stat-value--total">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="donors-list__stat-card donors-list__stat-card--active">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--active">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--active">Activos</p>
                    <p className="donors-list__stat-value donors-list__stat-value--active">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="donors-list__stat-card donors-list__stat-card--archived">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--archived">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7m16 0L12 11 4 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--archived">Archivados</p>
                    <p className="donors-list__stat-value donors-list__stat-value--archived">{stats.archived}</p>
                  </div>
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="donors-list__pagination-info">
                <p className="donors-list__results-text">
                  Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDonors.length)} de{' '}
                  {filteredDonors.length} donadores
                </p>
              </div>
            )}

            {loadingDonors ? (
              <div className="donors-list__loading">
                <div className="donors-list__loading-spinner" />
                <p>Cargando donadores...</p>
              </div>
            ) : error ? (
              <div className="donors-list__error">
                <div className="donors-list__error-icon">⚠️</div>
                <h3>Error al cargar los donadores</h3>
                <p>{error.message}</p>
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="donors-list__empty">
                <div className="donors-list__empty-icon">📋</div>
                <h3>No se encontraron donadores</h3>
                <p>No hay donadores que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <>
                <DonorList donors={currentDonors} onView={handleViewDonor} onEdit={handleEditDonor} />

                {totalPages > 1 && (
                  <div className="donors-list__pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="donors-list__pagination-btn donors-list__pagination-btn--prev"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </button>

                    <div className="donors-list__pagination-numbers">
                      {currentPage > 3 && totalPages > 5 && (
                        <>
                          <button onClick={() => handlePageChange(1)} className="donors-list__pagination-number">
                            1
                          </button>
                          <span className="donors-list__pagination-ellipsis">...</span>
                        </>
                      )}

                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`donors-list__pagination-number ${currentPage === page ? 'donors-list__pagination-number--active' : ''}`}
                        >
                          {page}
                        </button>
                      ))}

                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <>
                          <span className="donors-list__pagination-ellipsis">...</span>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="donors-list__pagination-number"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="donors-list__pagination-btn donors-list__pagination-btn--next"
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
          </>
        )}
      </div>

      {showAddModal && <AddDonorForm onSubmit={handleCreateDonor} onCancel={() => setShowAddModal(false)} />}

      {showEditModal && selectedDonor && (
        <EditDonorForm
          donor={selectedDonor}
          onSubmit={handleUpdateDonor}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedDonor(null);
          }}
        />
      )}

      <DonorDetailsModal
        donor={selectedDonor}
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDonor(null);
        }}
      />

      <div className="donors-dashboard__footer">
        <div className="donors-dashboard__footer-container">
          <div className="donors-dashboard__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorsPage;

