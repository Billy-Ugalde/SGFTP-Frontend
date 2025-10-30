import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/ActivateAccountPage.css';
import { Eye, EyeOff } from "lucide-react";

interface FormData {
    password: string;
    confirmPassword: string;
}

interface PasswordValidation {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
}

const ActivateAccount: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState<FormData>({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);
    const [canRetry, setCanRetry] = useState(false);

    // Validaciones de contraseña
    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        if (!token) {
            setError('Token de activación no encontrado');
        }
    }, [token]);

    useEffect(() => {
        const password = formData.password;
        setPasswordValidation({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        });
    }, [formData.password]);

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!isPasswordValid) {
            setError('La contraseña no cumple con todos los requisitos');
            return;
        }

        if (!passwordsMatch) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/auth/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al activar la cuenta');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Cuenta activada exitosamente. Ya puedes iniciar sesión.' }
                });
            }, 3000);
            if (response.status === 410 || data.message?.includes('expirado')) {
                setError('El enlace de activación ha expirado. Solicita uno nuevo al administrador.');
                // Opcional: mostrar botón para solicitar nuevo enlace
                return;
            }

            if (response.status === 409 || data.message?.includes('ya activada')) {
                setError('Esta cuenta ya está activada. Puedes iniciar sesión directamente.');
                setTimeout(() => navigate('/login'), 3000);
                return;
            }
            if (response.status >= 500) {
                setError('Error del servidor. Puedes intentar nuevamente.');
                setCanRetry(true);
                return;
            }
        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'Error al activar la cuenta';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    if (!token) {
        return (
            <div className="activate-page">
                <div className="activate-page__container">
                    <div className="activate-page__icon">⚠️</div>
                    <h1>Token No Válido</h1>
                    <p>El enlace de activación no es válido o ha expirado.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                        <button onClick={() => navigate('/resend-activation')} className="activate-page__btn-primary">
                            Solicitar Nuevo Enlace
                        </button>
                        <button onClick={() => navigate('/login')} className="activate-page__btn-secondary" style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb' }}>
                            Ir al Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="activate-page">
                <div className="activate-page__container activate-page__success-message">
                    <div className="activate-page__icon">✅</div>
                    <div className="activate-page__redirect-message">Redirigiendo...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="activate-page">
            <div className="activate-page__container">
                <div className="activate-page__header">
                    <div className="activate-page__icon">🔒</div>
                    <h1 className="activate-page__title">Activar Cuenta</h1>
                    <p className="activate-page__subtitle">Crea tu contraseña para completar la activación</p>
                </div>

                <div className="activate-page__content">
                    {error && (
                        <div className="activate-page__error">
                            <span className="activate-page__error-icon">❌</span>
                            <div>
                                {error}
                                <div style={{ marginTop: '10px' }}>
                                    <button
                                        onClick={() => navigate('/resend-activation')}
                                        style={{
                                            background: '#2563eb',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Solicitar Nuevo Enlace
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="activate-page__form">
                        {/* Nueva Contraseña */}
                        <div className="activate-page__form-group">
                            <label className="activate-page__label">Nueva Contraseña</label>
                            <div className="activate-page__input-wrapper">
                                <input className="activate-page__input"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Ingresa tu nueva contraseña"
                                    required
                                    maxLength={64}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="activate-page__toggle-password"
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Validaciones de Contraseña */}
                        {formData.password && (
                            <div className="activate-page__requirements">
                                <p className="activate-page__requirements-title">Requisitos de contraseña:</p>
                                <div className="activate-page__requirements-list">
                                    <div className={passwordValidation.length ? 'activate-page__requirement activate-page__requirement--valid' : 'activate-page__requirement activate-page__requirement--invalid'}>
                                        <span className="activate-page__requirement-icon">{passwordValidation.length ? '✓' : '○'}</span>
                                        Al menos 8 caracteres
                                    </div>
                                    <div className={passwordValidation.uppercase ? 'activate-page__requirement activate-page__requirement--valid' : 'activate-page__requirement activate-page__requirement--invalid'}>
                                        <span>{passwordValidation.uppercase ? '✓' : '○'}</span>
                                        Una letra mayúscula
                                    </div>
                                    <div className={passwordValidation.lowercase ? 'activate-page__requirement activate-page__requirement--valid' : 'activate-page__requirement activate-page__requirement--invalid'}>
                                        <span>{passwordValidation.lowercase ? '✓' : '○'}</span>
                                        Una letra minúscula
                                    </div>
                                    <div className={passwordValidation.number ? 'activate-page__requirement activate-page__requirement--valid' : 'activate-page__requirement activate-page__requirement--invalid'}>
                                        <span>{passwordValidation.number ? '✓' : '○'}</span>
                                        Un número
                                    </div>
                                    <div className={passwordValidation.special ? 'activate-page__requirement activate-page__requirement--valid' : 'activate-page__requirement activate-page__requirement--invalid'}>
                                        <span>{passwordValidation.special ? '✓' : '○'}</span>
                                        Un carácter especial (@$!%*?&)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirmar Contraseña */}
                        <div className="activate-page__form-group">
                            <label className="activate-page__label">Confirmar Contraseña</label>
                            <div className="activate-page__input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirma tu contraseña"
                                    className={
                                        formData.confirmPassword && !passwordsMatch
                                            ? 'activate-page__input activate-page__input--error'
                                            : passwordsMatch
                                                ? 'activate-page__input activate-page__input--success'
                                                : 'activate-page__input'
                                    }
                                    required
                                    maxLength={64}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="activate-page__toggle-password"
                                >
                                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            {formData.confirmPassword && !passwordsMatch && (
                                <span className="activate-page__field-error">Las contraseñas no coinciden</span>)}
                            {passwordsMatch && (
                                <span className="activate-page__field-success">Las contraseñas coinciden</span>
                            )}
                        </div>

                        {/* Botón de Submit */}
                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                            className={`activate-page__submit ${loading || !isPasswordValid
                                || !passwordsMatch ? 'activate-page__submit--disabled' : ''}`}
                        >
                            {loading ? 'Activando cuenta...' : 'Activar Cuenta'}
                        </button>
                    </form>

                    <div className="activate-page__login-link">
                        <button onClick={() => navigate('/login')} className="activate-page__link-button">
                            ¿Ya tienes cuenta? Iniciar sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivateAccount;