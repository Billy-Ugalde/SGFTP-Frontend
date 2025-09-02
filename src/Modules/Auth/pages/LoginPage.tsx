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
          <div className="logo-icon">🐢</div>
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Panel Administrativo</p>
        </div>

        <LoginForm />

        <div className="divider">
          <span className="divider-text">Acceso Seguro</span>
        </div>

        <div className="forgot-password">
          <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
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
