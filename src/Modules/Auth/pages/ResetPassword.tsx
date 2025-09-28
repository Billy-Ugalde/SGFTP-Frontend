import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import '../styles/AuthForms.css';
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(true);
    const [showPasswords, setShowPasswords] = useState({
        password: false,
        confirmPassword: false
    });

    useEffect(() => {
        if (!token) {
            setError('Token de restablecimiento no válido');
            setIsValidating(false);
            return;
        }

        // Validar token con el backend
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await fetch(`http://localhost:3001/auth/validate-reset-token/${token}`, {
                method: 'GET',
            });

            if (!response.ok) {
                setError('El enlace de restablecimiento ha expirado o no es válido');
            }
        } catch (err) {
            setError('Error al validar el enlace');
        } finally {
            setIsValidating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = (): boolean => {
        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
            setError('La contraseña debe contener: mayúscula, minúscula, número y símbolo especial');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: formData.password,
                    confirmPassword: formData.confirmPassword
                }),
            });

            if (response.ok) {
                // Redirigir al login con mensaje de éxito
                navigate('/login', {
                    state: {
                        message: 'Contraseña restablecida exitosamente. Puedes iniciar sesión ahora.'
                    }
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al restablecer la contraseña');
            }
        } catch (err) {
            setError('Error de conexión. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <div className="auth-form__loading">
                        <p>Validando enlace...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !token) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <div className="auth-form__header">
                        <h2>Enlace Inválido</h2>
                    </div>
                    <div className="form-alert form-alert--error">
                        {error}
                    </div>
                    <div className="auth-form__footer">
                        <Link to="/forgot-password" className="auth-link">
                            Solicitar nuevo enlace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-form__header">
                    <h2>Nueva Contraseña</h2>
                    <p className="auth-form__subtitle">
                        Ingresa tu nueva contraseña
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form__form">
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Nueva Contraseña
                        </label>
                        <div className="form-input-password-container">
                            <input
                                type={showPasswords.password ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Mínimo 8 caracteres"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="form-input-password-toggle"
                                onClick={() => togglePasswordVisibility('password')}
                                aria-label={showPasswords.password ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPasswords.password ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirmar Contraseña
                        </label>
                        <div className="form-input-password-container">
                            <input
                                type={showPasswords.confirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Repite la contraseña"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="form-input-password-toggle"
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                aria-label={showPasswords.confirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPasswords.confirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="form-alert form-alert--error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`form-button form-button--primary ${isLoading ? 'form-button--loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
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

export default ResetPasswordPage;