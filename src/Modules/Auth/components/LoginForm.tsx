import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/login-page.css';

import { useLoginMutation } from '../hooks/useAuthQueries';
import { Eye, EyeOff } from "lucide-react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success] = useState(false);

  //const { login, isLoading } = useAuth();
  const navigate = useNavigate();

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
          maxLength={50}
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
            maxLength={64}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <Eye width="20" height="20" />)
              :
              (<EyeOff width="20" height="20" />)
            }
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
