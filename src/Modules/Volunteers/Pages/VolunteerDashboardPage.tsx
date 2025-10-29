import { useState } from 'react';
import VolunteersList from '../Components/VolunteersList';
import AddVolunteerButton from '../Components/AddVolunteerButton';
import StatusFilter from '../Components/StatusFilter';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import '../Styles/VolunteerDashboardPage.css';

const VolunteerDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

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
                <div className="volunteer-dashboard__title-icon">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: "40px", height: "40px", background: "#dbeafe", padding: "10px", borderRadius: "16px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h1 className="volunteer-dashboard__title">Gestión de Voluntarios</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <BackToDashboardButton />
              </div>
            </div>

            {/* Emoji y descripción */}
            <div className="volunteer-dashboard__emoji-container">
              <div className="volunteer-dashboard__emoji">🤝</div>
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
                {/* Status Filter */}
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

                {/* Add Volunteer Button */}
                <AddVolunteerButton />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <VolunteersList
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
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
