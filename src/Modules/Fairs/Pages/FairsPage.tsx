import { useState, useRef, lazy, Suspense } from 'react';
import { ShoppingBag, LayoutGrid, Table, BarChart2 } from 'lucide-react';
import StatusFilter from '../../Shared/components/StatusFilter';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import ListState from '../../Shared/components/ListState';
import '../Styles/FairsPage.css';

const FairsList = lazy(() => import('../Components/FairsList'));
const AddFairButton = lazy(() => import('../Components/AddFairButton'));
const EnrollmentManagementButton = lazy(() => import('../Components/EnrollmentManagementButton'));
const ReportModal = lazy(() => import('../Components/ReportModal').then(m => ({ default: m.ReportModal })));

const FairsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [showReportModal, setShowReportModal] = useState(false);
  const reportAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fairs-dashboard">
      {/* Compact Header */}
      <div className="fairs-dashboard__header">
        <div className="fairs-dashboard__header-inner">
          <div className="fairs-dashboard__header-left">
            <div className="fairs-dashboard__header-icon">
              <ShoppingBag size={18} strokeWidth={2} />
            </div>
            <h1 className="fairs-dashboard__title">Gestión de Ferias</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="fairs-dashboard__main">
        {/* Action Bar */}
        <div className="fairs-dashboard__action-bar">
          {/* Controls Row */}
          <div className="fairs-dashboard__controls-row">
            <StatusFilter
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />

            <div className="fairs-dashboard__search-wrapper">
              <div className="fairs-dashboard__search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar ferias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="fairs-dashboard__search-input"
              />
            </div>

            <div className="report-anchor" ref={reportAnchorRef}>
              <button
                type="button"
                onClick={() => setShowReportModal(v => !v)}
                className="fairs-dashboard__report-button"
                aria-haspopup={true}
                aria-expanded={showReportModal}
              >
                <span className="fairs-dashboard__report-button__icon">
                  <BarChart2 size={14} strokeWidth={2} />
                </span>
                Reporte
                <span className={`fairs-dashboard__report-button__chevron ${showReportModal ? 'fairs-dashboard__report-button__chevron--open' : ''}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {showReportModal && (
                <Suspense fallback={null}>
                  <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                  />
                </Suspense>
              )}
            </div>

            <div className="fairs-dashboard__view-toggle">
              <button onClick={() => setViewMode('cards')} className={viewMode === 'cards' ? 'active' : ''} type="button">
                <LayoutGrid size={16} strokeWidth={2} />
                Cards
              </button>
              <button onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'active' : ''} type="button">
                <Table size={16} strokeWidth={2} />
                Tabla
              </button>
            </div>

            <Suspense fallback={null}>
              <AddFairButton />
            </Suspense>

            <div className="fairs-dashboard__right-actions">
              <Suspense fallback={null}>
                <EnrollmentManagementButton />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Fairs List */}
        <Suspense fallback={<ListState isLoading={true} loadingText="Cargando ferias..." />}>
          <FairsList searchTerm={searchTerm} statusFilter={statusFilter} viewMode={viewMode} />
        </Suspense>
      </div>
    </div>
  );
};

export default FairsPage;
