import { useState } from 'react';
import { HandHelping } from 'lucide-react';
import VolunteersList from '../Components/VolunteersList';
import AddVolunteerButton from '../Components/AddVolunteerButton';
import StatusFilter from '../../Shared/components/StatusFilter';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import MailboxTable from '../Components/MailboxTable';
import '../Styles/VolunteerDashboardPage.css';

const VolunteerDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // controla qué vista mostramos abajo
  const [viewMode, setViewMode] = useState<'volunteers' | 'mailbox'>('volunteers');

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
  };

  return (
    <div className="volunteer-dashboard">
      {/* Header Section */}
      <div className="volunteer-dashboard__header">
        <div className="volunteer-dashboard__header-container">
          {/* Main Title Section */}
          <div className="volunteer-dashboard__title-section">
            {/* Fila superior: ícono, título y botón */}
            <div className="volunteer-dashboard__title-row">
              {/* Espaciador izquierdo */}
              <div style={{ flex: 1 }}></div>

              {/* Centro: ícono + título */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "#4CAF8C", color: "white", width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "16px" }}>
                  <HandHelping size={32} strokeWidth={2} />
                </div>
                <h1 className="volunteer-dashboard__title">Gestión de Voluntarios</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <BackToDashboardButton />
              </div>
            </div>

            <p className="volunteer-dashboard__description">
              Administrar voluntarios registrados para la{" "}
              <span className="volunteer-dashboard__foundation-name">
                Fundación Tamarindo Park
              </span>
              . Agregar nuevos voluntarios y gestionar su información.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="volunteer-dashboard__main">
        {/* Action Bar */}
        <div className="volunteer-dashboard__action-bar">
          <div className="volunteer-dashboard__action-content">
            <div className="volunteer-dashboard__directory-header">
              <h2 className="volunteer-dashboard__directory-title">
                Voluntarios Registrados
              </h2>
              <p className="volunteer-dashboard__directory-description">
                Administrar voluntarios y su información de contacto
              </p>
            </div>

            <div className="volunteer-dashboard__controls">
              {/* Controls Row */}
              <div className="volunteer-dashboard__controls-row">

                <StatusFilter
                  statusFilter={statusFilter}
                  onStatusChange={handleStatusChange}
                />

                {/* Search Bar */}
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

                {/* Botón para crear voluntario */}
                <AddVolunteerButton />

                {/* Botón Buzón */}
                <button
                  type="button"
                  className="volunteer-dashboard__btn-toggle"
                  onClick={() => setViewMode('mailbox')}
                >
                  Buzón
                </button>

                {/* Botón Voluntarios (solo se muestra si estás viendo el buzón) */}
                {viewMode === 'mailbox' && (
                  <button
                    type="button"
                    className="volunteer-dashboard__btn-toggle"
                    onClick={() => setViewMode('volunteers')}
                  >
                    Voluntarios
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'volunteers' ? (
          <VolunteersList
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        ) : (
          <MailboxTable />
        )}
      </div>

      {/* Footer */}
      <div className="volunteer-dashboard__footer">
        <div className="volunteer-dashboard__footer-container">
          <div className="volunteer-dashboard__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboardPage;
