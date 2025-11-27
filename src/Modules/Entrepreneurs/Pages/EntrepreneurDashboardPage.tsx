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
      {/* Header Section */}
      <div className="entrepreneur-dashboard__header">
        <div className="entrepreneur-dashboard__header-container">
          {/* Main Title Section */}
          <div className="entrepreneur-dashboard__title-section">
            {/* Fila superior: ícono, título y botón */}
            <div className="entrepreneur-dashboard__title-row">
              {/* Espaciador izquierdo */}
              <div style={{ flex: 1 }}></div>

              {/* Centro: ícono + título */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "#4CAF8C", color: "white", width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "16px" }}>
                  <Amphora size={32} strokeWidth={2} />
                </div>
                <h1 className="entrepreneur-dashboard__title">Gestión de Emprendedores</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <BackToDashboardButton />
              </div>
            </div>

            <p className="entrepreneur-dashboard__description">
              Administrar solicitudes y emprendedores aprobados para la{" "}
              <span className="entrepreneur-dashboard__foundation-name">
                Fundación Tamarindo Park
              </span>
              . Revisar solicitudes, aprobar emprendedores y gestionarlos.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="entrepreneur-dashboard__main">
        {/* Action Bar */}
        <div className="entrepreneur-dashboard__action-bar">
          <div className="entrepreneur-dashboard__action-content">
            <div className="entrepreneur-dashboard__directory-header">
              <h2 className="entrepreneur-dashboard__directory-title">
                {activeTab === 'pending' ? 'Solicitudes Pendientes' : 'Emprendedores Aprobados'}
              </h2>
              <p className="entrepreneur-dashboard__directory-description">
                {activeTab === 'pending'
                  ? 'Revisar y gestionar las solicitudes de emprendedores'
                  : 'Administrar emprendedores aprobados y sus emprendimientos'
                }
              </p>
            </div>

            <div className="entrepreneur-dashboard__controls">
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
                {/* Category Filter - only show in approved tab */}
                {activeTab === 'approved' && (
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                )}

                {/* Status Filter - only show in approved tab */}
                {activeTab === 'approved' && (
                  <StatusFilter
                    statusFilter={statusFilter}
                    onStatusChange={handleStatusChange}
                  />
                )}

                {/* Search Bar */}
                <div className="entrepreneur-dashboard__search-wrapper">
                  <div className="entrepreneur-dashboard__search-icon">
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
                    placeholder={`Buscar ${activeTab === 'pending' ? 'solicitudes' : 'emprendedores'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="entrepreneur-dashboard__search-input"
                  />
                </div>

                {/* Toggle View Buttons (nuevo) */}
                <div className="entrepreneur-dashboard__view-toggle" style={{ marginLeft: '0.75rem' }}>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={viewMode === 'cards' ? 'active' : ''}
                    type="button"
                  >
                    <LayoutGrid size={16} strokeWidth={2} />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'active' : ''}
                    type="button"
                  >
                    <Table size={16} strokeWidth={2} />
                    Tabla
                  </button>
                </div>

                {/* Add Entrepreneur Button - only show in approved tab */}
                {activeTab === 'approved' && <AddEntrepreneurButton />}
              </div>
            </div>
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

      {/* Footer */}
      <div className="entrepreneur-dashboard__footer">
        <div className="entrepreneur-dashboard__footer-container">
          <div className="entrepreneur-dashboard__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurDashboardPage;