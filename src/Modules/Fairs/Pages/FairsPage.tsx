import FairsList from "../Components/FairsList";
import AddFairButton from "../Components/AddFairButton";
import EnrollmentManagementButton from "../Components/EnrollmentManagementButton";
import BackToDashboardButton from "../../Shared/components/BackToDashboardButton";
import StatusFilter from "../../Shared/components/StatusFilter";
import { useState, useRef } from "react";
import { Store } from 'lucide-react';
import '../Styles/FairsPage.css';
import { ReportModal } from "../Components/ReportModal";


const FairsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const reportAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fairs-page">
      {/* Header Section */}
      <div className="fairs-page__header">
        <div className="fairs-page__header-container">
          {/* Main Title Section */}
          <div className="fairs-page__title-section">

            {/* Fila superior: ícono, título y botones */}
            <div
              className="fairs-page__title-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              {/* Espaciador izquierdo con botón de solicitudes */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                <EnrollmentManagementButton />
              </div>

              {/* Centro: ícono + título */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "#4CAF8C", color: "white", width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "16px" }}>
                  <Store size={32} strokeWidth={2} />
                </div>
                <h1 className="fairs-page__title">Gestión de ferias</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <BackToDashboardButton />
              </div>
            </div>

            <p className="fairs-page__description">
              Administrar y organizar ferias ambientales para la{" "}
              <span className="fairs-page__foundation-name">
                Fundación Tamarindo Park
              </span>
              . Crear, editar y coordinar eventos comunitarios sostenibles que promuevan la conservación y la conciencia ambiental.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="fairs-page__main">
        {/* Action Bar */}
        <div className="fairs-page__action-bar">
          <div className="fairs-page__action-content">
            <div className="fairs-page__directory-header">
              <h2 className="fairs-page__directory-title">Directorio de ferias</h2>
              <p className="fairs-page__directory-description">
                Crear, editar y administrar todas las ferias ambientales de la fundación
              </p>
            </div>

            <div className="fairs-page__controls">
              {/* Search Bar */}
              <div className="fairs-page__search-wrapper">
                <div className="fairs-page__search-icon">
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
                  placeholder="Buscar ferias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="fairs-page__search-input"
                />
              </div>

              {/* Status Filter */}
              <StatusFilter
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />

              {/* Selector de Trimestre en ReportModal */}
              <div className="report-anchor" ref={reportAnchorRef}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(v => !v)}
                  className="fairs-page__filter-select"
                  aria-haspopup={true}                 
                  aria-expanded={showReportModal}
                >
                  📊 Reporte
                  <span style={{ display: "inline-flex", marginLeft: 8 }}>
                    <svg
                      width="16" height="16" viewBox="0 0 20 20"
                      style={{
                        transition: "transform .2s",
                        transform: showReportModal ? "rotate(180deg)" : "none",
                      }}
                    >
                      <path
                        d="M5.5 7.5l4.5 4.5 4.5-4.5"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                {showReportModal && (
                  <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                  />
                )}
              </div>

              {/* Add Fair Button */}
              <AddFairButton />
            </div>
          </div>
        </div>

        {/* Fairs List */}
        <FairsList searchTerm={searchTerm} statusFilter={statusFilter} />
      </div>

      {/* Footer */}
      <div className="fairs-page__footer">
        <div className="fairs-page__footer-container">
          <div className="fairs-page__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FairsPage;