import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import AuthBrandPanel from '../components/AuthBrandPanel';
import '../styles/login-page.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="auth-split login-wrapper">
      <AuthBrandPanel />

      <div className="auth-split__panel">
        <button
          type="button"
          className="exit-btn"
          onClick={handleExit}
          aria-label="Salir y volver a la página principal"
          title="Salir"
        >
          Salir
        </button>

        <div className="auth-split__panel-inner">
          <div className="logo-section">
            <h1 className="login-title">Iniciar Sesión</h1>
            <p className="login-subtitle">Acceso verificado para miembros de la fundación</p>
          </div>

          <LoginForm />

          <div className="divider">
            <span className="divider-text">Acceso Seguro</span>
          </div>

          <div className="forgot-password">
            <a href="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</a>
            <span className="forgot-sep">•</span>
            <a href="/resend-activation" className="forgot-link">¿No activaste tu cuenta?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
