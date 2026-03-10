import { useMemo, useState } from 'react';
import { HandHeart } from 'lucide-react';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import AddDonorButton from '../Components/AddDonorButton';
import AddDonorForm from '../Components/AddDonorForm';
import DonorList from '../Components/DonorList.tsx';
import EditDonorForm from '../Components/EditDonorForm.tsx';
import DonorDetailsModal from '../Components/DonorDetailsModal.tsx';
import ChangeDonationStatusModal from '../Components/ChangeDonationStatusModal';
import {
  getDonorFullName,
  useCreateDonation,
  useDonations,
  useUpdateDonation,
  useUpdateDonationStatus,
  useArchiveDonation,
  type CreateDonationDto,
  type Donation,
  type UpdateDonationDto,
  DonationTypeLabels,
  DonorInterestLabels,
  DonorType,
  DonorTypeLabels,
  ReadStatus,
  ReadStatusLabels,
} from '../Services/DonorService';
import '../Styles/DonorsPage.css';

type MainSection = 'donors' | 'donations';
type StatusFilter = 'all' | 'active' | 'archived';
type DonorTypeFilter = 'all' | 'donor' | 'strategic_ally';
type SortOrder = 'alpha-asc' | 'alpha-desc' | 'donations-desc' | 'donations-asc' | 'recent' | 'oldest';
type ReadFilter = 'all' | 'read' | 'unread';

const ITEMS_PER_PAGE = 5;

