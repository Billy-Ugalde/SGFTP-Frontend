import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/unauthorizedPage.css';

const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="unauthorized-wrapper">
      <div className="unauthorized-container">

        {/* Header Section */}
        <div className="unauthorized-header">
          <div className="unauthorized-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="unauthorized-title">Acceso Denegado</h1>
          <p className="unauthorized-subtitle">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>

        {/* User Info Card */}
        <div className="unauthorized-user-info">
          <div className="user-info-header">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Información del Usuario</span>
          </div>
          <div className="user-info-details">
            <p><strong>Usuario:</strong> {user?.person.firstName} {user?.person.firstLastname}</p>
            <p><strong>Roles actuales:</strong> {user?.roles?.join(', ') || 'Sin roles'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="unauthorized-actions">
          <button
            onClick={handleGoBack}
            className="unauthorized-btn unauthorized-btn--secondary"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Volver atrás
          </button>

          <Link
            to="/"
            className="unauthorized-btn unauthorized-btn--primary"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ir al inicio
          </Link>

          <button
            onClick={logout}
            className="unauthorized-btn unauthorized-btn--danger"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>

        {/* Footer */}
        <div className="unauthorized-footer">
          <span>Fundación Tamarindo Park</span>
          <span>Tu voz, nuestro proyecto</span>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;