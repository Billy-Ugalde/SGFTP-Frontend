import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login-page.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!validateEmail(email)) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (email === 'admin@tamarindopark.org' && password === 'admin123') {
        setSuccess(true);
        setErrorMsg('');
        localStorage.setItem('token', 'fake-token');
        navigate('/admin/dashboard');
      } else {
        setErrorMsg('Credenciales incorrectas');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="form-group">
        <label htmlFor="email" className="form-label">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input ${errorMsg.includes('correo') || errorMsg.includes('Credenciales') ? 'error' : ''}`}
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${errorMsg.includes('contraseña') || errorMsg.includes('Credenciales') ? 'error' : ''}`}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {success && <div className="success-message">Acceso concedido</div>}

      <button
        type="submit"
        className={`login-btn ${loading ? 'loading' : ''}`}
        disabled={loading}
      >
        {loading ? 'Iniciando sesión...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm;
