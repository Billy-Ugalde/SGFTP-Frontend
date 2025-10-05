import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthForms.css';

const ForgotPasswordPage: React.FC = () => {
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
            // TODO: Llamada a la API
            const response = await fetch('http://localhost:3001/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setMessage('Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.');
                setEmail(''); // Limpiar formulario
            } else {
                setError('Ocurrió un error. Por favor intenta de nuevo.');
            }
        } catch (err) {
            setError('Error de conexión. Verifica tu conexión a internet.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-form__header">
                    <h2>Restablecer Contraseña</h2>
                    <p className="auth-form__subtitle">
                        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
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
                        {isLoading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
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

export default ForgotPasswordPage;