const DonorsPage = () => {
  const [activeSection, setActiveSection] = useState<MainSection>('donors');

  // Donors tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [donorTypeFilter, setDonorTypeFilter] = useState<DonorTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Donations tab state
  const [donationsSearch, setDonationsSearch] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [donationsPage, setDonationsPage] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: donations = [], isLoading: loadingDonations, error } = useDonations();
  const createDonationMutation = useCreateDonation();
  const updateDonationMutation = useUpdateDonation();
  const updateStatusMutation = useUpdateDonationStatus();
  const archiveMutation = useArchiveDonation();

  // Count donations per donor (for sorting)
  const donorDonationCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    donations.forEach((d) => {
      counts[d.donor.idDonor] = (counts[d.donor.idDonor] || 0) + 1;
    });
    return counts;
  }, [donations]);

  // ── Donors tab: filtered + sorted ──
  const filteredDonations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let list = donations.filter((donation) => {
      // Status filter
      if (statusFilter === 'active' && donation.archived) return false;
      if (statusFilter === 'archived' && !donation.archived) return false;

      // Donor type filter
      if (donorTypeFilter !== 'all' && donation.donor.donorType !== donorTypeFilter) return false;

      // Search
      if (!term) return true;
      const fullName = getDonorFullName(donation.donor).toLowerCase();
      const email = (donation.donor.email || '').toLowerCase();
      const phone = (donation.donor.phone || '').toLowerCase();
      const details = (donation.donationDetails || '').toLowerCase();
      const donationType = DonationTypeLabels[donation.donationType].toLowerCase();
      const interest = DonorInterestLabels[donation.donor.interest].toLowerCase();
      return (
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        details.includes(term) ||
        donationType.includes(term) ||
        interest.includes(term)
      );
    });

    // Sort
    list = [...list].sort((a, b) => {
      switch (sortOrder) {
        case 'alpha-asc':
          return getDonorFullName(a.donor).localeCompare(getDonorFullName(b.donor), 'es');
        case 'alpha-desc':
          return getDonorFullName(b.donor).localeCompare(getDonorFullName(a.donor), 'es');
        case 'donations-desc':
          return (donorDonationCounts[b.donor.idDonor] || 0) - (donorDonationCounts[a.donor.idDonor] || 0);
        case 'donations-asc':
          return (donorDonationCounts[a.donor.idDonor] || 0) - (donorDonationCounts[b.donor.idDonor] || 0);
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [donations, searchTerm, statusFilter, donorTypeFilter, sortOrder, donorDonationCounts]);

  // ── Donations tab: filtered ──
  const filteredDonationsTab = useMemo(() => {
    const term = donationsSearch.trim().toLowerCase();
    return donations
      .filter((d) => {
        if (readFilter === 'read' && d.status !== ReadStatus.READ) return false;
        if (readFilter === 'unread' && d.status !== ReadStatus.UNREAD) return false;
        if (!term) return true;
        const fullName = getDonorFullName(d.donor).toLowerCase();
        const details = (d.donationDetails || '').toLowerCase();
        const type = DonationTypeLabels[d.donationType].toLowerCase();
        return fullName.includes(term) || details.includes(term) || type.includes(term);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [donations, donationsSearch, readFilter]);

  // Donors tab: deduplicate by donor (one row per donor, most recent donation as representative)
  const uniqueDonorDonations = useMemo(() => {
    const seen = new Set<number>();
    return filteredDonations.filter((d) => {
      if (seen.has(d.donor.idDonor)) return false;
      seen.add(d.donor.idDonor);
      return true;
    });
  }, [filteredDonations]);

  // Donors tab pagination
  const donorsTotalPages = Math.ceil(uniqueDonorDonations.length / ITEMS_PER_PAGE);
  const donorsStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDonations = uniqueDonorDonations.slice(donorsStartIndex, donorsStartIndex + ITEMS_PER_PAGE);

  // Donations tab pagination
  const donationsTotalPages = Math.ceil(filteredDonationsTab.length / ITEMS_PER_PAGE);
  const donationsStartIndex = (donationsPage - 1) * ITEMS_PER_PAGE;
  const currentDonationsTab = filteredDonationsTab.slice(donationsStartIndex, donationsStartIndex + ITEMS_PER_PAGE);

  // Stats (always based on all donations)
  const stats = useMemo(() => {
    const archived = donations.filter((d) => d.archived).length;
    return { total: donations.length, active: donations.length - archived, archived };
  }, [donations]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateDonation = async (data: CreateDonationDto) => {
    try {
      await createDonationMutation.mutateAsync(data);
      setCurrentPage(1);
      setDonationsPage(1);
      setShowAddModal(false);
      showMessage('success', 'Donación creada exitosamente');
    } catch (e: any) {
      showMessage('error', 'Error al crear la donación');
    }
  };

  const handleUpdateDonation = async (id: number, data: UpdateDonationDto) => {
    try {
      await updateDonationMutation.mutateAsync({ id, data });
      setShowEditModal(false);
      setSelectedDonation(null);
      showMessage('success', 'Donación actualizada exitosamente');
    } catch (e: any) {
      showMessage('error', 'Error al actualizar la donación');
      throw e;
    }
  };

  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailsModal(true);
  };

  const handleEditDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowEditModal(true);
  };

  const handleChangeStatus = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async (newStatus: ReadStatus) => {
    if (!selectedDonation) return;
    try {
      await updateStatusMutation.mutateAsync({ id: selectedDonation.idDonation, status: newStatus });
      setShowStatusModal(false);
      setSelectedDonation(null);
      showMessage('success', 'Estado actualizado exitosamente');
    } catch {
      showMessage('error', 'Error al cambiar el estado');
    }
  };

  const handleToggleArchive = async (donation: Donation) => {
    try {
      await archiveMutation.mutateAsync(donation.idDonation);
      showMessage('success', `Donación ${donation.archived ? 'desarchivada' : 'archivada'} exitosamente`);
    } catch {
      showMessage('error', 'Error al archivar/desarchivar la donación');
    }
  };

  const getPageNumbers = (total: number, current: number) => {
    const pages: number[] = [];
    const max = 5;
    if (total <= max) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i);
    }
    return pages;
  };

  const renderPagination = (total: number, current: number, onPage: (p: number) => void, listLength: number, startIdx: number) => {
    if (total <= 1) return null;
    return (
      <div className="donors-list__pagination">
        <button
          onClick={() => onPage(current - 1)}
          disabled={current === 1}
          className="donors-list__pagination-btn donors-list__pagination-btn--prev"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <div className="donors-list__pagination-numbers">
          {current > 3 && total > 5 && (
            <>
              <button onClick={() => onPage(1)} className="donors-list__pagination-number">1</button>
              <span className="donors-list__pagination-ellipsis">...</span>
            </>
          )}
          {getPageNumbers(total, current).map((page) => (
            <button
              key={page}
              onClick={() => onPage(page)}
              className={`donors-list__pagination-number ${current === page ? 'donors-list__pagination-number--active' : ''}`}
            >
              {page}
            </button>
          ))}
          {current < total - 2 && total > 5 && (
            <>
              <span className="donors-list__pagination-ellipsis">...</span>
              <button onClick={() => onPage(total)} className="donors-list__pagination-number">{total}</button>
            </>
          )}
        </div>

        <button
          onClick={() => onPage(current + 1)}
          disabled={current === total}
          className="donors-list__pagination-btn donors-list__pagination-btn--next"
        >
          Siguiente
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="donors-list__results-text" style={{ marginLeft: '1rem' }}>
          {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, listLength)} de {listLength}
        </p>
      </div>
    );
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
              Administra el registro de donaciones de la{' '}
              <span className="donors-dashboard__foundation-name">Fundación Tamarindo Park</span>. Crea, edita y consulta
              información de donadores y sus donaciones.
            </p>
          </div>
        </div>
      </div>

      <div className="donors-dashboard__main">
        {/* Section tabs */}
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

        {/* ━━━━ DONADORES TAB ━━━━ */}
        {activeSection === 'donors' && (
          <>
            <div className="donors-dashboard__action-bar">
              <div className="donors-dashboard__action-content">
                <div className="donors-dashboard__directory-header">
                  <h2 className="donors-dashboard__directory-title">Lista de Donadores</h2>
                  <p className="donors-dashboard__directory-description">
                    Gestiona y supervisa el registro de donaciones y donadores
                  </p>
                </div>

                <div className="donors-dashboard__controls">
                  {/* Search + Add */}
                  <div className="donors-dashboard__controls-row">
                    <div className="donors-dashboard__search-wrapper">
                      <div className="donors-dashboard__search-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar donadores..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="donors-dashboard__search-input"
                      />
                    </div>
                    <AddDonorButton onClick={() => setShowAddModal(true)} />
                  </div>

                  {/* Filters row */}
                  <div className="donors-dashboard__filters-row">
                    {/* Status filter */}
                    <div className="donors-dashboard__filter-group">
                      <span className="donors-dashboard__filter-label">Estado:</span>
                      <select
                        className="donors-dashboard__sort-select"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
                      >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="archived">Archivados</option>
                      </select>
                    </div>

                    {/* Donor type filter */}
                    <div className="donors-dashboard__filter-group">
                      <span className="donors-dashboard__filter-label">Tipo:</span>
                      <select
                        className="donors-dashboard__sort-select"
                        value={donorTypeFilter}
                        onChange={(e) => { setDonorTypeFilter(e.target.value as DonorTypeFilter); setCurrentPage(1); }}
                      >
                        <option value="all">Todos</option>
                        <option value={DonorType.DONOR}>{DonorTypeLabels[DonorType.DONOR]}</option>
                        <option value={DonorType.STRATEGIC_ALLY}>{DonorTypeLabels[DonorType.STRATEGIC_ALLY]}</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="donors-dashboard__filter-group">
                      <span className="donors-dashboard__filter-label">Ordenar:</span>
                      <select
                        className="donors-dashboard__sort-select"
                        value={sortOrder}
                        onChange={(e) => { setSortOrder(e.target.value as SortOrder); setCurrentPage(1); }}
                      >
                        <option value="recent">Más reciente</option>
                        <option value="oldest">Más antiguo</option>
                        <option value="alpha-asc">A → Z</option>
                        <option value="alpha-desc">Z → A</option>
                        <option value="donations-desc">Más donaciones</option>
                        <option value="donations-asc">Menos donaciones</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {actionMessage && (
              <div className={`donors-list__message donors-list__message--${actionMessage.type}`}>
                {actionMessage.text}
              </div>
            )}

            {/* Stats */}
            <div className="donors-list__stats">
              <div className="donors-list__stat-card donors-list__stat-card--total">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--total">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--total">Total</p>
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

            {loadingDonations ? (
              <div className="donors-list__loading">
                <div className="donors-list__loading-spinner" />
                <p>Cargando donaciones...</p>
              </div>
            ) : error ? (
              <div className="donors-list__error">
                <div className="donors-list__error-icon">⚠️</div>
                <h3>Error al cargar las donaciones</h3>
                <p>{error.message}</p>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="donors-list__empty">
                <div className="donors-list__empty-icon">📋</div>
                <h3>No se encontraron donaciones</h3>
                <p>No hay donaciones que coincidan con los filtros aplicados.</p>
              </div>
            ) : (
              <>
                <DonorList
                  donors={currentDonations}
                  onView={handleViewDonation}
                  onEdit={handleEditDonation}
                  onChangeStatus={handleChangeStatus}
                  onToggleArchive={handleToggleArchive}
                />
                {renderPagination(donorsTotalPages, currentPage, (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }, uniqueDonorDonations.length, donorsStartIndex)}
              </>
            )}
          </>
        )}

        {/* ━━━━ DONACIONES TAB ━━━━ */}
        {activeSection === 'donations' && (
          <>
            <div className="donors-dashboard__action-bar">
              <div className="donors-dashboard__action-content">
                <div className="donors-dashboard__directory-header">
                  <h2 className="donors-dashboard__directory-title">Lista de Donaciones</h2>
                  <p className="donors-dashboard__directory-description">
                    Consulta y gestiona todas las donaciones registradas
                  </p>
                </div>

                <div className="donors-dashboard__controls">
                  <div className="donors-dashboard__controls-row">
                    <div className="donors-dashboard__search-wrapper">
                      <div className="donors-dashboard__search-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar donaciones..."
                        value={donationsSearch}
                        onChange={(e) => { setDonationsSearch(e.target.value); setDonationsPage(1); }}
                        className="donors-dashboard__search-input"
                      />
                    </div>
                    <AddDonorButton onClick={() => setShowAddModal(true)} />
                  </div>

                  {/* Read filter */}
                  <div className="donors-dashboard__filters-row">
                    <div className="donors-dashboard__filter-group">
                      <span className="donors-dashboard__filter-label">Lectura:</span>
                      <select
                        className="donors-dashboard__sort-select"
                        value={readFilter}
                        onChange={(e) => { setReadFilter(e.target.value as ReadFilter); setDonationsPage(1); }}
                      >
                        <option value="all">Todas</option>
                        <option value="unread">{ReadStatusLabels[ReadStatus.UNREAD]}</option>
                        <option value="read">{ReadStatusLabels[ReadStatus.READ]}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {actionMessage && (
              <div className={`donors-list__message donors-list__message--${actionMessage.type}`}>
                {actionMessage.text}
              </div>
            )}

            {loadingDonations ? (
              <div className="donors-list__loading">
                <div className="donors-list__loading-spinner" />
                <p>Cargando donaciones...</p>
              </div>
            ) : filteredDonationsTab.length === 0 ? (
              <div className="donors-list__empty">
                <div className="donors-list__empty-icon">💳</div>
                <h3>No se encontraron donaciones</h3>
                <p>No hay donaciones que coincidan con los filtros aplicados.</p>
              </div>
            ) : (
              <>
                <DonorList
                  donors={currentDonationsTab}
                  onView={handleViewDonation}
                  onEdit={handleEditDonation}
                  onChangeStatus={handleChangeStatus}
                  onToggleArchive={handleToggleArchive}
                  variant="donations"
                />
                {renderPagination(donationsTotalPages, donationsPage, (p) => { setDonationsPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }, filteredDonationsTab.length, donationsStartIndex)}
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddDonorForm onSubmit={handleCreateDonation} onCancel={() => setShowAddModal(false)} />}

      {showEditModal && selectedDonation && (
        <EditDonorForm
          donor={selectedDonation}
          allDonations={donations}
          onSubmit={handleUpdateDonation}
          onCancel={() => { setShowEditModal(false); setSelectedDonation(null); }}
        />
      )}

      {showStatusModal && selectedDonation && (
        <ChangeDonationStatusModal
          show={showStatusModal}
          onClose={() => { setShowStatusModal(false); setSelectedDonation(null); }}
          onConfirm={handleConfirmStatusChange}
          currentStatus={selectedDonation.status}
          donationId={selectedDonation.idDonation}
          isLoading={updateStatusMutation.isPending}
        />
      )}

      <DonorDetailsModal
        donor={selectedDonation}
        show={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedDonation(null); }}
        allDonations={donations}
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
