import { useState, lazy, Suspense } from 'react';
import { HandHelping } from 'lucide-react';
import VolunteersList from '../Components/VolunteersList';
import AddVolunteerButton from '../Components/AddVolunteerButton';
import StatusFilter from '../../Shared/components/StatusFilter';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import '../Styles/VolunteerDashboardPage.css';

const MailboxTable = lazy(() => import('../Components/MailboxTable'));

const VolunteerDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'volunteers' | 'mailbox'>('volunteers');

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
  };

  return (
    <div className="volunteer-dashboard">
      {/* Compact Header */}
      <div className="volunteer-dashboard__header">
        <div className="volunteer-dashboard__header-inner">
          <div className="volunteer-dashboard__header-left">
            <div className="volunteer-dashboard__header-icon">
              <HandHelping size={18} strokeWidth={2} />
            </div>
            <h1 className="volunteer-dashboard__title">Gestión de Voluntarios</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="volunteer-dashboard__main">
        {/* Action Bar */}
        <div className="volunteer-dashboard__action-bar">
          <div className="volunteer-dashboard__controls-row">
            {/* Tabs */}
            <div className="volunteer-dashboard__tabs">
              <button
                type="button"
                onClick={() => setViewMode('volunteers')}
                className={`volunteer-dashboard__tab ${viewMode === 'volunteers' ? 'volunteer-dashboard__tab--active' : ''}`}
              >
                Voluntarios
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mailbox')}
                className={`volunteer-dashboard__tab ${viewMode === 'mailbox' ? 'volunteer-dashboard__tab--active' : ''}`}
              >
                Buzon
              </button>
            </div>

            {viewMode === 'volunteers' && (
              <StatusFilter
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
              />
            )}

            <div className="volunteer-dashboard__search-wrapper">
              <div className="volunteer-dashboard__search-icon">
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
                placeholder="Buscar voluntarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="volunteer-dashboard__search-input"
              />
            </div>

            <AddVolunteerButton />
          </div>
        </div>

        {/* Content */}
        {viewMode === 'volunteers' ? (
          <VolunteersList
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        ) : (
          <Suspense fallback={null}>
            <MailboxTable />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboardPage;
