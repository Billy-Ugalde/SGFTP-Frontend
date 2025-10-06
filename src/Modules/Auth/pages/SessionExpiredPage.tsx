import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/unauthorizedPage.css';

const SessionExpiredPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLoginNow = () => {
    navigate('/login');
  };

  return (
    <div className="unauthorized-wrapper">
      <div className="unauthorized-container">

        {/* Header Section */}
        <div className="unauthorized-header">
          <div className="unauthorized-icon" style={{ color: '#f59e0b' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="unauthorized-title">Sesión Expirada</h1>
          <p className="unauthorized-subtitle">
            Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente para continuar.
          </p>
        </div>

        {/* Info Card */}
        <div className="unauthorized-user-info" style={{ borderColor: '#f59e0b' }}>
          <div className="user-info-header" style={{ color: '#f59e0b' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Información</span>
          </div>
          <div className="user-info-details">
            <p>Por seguridad, las sesiones expiran después de 30 días de inactividad.</p>
            <p style={{ marginTop: '0.5rem' }}>
              Serás redirigido al inicio de sesión en <strong>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="unauthorized-actions">
          <button
            onClick={handleLoginNow}
            className="unauthorized-btn unauthorized-btn--primary"
            style={{ width: '100%' }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Iniciar Sesión Ahora
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

export default SessionExpiredPage;
