import FairsList from "../Components/FairsList";
import AddFairButton from "../Components/AddFairButton";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../Styles/FairsPage.css';

const FairsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  return (
    <div className="fairs-page">
      {/* Header Section */}
      <div className="fairs-page__header">
        <div className="fairs-page__header-container">
          {/* Main Title Section */}
          <div className="fairs-page__title-section">

            {/* Fila superior: ícono, título y botón */}
            <div
              className="fairs-page__title-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              {/* Espaciador izquierdo */}
              <div style={{ flex: 1 }}></div>

              {/* Centro: ícono + título */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div className="fairs-page__title-icon">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "40px", height: "40px", background: "#c9f5e4", padding: "10px", borderRadius: "16px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h1 className="fairs-page__title">Fairs Management</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingLeft: "80px" }}>
                <button
                  className="newsletter-btn"
                  onClick={() => navigate("/admin/dashboard")}
                  style={{
                    backgroundColor: "var(--primary-dark)",
                    padding: "10px 20px",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "6px",
                  }}
                >
                  ← Volver al Dashboard
                </button>
              </div>
            </div>

            {/* Emoji y descripción */}
            <div className="fairs-page__emoji-container">
              <div className="fairs-page__emoji">🌿</div>
            </div>

            <p className="fairs-page__description">
              Manage and organize environmental fairs for{" "}
              <span className="fairs-page__foundation-name">
                Tamarindo Park Foundation
              </span>
              . Create, edit, and coordinate sustainable community events that
              promote conservation and environmental awareness.
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
              <h2 className="fairs-page__directory-title">Fair Directory</h2>
              <p className="fairs-page__directory-description">
                Create, edit, and manage all foundation environmental fairs
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
                  placeholder="Search fairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="fairs-page__search-input"
                />
              </div>

              {/* Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="fairs-page__filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

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
            <span>© 2025 Tamarindo Park Foundation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FairsPage;