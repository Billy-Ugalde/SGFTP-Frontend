import React, { useState } from 'react';
import { useChangePassword } from '../hooks/usePasswordMutations';
import type { ChangePasswordRequest } from '../types/auth.types';
import '../styles/ChangePasswordForm.css';

interface ChangePasswordFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
    onSuccess,
    onCancel
}) => {
    const [formData, setFormData] = useState<ChangePasswordRequest>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const changePasswordMutation = useChangePassword();

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
            newErrors.newPassword = 'La contraseña debe contener: mayúscula, minúscula, número y símbolo especial';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'La confirmación es requerida';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await changePasswordMutation.mutateAsync(formData);
            alert('Contraseña cambiada exitosamente. Debes volver a iniciar sesión.');
            onSuccess?.();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña';
            setErrors({ submit: errorMessage });
        }
    };

    const handleInputChange = (field: keyof ChangePasswordRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="change-password-form">
            <div className="change-password-form__header">
                <h3>Cambiar Contraseña</h3>
                <p className="change-password-form__subtitle">Por seguridad, deberás volver a iniciar sesión después del cambio.</p>
            </div>

            <form onSubmit={handleSubmit} className="change-password-form__form">
                {/* Contraseña Actual */}
                <div className="change-password-form__group">
                    <label htmlFor="currentPassword" className="change-password-form__label">
                        Contraseña Actual
                    </label>
                    <div className="change-password-form__input-container">
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                            className={`change-password-form__input ${errors.currentPassword ? 'change-password-form__input--error' : ''}`}
                            placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                            type="button"
                            className="change-password-form__toggle"
                            onClick={() => togglePasswordVisibility('current')}
                        >
                            {showPasswords.current ? '👁️' : '🙈'}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <span className="change-password-form__error">{errors.currentPassword}</span>
                    )}
                </div>

                {/* Nueva Contraseña */}
                <div className="change-password-form__group">
                    <label htmlFor="newPassword" className="change-password-form__label">
                        Nueva Contraseña
                    </label>
                    <div className="change-password-form__input-container">
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            className={`change-password-form__input ${errors.newPassword ? 'change-password-form__input--error' : ''}`}
                            placeholder="Mínimo 8 caracteres con mayúscula, número y símbolo"
                        />
                        <button
                            type="button"
                            className="change-password-form__toggle"
                            onClick={() => togglePasswordVisibility('new')}
                        >
                            {showPasswords.new ? '👁️' : '🙈'}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <span className="change-password-form__error">{errors.newPassword}</span>
                    )}
                </div>

                {/* Confirmar Contraseña */}
                <div className="change-password-form__group">
                    <label htmlFor="confirmPassword" className="change-password-form__label">
                        Confirmar Nueva Contraseña
                    </label>
                    <div className="change-password-form__input-container">
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`change-password-form__input ${errors.confirmPassword ? 'change-password-form__input--error' : ''}`}
                            placeholder="Repite tu nueva contraseña"
                        />
                        <button
                            type="button"
                            className="change-password-form__toggle"
                            onClick={() => togglePasswordVisibility('confirm')}
                        >
                            {showPasswords.confirm ? '👁️' : '🙈'}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <span className="change-password-form__error">{errors.confirmPassword}</span>
                    )}
                </div>

                {/* Error de envío */}
                {errors.submit && (
                    <div className="change-password-form__submit-error">
                        {errors.submit}
                    </div>
                )}

                {/* Botones */}
                <div className="change-password-form__buttons">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="change-password-form__button change-password-form__button--cancel"
                            disabled={changePasswordMutation.isPending}
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        className="change-password-form__button change-password-form__button--submit"
                        disabled={changePasswordMutation.isPending}
                    >
                        {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                </div>
            </form>
        </div>
    );
};