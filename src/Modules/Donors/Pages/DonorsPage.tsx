import { lazy, Suspense, useMemo, useState } from 'react';
import { Banknote, Search, Utensils, Shirt, DollarSign, Package, Tag, LayoutList } from 'lucide-react';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import FilterDropdown from '../../Shared/components/FilterDropdown';
import { ListState, useSuccessAlert } from '../../Shared/components';
import AddDonorButton from '../Components/AddDonorButton';
import DonorList from '../Components/DonorList.tsx';

const AddDonorForm = lazy(() => import('../Components/AddDonorForm'));
const EditDonorForm = lazy(() => import('../Components/EditDonorForm'));
const DonorDetailsModal = lazy(() => import('../Components/DonorDetailsModal'));
const ChangeDonationStatusModal = lazy(() => import('../Components/ChangeDonationStatusModal'));
import {
  getDonorFullName,
  useCreateDonation,
  useDonations,
  useUpdateDonation,
  useUpdateDonationStatus,
  type CreateDonationDto,
  type Donation,
  type UpdateDonationDto,
  DonationTypeLabels,
  DonorInterestLabels,
  DonorType,
  DonorTypeLabels,
  DonationStatus,
  DonationStatusLabels,
} from '../Services/DonorService';
import '../Styles/DonorsPage.css';

const DonorsSkeleton = () => (
  <>
    <div className="donors-skeleton__stats">
      {[1, 2, 3].map((i) => (
        <div key={i} className="donors-skeleton__stat-card">
          <div className="donors-skeleton__bar donors-skeleton__bar--short" />
          <div className="donors-skeleton__bar donors-skeleton__bar--tall" />
        </div>
      ))}
    </div>
    <div className="donors-skeleton__table">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="donors-skeleton__row">
          <div className="donors-skeleton__cell" style={{ width: '25%' }} />
          <div className="donors-skeleton__cell" style={{ width: '30%' }} />
          <div className="donors-skeleton__cell" style={{ width: '20%' }} />
          <div className="donors-skeleton__cell" style={{ width: '15%' }} />
        </div>
      ))}
    </div>
  </>
);

type MainSection = 'donors' | 'donations';
type StatusFilter = 'all' | 'nuevo' | 'ejecucion' | 'finalizado' | 'suspendido';
type DonorTypeFilter = 'all' | 'donor' | 'strategic_ally';

const ITEMS_PER_PAGE = 10;

