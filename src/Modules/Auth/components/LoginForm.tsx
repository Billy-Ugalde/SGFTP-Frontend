import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login-page.css';
import { queryClient } from '../../../main';
import { useLoginMutation } from '../hooks/useAuthQueries';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  //const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const loginMutation = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un email válido.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      console.log('1. Iniciando login...');
      const result = await loginMutation.mutateAsync({ email, password });
      console.log('2. Login exitoso:', result);
      console.log('3. Usuario:', result.user);
      if (result.user.roles.includes('volunteer') || result.user.roles.includes('entrepreneur')) {
        navigate('/');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      setErrorMsg(error?.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  // 🔸 Detecta si el mensaje de error sugiere credenciales inválidas
  const isCredsError = /correo|contrase|credenciales|incorrect/i.test(errorMsg || '');

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

      {/* 🔻 Mensaje pequeño entre los dos inputs */}
      {isCredsError && (
        <div className="inline-error" role="status" aria-live="polite">
          Correo o contraseña incorrectos
        </div>
      )}

      <div className="form-group">
        <label htmlFor="password" className="form-label">Contraseña</label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            className={`form-input ${errorMsg.includes('contraseña') || errorMsg.includes('Credenciales') ? 'error' : ''}`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {success && <div className="success-message">Acceso concedido</div>}

      <button
        type="submit"
        className={`login-btn ${loading ? 'loading' : ''}`}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Iniciando sesión...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm;
