import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/AuthForms.css';

const ResendActivationPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await authService.resendActivation({ email });
            setMessage(response.message);
            setEmail(''); // Limpiar formulario
        } catch (err: any) {
            if (err.response?.status === 429) {
                setError('Has excedido el límite de intentos. Por favor espera una hora antes de intentar nuevamente.');
            } else {
                setError(err.response?.data?.message || 'Ocurrió un error. Por favor intenta de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-form__header">
                    <h2>Reenviar Enlace de Activación</h2>
                    <p className="auth-form__subtitle">
                        Si tu enlace de activación expiró, ingresa tu email y te enviaremos uno nuevo
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form__form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="tu@email.com"
                            required
                            disabled={isLoading}
                            maxLength={50}
                        />
                    </div>

                    {error && (
                        <div className="form-alert form-alert--error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="form-alert form-alert--success">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`form-button form-button--primary ${isLoading ? 'form-button--loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Nuevo Enlace'}
                    </button>
                </form>

                <div className="auth-form__footer">
                    <Link to="/login" className="auth-link">
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResendActivationPage;