const DonorsPage = () => {
  const [activeSection, setActiveSection] = useState<MainSection>('donations');

  // Donors tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [donorTypeFilter, setDonorTypeFilter] = useState<DonorTypeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Donations tab state
  const [donationsSearch, setDonationsSearch] = useState('');
  const [donationsStatusFilter, setDonationsStatusFilter] = useState<StatusFilter>('all');
  const [donationsTypeFilter, setDonationsTypeFilter] = useState('all');
  const [donationsPage, setDonationsPage] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'error'; text: string } | null>(null);

  const { showSuccess } = useSuccessAlert();
  const { data: donations = [], isLoading: loadingDonations, error, refetch } = useDonations();
  const createDonationMutation = useCreateDonation();
  const updateDonationMutation = useUpdateDonation();
  const updateStatusMutation = useUpdateDonationStatus();

  // ── Donors tab: filtered + sorted by createdAt desc ──
  const filteredDonations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const list = donations.filter((donation) => {
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

    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [donations, searchTerm, donorTypeFilter]);

  // ── Donations tab: filtered ──
  const filteredDonationsTab = useMemo(() => {
    const term = donationsSearch.trim().toLowerCase();
    return donations
      .filter((d) => {
        if (donationsStatusFilter !== 'all' && d.status !== donationsStatusFilter) return false;
        if (donationsTypeFilter !== 'all' && d.donationType !== donationsTypeFilter) return false;
        if (!term) return true;
        const fullName = getDonorFullName(d.donor).toLowerCase();
        const details = (d.donationDetails || '').toLowerCase();
        const type = DonationTypeLabels[d.donationType].toLowerCase();
        return fullName.includes(term) || details.includes(term) || type.includes(term);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [donations, donationsSearch, donationsStatusFilter, donationsTypeFilter]);

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

  // Stats - donors section (unique donors by type)
  const donorsStats = useMemo(() => {
    const seen = new Map<number, typeof donations[0]['donor']>();
    donations.forEach((d) => {
      if (!seen.has(d.donor.idDonor)) seen.set(d.donor.idDonor, d.donor);
    });
    const allDonors = Array.from(seen.values());
    const personas = allDonors.filter((d) => d.donorType === DonorType.DONOR).length;
    const aliados = allDonors.filter((d) => d.donorType === DonorType.STRATEGIC_ALLY).length;
    return { total: allDonors.length, personas, aliados };
  }, [donations]);

  // Stats - donations section (by status)
  const donationsStats = useMemo(() => {
    const nuevo = donations.filter((d) => d.status === DonationStatus.NUEVO).length;
    const ejecucion = donations.filter((d) => d.status === DonationStatus.EJECUCION).length;
    const finalizado = donations.filter((d) => d.status === DonationStatus.FINALIZADO).length;
    return { total: donations.length, nuevo, ejecucion, finalizado };
  }, [donations]);

  const showError = (text: string) => {
    setActionMessage({ type: 'error', text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateDonation = async (data: CreateDonationDto) => {
    await createDonationMutation.mutateAsync(data);
    setCurrentPage(1);
    setDonationsPage(1);
    setShowAddModal(false);
    showSuccess('La donación ha sido registrada exitosamente.');
  };

  const handleUpdateDonation = async (id: number, data: UpdateDonationDto) => {
    await updateDonationMutation.mutateAsync({ id, data });
    setShowEditModal(false);
    setSelectedDonation(null);
    showSuccess('La donación ha sido actualizada exitosamente.');
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

  const handleConfirmStatusChange = async (newStatus: DonationStatus) => {
    if (!selectedDonation) return;
    try {
      await updateStatusMutation.mutateAsync({ id: selectedDonation.idDonation, status: newStatus });
      setShowStatusModal(false);
      setSelectedDonation(null);
      showSuccess('El estado de la donación ha sido actualizado.');
    } catch {
      showError('Error al cambiar el estado');
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
      {/* Compact Header */}
      <div className="donors-dashboard__header">
        <div className="donors-dashboard__header-inner">
          <div className="donors-dashboard__header-left">
            <div className="donors-dashboard__header-icon">
              <Banknote size={18} strokeWidth={2} />
            </div>
            <h1 className="donors-dashboard__title">Gestión de Donadores</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      <div className="donors-dashboard__main">

        {/* ━━━━ UNIFIED ACTION BAR (single row) ━━━━ */}
        <div className="donors-dashboard__action-bar">

          {/* Tabs - always visible */}
          <div className="donors-dashboard__section-tabs">
            <button
              className={`donors-dashboard__section-tab ${activeSection === 'donations' ? 'donors-dashboard__section-tab--active' : ''}`}
              onClick={() => setActiveSection('donations')}
            >
              Donaciones
            </button>
            <button
              className={`donors-dashboard__section-tab ${activeSection === 'donors' ? 'donors-dashboard__section-tab--active' : ''}`}
              onClick={() => setActiveSection('donors')}
            >
              Donadores
            </button>
          </div>

          {/* Donors tab: Tipo filter */}
          {activeSection === 'donors' && (
            <div className="donors-dashboard__filter-group">
              <FilterDropdown
                value={donorTypeFilter}
                onChange={(v) => { setDonorTypeFilter(v as DonorTypeFilter); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'Todos los tipos' },
                  { value: DonorType.DONOR, label: DonorTypeLabels[DonorType.DONOR] },
                  { value: DonorType.STRATEGIC_ALLY, label: DonorTypeLabels[DonorType.STRATEGIC_ALLY] },
                ]}
              />
            </div>
          )}

          {/* Donations tab: Estado + Tipo filters */}
          {activeSection === 'donations' && (
            <>
              <div className="donors-dashboard__filter-group">
                <FilterDropdown
                  value={donationsStatusFilter}
                  onChange={(v) => { setDonationsStatusFilter(v as StatusFilter); setDonationsPage(1); }}
                  options={[
                    { value: 'all', label: 'Todos los estados', icon: <LayoutList size={14} /> },
                    { value: DonationStatus.NUEVO, label: DonationStatusLabels[DonationStatus.NUEVO] },
                    { value: DonationStatus.EJECUCION, label: DonationStatusLabels[DonationStatus.EJECUCION] },
                    { value: DonationStatus.FINALIZADO, label: DonationStatusLabels[DonationStatus.FINALIZADO] },
                    { value: DonationStatus.SUSPENDIDO, label: DonationStatusLabels[DonationStatus.SUSPENDIDO] },
                  ]}
                />
              </div>
              <div className="donors-dashboard__filter-group">
                <FilterDropdown
                  value={donationsTypeFilter}
                  onChange={(v) => { setDonationsTypeFilter(v); setDonationsPage(1); }}
                  options={[
                    { value: 'all', label: 'Todos los tipos' },
                    { value: 'food', label: DonationTypeLabels.food, icon: <Utensils size={14} /> },
                    { value: 'clothing', label: DonationTypeLabels.clothing, icon: <Shirt size={14} /> },
                    { value: 'money', label: DonationTypeLabels.money, icon: <DollarSign size={14} /> },
                    { value: 'used_items', label: DonationTypeLabels.used_items, icon: <Package size={14} /> },
                    { value: 'other', label: DonationTypeLabels.other, icon: <Tag size={14} /> },
                  ]}
                />
              </div>
            </>
          )}

          {/* Search (tab-specific) */}
          {activeSection === 'donors' && (
            <div className="donors-dashboard__search-wrapper">
              <div className="donors-dashboard__search-icon">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar donadores..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="donors-dashboard__search-input"
              />
            </div>
          )}
          {activeSection === 'donations' && (
            <div className="donors-dashboard__search-wrapper">
              <div className="donors-dashboard__search-icon">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar donaciones..."
                value={donationsSearch}
                onChange={(e) => { setDonationsSearch(e.target.value); setDonationsPage(1); }}
                className="donors-dashboard__search-input"
              />
            </div>
          )}

          {/* Add button - always visible */}
          <AddDonorButton onClick={() => setShowAddModal(true)} />

        </div>

        {/* ━━━━ DONADORES TAB CONTENT ━━━━ */}
        {activeSection === 'donors' && (
          <>
            {actionMessage && (
              <div className={`donors-list__message donors-list__message--${actionMessage.type}`}>
                {actionMessage.text}
              </div>
            )}

            {/* Donors stats */}
            <div className="donors-list__stats">
              <div className="donors-list__stat-card donors-list__stat-card--total">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--total">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--total">Total Donadores</p>
                    <p className="donors-list__stat-value donors-list__stat-value--total">{donorsStats.total}</p>
                  </div>
                </div>
              </div>
              <div className="donors-list__stat-card donors-list__stat-card--active">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--active">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--active">Personas</p>
                    <p className="donors-list__stat-value donors-list__stat-value--active">{donorsStats.personas}</p>
                  </div>
                </div>
              </div>
              <div className="donors-list__stat-card donors-list__stat-card--archived">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--archived">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--archived">Aliados Estratégicos</p>
                    <p className="donors-list__stat-value donors-list__stat-value--archived">{donorsStats.aliados}</p>
                  </div>
                </div>
              </div>
            </div>

            {loadingDonations ? (
              <DonorsSkeleton />
            ) : error ? (
              <ListState
                isLoading={false}
                error={error}
                loadingText=""
                errorTitle="No se pudieron cargar las donaciones"
                errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
                onRetry={refetch}
              />
            ) : filteredDonations.length === 0 ? (
              <div className="donors-list__empty">
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
                />
                {renderPagination(donorsTotalPages, currentPage, (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }, uniqueDonorDonations.length, donorsStartIndex)}
              </>
            )}
          </>
        )}

        {/* ━━━━ DONACIONES TAB CONTENT ━━━━ */}
        {activeSection === 'donations' && (
          <>
            {actionMessage && (
              <div className={`donors-list__message donors-list__message--${actionMessage.type}`}>
                {actionMessage.text}
              </div>
            )}

            {/* Donations stats */}
            <div className="donors-list__stats">
              <div className="donors-list__stat-card donors-list__stat-card--total">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--total">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--total">Total Donaciones</p>
                    <p className="donors-list__stat-value donors-list__stat-value--total">{donationsStats.total}</p>
                  </div>
                </div>
              </div>
              <div className="donors-list__stat-card donors-list__stat-card--archived">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--archived">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--archived">Nuevas</p>
                    <p className="donors-list__stat-value donors-list__stat-value--archived">{donationsStats.nuevo}</p>
                  </div>
                </div>
              </div>
              <div className="donors-list__stat-card donors-list__stat-card--active">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--active">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--active">En Ejecución</p>
                    <p className="donors-list__stat-value donors-list__stat-value--active">{donationsStats.ejecucion}</p>
                  </div>
                </div>
              </div>
              <div className="donors-list__stat-card donors-list__stat-card--completed">
                <div className="donors-list__stat-content">
                  <div className="donors-list__stat-icon donors-list__stat-icon--completed">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="donors-list__stat-label donors-list__stat-label--completed">Finalizadas</p>
                    <p className="donors-list__stat-value donors-list__stat-value--completed">{donationsStats.finalizado}</p>
                  </div>
                </div>
              </div>
            </div>

            {loadingDonations ? (
              <DonorsSkeleton />
            ) : error ? (
              <ListState
                isLoading={false}
                error={error}
                loadingText=""
                errorTitle="No se pudieron cargar las donaciones"
                errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
                onRetry={refetch}
              />
            ) : filteredDonationsTab.length === 0 ? (
              <div className="donors-list__empty">
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
                  variant="donations"
                />
                {renderPagination(donationsTotalPages, donationsPage, (p) => { setDonationsPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }, filteredDonationsTab.length, donationsStartIndex)}
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
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
      </Suspense>

    </div>
  );
};

export default DonorsPage;
