import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login-page.css';
import { queryClient } from '../../../main';
import { useLoginMutation } from '../hooks/useAuthQueries';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      
      // ← CAMBIAR: Usar mutateAsync en lugar de authService.login
      const result = await loginMutation.mutateAsync({ email, password });
      
      console.log('2. Login exitoso:', result);
      console.log('3. Usuario:', result.user);
      
      // El cache ya se actualizó automáticamente por onSuccess
      navigate('/admin/dashboard');
      
    } catch (error: any) {
      console.error('Error completo:', error);
      setErrorMsg(error.response?.data?.message || 'Error al iniciar sesión');
    }
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
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Iniciando sesión...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm;


