import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import '../styles/login-page.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/'); // vuelve a la vista pública
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* Botón Salir (esquina superior derecha) */}
        <button
          type="button"
          className="exit-btn"
          onClick={handleExit}
          aria-label="Salir y volver a la página principal"
          title="Salir"
        >
          Salir
        </button>

        <div className="logo-section">
          <div className="logo-icon" >
            <img
              src="/turtle-icon-white.svg"
              alt="Logo"
              className="logo-image"
            />
          </div>
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Acceso Verificado</p>
        </div>

        <LoginForm />

        <div className="divider">
          <span className="divider-text">Acceso Seguro</span>
        </div>

        <div className="forgot-password">
          <a href="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</a>
          <span style={{ margin: '0 8px', color: '#6b7280' }}>•</span>
          <a href="/resend-activation" className="forgot-link">¿No activaste tu cuenta?</a>
        </div>

        <div className="footer-info">
          <div className="foundation-name">Tamarindo Park Foundation</div>
          <div className="foundation-tagline">Tu voz, nuestro proyecto</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
