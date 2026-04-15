import { useState } from 'react';
import { Amphora, LayoutGrid, Table } from 'lucide-react';
import PendingEntrepreneursList from '../Components/PendingEntrepreneursList';
import ApprovedEntrepreneursList from '../Components/ApprovedEntrepreneursList';
import AddEntrepreneurButton from '../Components/AddEntrepreneurButton';
import CategoryFilter from '../Components/CategoryFilter';
import StatusFilter from '../../Shared/components/StatusFilter';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import '../Styles/EntrepreneurDashboardPage.css';

const EntrepreneurDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };


  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
  };

  return (
    <div className="entrepreneur-dashboard">
      {/* Compact Header */}
      <div className="entrepreneur-dashboard__header">
        <div className="entrepreneur-dashboard__header-inner">
          <div className="entrepreneur-dashboard__header-left">
            <div className="entrepreneur-dashboard__header-icon">
              <Amphora size={18} strokeWidth={2} />
            </div>
            <h1 className="entrepreneur-dashboard__title">Gestión de Emprendedores</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="entrepreneur-dashboard__main">
        {/* Action Bar */}
        <div className="entrepreneur-dashboard__action-bar">
          {/* Tab Buttons */}
          <div className="entrepreneur-dashboard__tabs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`entrepreneur-dashboard__tab ${activeTab === 'pending' ? 'entrepreneur-dashboard__tab--active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Solicitudes
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`entrepreneur-dashboard__tab ${activeTab === 'approved' ? 'entrepreneur-dashboard__tab--active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aprobados
            </button>
          </div>

          {/* Controls Row */}
          <div className="entrepreneur-dashboard__controls-row">
            {activeTab === 'approved' && (
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            )}
            {activeTab === 'approved' && (
              <StatusFilter
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
              />
            )}

            <div className="entrepreneur-dashboard__search-wrapper">
              <div className="entrepreneur-dashboard__search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'pending' ? 'solicitudes' : 'emprendedores'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="entrepreneur-dashboard__search-input"
              />
            </div>

            <div className="entrepreneur-dashboard__view-toggle">
              <button onClick={() => setViewMode('cards')} className={viewMode === 'cards' ? 'active' : ''} type="button">
                <LayoutGrid size={16} strokeWidth={2} />
                Cards
              </button>
              <button onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'active' : ''} type="button">
                <Table size={16} strokeWidth={2} />
                Tabla
              </button>
            </div>

            {activeTab === 'approved' && <AddEntrepreneurButton />}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pending' ? (
          <PendingEntrepreneursList searchTerm={searchTerm} viewMode={viewMode} />
        ) : (
          <ApprovedEntrepreneursList
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            statusFilter={statusFilter}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
};

export default EntrepreneurDashboardPage;