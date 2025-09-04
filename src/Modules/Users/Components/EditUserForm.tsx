import React, { useState, useEffect } from 'react';
import { useUpdateUser, useRoles, type UpdateUserDto, type User } from '../Services/UserService';
import '../styles/EditUserForm.css';

interface EditUserFormProps {
  user: User;
  onSuccess: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    password: '',
    id_role: 0,
    status: true,
  });

  const [error, setError] = useState('');

  const updateUser = useUpdateUser();
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();

  useEffect(() => {
    if (user) {
      setFormData({
        password: '',
        id_role: user.role.id_role,
        status: user.status,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'id_role'
          ? Number(value)
          : value
    }));
  };

  const validatePassword = (password: string): boolean => {
    if (!password) return true;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password && !validatePassword(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres y contener mayúsculas, minúsculas, números y caracteres especiales');
      return;
    }

    if (!formData.id_role) {
      setError('Debe seleccionar un rol');
      return;
    }

    try {
      const updateData: UpdateUserDto = {
        status: formData.status,
        id_role: formData.id_role,
      };
      
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      await updateUser.mutateAsync({
        id_user: user.id_user,
        ...updateData
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Error al actualizar el usuario');
    }
  };

  if (isLoadingRoles) {
    return (
      <div className="edit-user-form">
        <div className="edit-user-form__loading">
          <svg className="edit-user-form__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando datos...
        </div>
      </div>
    );
  }

  const getPersonFullName = () => {
    const { first_name, second_name, first_lastname, second_lastname } = user.person;
    return `${first_name} ${second_name || ''} ${first_lastname} ${second_lastname || ''}`.trim();
  };

  return (
    <div className="edit-user-form">
      <form onSubmit={handleSubmit} className="edit-user-form__form">
        {/* Información del Usuario (Solo lectura) - PRIMERO */}
        <div className="edit-user-form__user-info">
          <h3 className="edit-user-form__user-info-title">Información de la Persona</h3>
          <div className="edit-user-form__user-details">
            <div className="edit-user-form__detail-item">
              <span className="edit-user-form__detail-label">Nombre Completo:</span>
              <span className="edit-user-form__detail-value">{getPersonFullName()}</span>
            </div>
            <div className="edit-user-form__detail-item">
              <span className="edit-user-form__detail-label">Email:</span>
              <span className="edit-user-form__detail-value">{user.person.email}</span>
            </div>
            <div className="edit-user-form__detail-item">
              <span className="edit-user-form__detail-label">ID Usuario:</span>
              <span className="edit-user-form__detail-value">{user.id_user}</span>
            </div>
            {user.person.phones && user.person.phones.length > 0 && (
              <div className="edit-user-form__detail-item">
                <span className="edit-user-form__detail-label">Teléfonos:</span>
                <span className="edit-user-form__detail-value">
                  {user.person.phones.map((phone, index) => (
                    <span key={index} className="edit-user-form__phone">
                      {phone.number} ({phone.type === 'personal' ? 'Personal' : 'Trabajo'}){phone.is_primary && ' (Principal)'}
                      {index < user.person.phones!.length - 1 && ', '}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contraseña - SEGUNDO */}
        <div>
          <label htmlFor="password" className="edit-user-form__label">
            Nueva Contraseña
            <span className="edit-user-form__optional">(Dejar en blanco para mantener la actual)</span>
          </label>
          <div className="edit-user-form__input-wrapper">
            <div className="edit-user-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa una nueva contraseña (opcional)"
              className="edit-user-form__input edit-user-form__input--with-icon"
            />
          </div>
          <p className="edit-user-form__help-text">
            Si desea cambiar la contraseña, debe contener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
          </p>
        </div>

        {/* Rol - TERCERO */}
        <div>
          <label htmlFor="id_role" className="edit-user-form__label">
            Rol <span className="edit-user-form__required">*</span>
          </label>
          <div className="edit-user-form__input-wrapper">
            <div className="edit-user-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <select
              id="id_role"
              name="id_role"
              value={formData.id_role}
              onChange={handleChange}
              required
              className="edit-user-form__input edit-user-form__input--with-icon edit-user-form__select"
            >
              <option value="">Selecciona un rol</option>
              {roles.map(role => (
                <option key={role.id_role} value={role.id_role}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <p className="edit-user-form__help-text">
            Define los permisos y accesos que tendrá el usuario
          </p>
        </div>

        {/* Estado - CUARTO */}
        <div>
          <label className="edit-user-form__label">Estado del Usuario</label>
          <div className="edit-user-form__checkbox-wrapper">
            <input
              id="status"
              name="status"
              type="checkbox"
              checked={formData.status}
              onChange={handleChange}
              className="edit-user-form__checkbox"
            />
            <label htmlFor="status" className="edit-user-form__checkbox-label">
              Usuario activo (puede acceder al sistema)
            </label>
          </div>
          <p className="edit-user-form__help-text">
            Los usuarios inactivos no pueden iniciar sesión en el sistema
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="edit-user-form__error">
            <svg className="edit-user-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="edit-user-form__error-text">{error}</p>
          </div>
        )}

        {/* Botones de Envío */}
        <div className="edit-user-form__actions">
          <button
            type="button"
            onClick={onSuccess}
            className="edit-user-form__cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={updateUser.isPending}
            className={`edit-user-form__submit-btn ${updateUser.isPending ? 'edit-user-form__submit-btn--loading' : ''}`}
          >
            {updateUser.isPending ? (
              <>
                <svg className="edit-user-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando Usuario...
              </>
            ) : (
              <>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;