import React, { useState } from 'react';
import '../styles/loginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorField, setErrorField] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorField('');
    setErrorMessage('');
    setLoginSuccess(false);

    if (!validateEmail(email)) {
      setErrorField('email');
      setErrorMessage('Por favor ingresa un email válido');
      return;
    }

    if (!password || password.length < 6) {
      setErrorField('password');
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (email === 'admin@tamarindopark.org' && password === 'admin123') {
        setLoginSuccess(true);
        // Simula redirección
        setTimeout(() => {
          alert('¡Bienvenido al Panel Administrativo!');
          // window.location.href = '/admin/dashboard';
        }, 1000);
      } else {
        setErrorField('general');
        setErrorMessage('Credenciales incorrectas');
      }

      setIsLoading(false);
    }, 1500);
  };

  const showForgotPassword = () => {
    alert('Para recuperar tu contraseña, contacta al administrador del sistema:\nadmin@tamarindopark.org');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo-section">
          <div className="logo-icon">🐢</div>
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Panel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className={`form-input ${errorField === 'email' ? 'error' : email && validateEmail(email) ? 'success' : ''}`}
              placeholder="admin@tamarindopark.org"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {errorField === 'email' && (
              <div className="error-message">{errorMessage}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className={`form-input ${errorField === 'password' ? 'error' : password.length >= 6 ? 'success' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {errorField === 'password' && (
              <div className="error-message">{errorMessage}</div>
            )}
          </div>

          <button
            type="submit"
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            style={{
              background:
                loginSuccess
                  ? '#27ae60'
                  : errorField === 'general'
                  ? '#e74c3c'
                  : undefined,
            }}
          >
            {isLoading
              ? 'Iniciando sesión...'
              : loginSuccess
              ? '¡Acceso concedido!'
              : errorField === 'general'
              ? 'Credenciales incorrectas'
              : 'Entrar'}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">Acceso Seguro</span>
        </div>

        <div className="forgot-password">
          <a href="#" className="forgot-link" onClick={showForgotPassword}>
            ¿Olvidaste tu contraseña?
          </a>
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
