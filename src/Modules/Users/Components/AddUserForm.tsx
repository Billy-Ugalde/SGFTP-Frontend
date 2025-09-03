import React, { useState } from 'react';
import { useAddUser, usePersons, useRoles, type CreateUserDto } from '../Services/UserService';
import '../styles/AddUserForm.css';

interface AddUserFormProps {
  onSuccess: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    password: '',
    id_person: 0,
    status: true,
    id_role: 0,
  });

  const [error, setError] = useState('');

  const addUser = useAddUser();
  const { data: persons = [], isLoading: isLoadingPersons } = usePersons();
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'id_person' || name === 'id_role'
          ? Number(value)
          : value
    }));
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres y contener mayúsculas, minúsculas, números y caracteres especiales');
      return;
    }

    if (!formData.id_person) {
      setError('Debe seleccionar una persona');
      return;
    }

    if (!formData.id_role) {
      setError('Debe seleccionar un rol');
      return;
    }

    try {
      const userData: CreateUserDto = {
        password: formData.password,
        id_person: formData.id_person,
        status: formData.status,
        id_role: formData.id_role,
      };

      await addUser.mutateAsync(userData);
      onSuccess();
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Error al crear el usuario');
    }
  };

  if (isLoadingPersons || isLoadingRoles) {
    return (
      <div className="add-user-form">
        <div className="add-user-form__loading">
          <svg className="add-user-form__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando datos...
        </div>
      </div>
    );
  }

  const getPersonFullName = (person: any) => {
    return `${person.first_name} ${person.second_name || ''} ${person.first_lastname} ${person.second_lastname || ''}`.trim();
  };

  return (
    <div className="add-user-form">
      <form onSubmit={handleSubmit} className="add-user-form__form">
        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="add-user-form__label">
            Contraseña <span className="add-user-form__required">*</span>
          </label>
          <div className="add-user-form__input-wrapper">
            <div className="add-user-form__icon">
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
              placeholder="Ingresa una contraseña segura"
              className="add-user-form__input add-user-form__input--with-icon"
              required
            />
          </div>
          <p className="add-user-form__help-text">
            Debe contener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
          </p>
        </div>

        {/* Persona */}
        <div>
          <label htmlFor="id_person" className="add-user-form__label">
            Persona <span className="add-user-form__required">*</span>
          </label>
          <div className="add-user-form__input-wrapper">
            <div className="add-user-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <select
              id="id_person"
              name="id_person"
              value={formData.id_person}
              onChange={handleChange}
              required
              className="add-user-form__input add-user-form__input--with-icon add-user-form__select"
            >
              <option value="">Selecciona una persona</option>
              {persons.map(person => (
                <option key={person.id_person} value={person.id_person}>
                  {getPersonFullName(person)} - {person.email}
                </option>
              ))}
            </select>
          </div>
          <p className="add-user-form__help-text">
            Selecciona la persona a la que se asignará este usuario
          </p>
        </div>

        {/* Rol */}
        <div>
          <label htmlFor="id_role" className="add-user-form__label">
            Rol <span className="add-user-form__required">*</span>
          </label>
          <div className="add-user-form__input-wrapper">
            <div className="add-user-form__icon">
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
              className="add-user-form__input add-user-form__input--with-icon add-user-form__select"
            >
              <option value="">Selecciona un rol</option>
              {roles.map(role => (
                <option key={role.id_role} value={role.id_role}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <p className="add-user-form__help-text">
            Define los permisos y accesos que tendrá el usuario
          </p>
        </div>

        {/* Estado */}
        <div>
          <label className="add-user-form__label">Estado del Usuario</label>
          <div className="add-user-form__checkbox-wrapper">
            <input
              id="status"
              name="status"
              type="checkbox"
              checked={formData.status}
              onChange={handleChange}
              className="add-user-form__checkbox"
            />
            <label htmlFor="status" className="add-user-form__checkbox-label">
              Usuario activo (puede acceder al sistema)
            </label>
          </div>
          <p className="add-user-form__help-text">
            Los usuarios inactivos no pueden iniciar sesión en el sistema
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="add-user-form__error">
            <svg className="add-user-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="add-user-form__error-text">{error}</p>
          </div>
        )}

        {/* Botones de Envío */}
        <div className="add-user-form__actions">
          <button
            type="button"
            onClick={onSuccess}
            className="add-user-form__cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={addUser.isPending}
            className={`add-user-form__submit-btn ${addUser.isPending ? 'add-user-form__submit-btn--loading' : ''}`}
          >
            {addUser.isPending ? (
              <>
                <svg className="add-user-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando Usuario...
              </>
            ) : (
              <>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;