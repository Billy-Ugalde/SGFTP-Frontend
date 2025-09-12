import React, { useState } from 'react';
import { useAddUser, useAddPerson, useRoles, type CreateUserDto, type CreatePersonDto, type PhoneType } from '../Services/UserService';
import ConfirmationModal from './ConfirmationModal';
import '../styles/AddUserForm.css';

interface AddUserFormProps {
  onSuccess: () => void;
}

const USER_FIELD_LIMITS = {
  firstName: 50,
  secondName: 50,
  firstLastname: 50,
  secondLastname: 50,
  email: 70,
  phoneNumber: 20,
  password: 75
};

const USER_FIELD_MIN_LIMITS = {
  firstName: 2,
  firstLastname: 2,
  secondLastname: 2,
  email: 5,
  phoneNumber: 7,
  password: 8
};

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess }) => {
  const [personFormData, setPersonFormData] = useState({
    first_name: '',
    second_name: '',
    first_lastname: '',
    second_lastname: '',
    email: '',
    phones: [
      {
        number: '',
        type: 'personal' as PhoneType,
        is_primary: true
      }
    ]
  });

  const [userFormData, setUserFormData] = useState({
    password: '',
    id_role: 0,
    status: true,
  });

  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<{ person: any, user: any } | null>(null);

  const addUser = useAddUser();
  const addPerson = useAddPerson();
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();

  const getCharacterCountClass = (currentLength: number, maxLength: number): string => {
    const remaining = maxLength - currentLength;
    if (remaining <= 0) {
      return 'add-user-form__character-count--error';
    } else if (remaining <= 10) {
      return 'add-user-form__character-count--warning';
    }
    return '';
  };

  const handlePersonDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setPersonFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setUserFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'id_role'
          ? Number(value)
          : value
    }));
  };

  const handlePhoneChange = (index: number, field: string, value: string) => {
    setPersonFormData(prev => ({
      ...prev,
      phones: prev.phones.map((phone, i) => 
        i === index ? { ...phone, [field]: value } : phone
      )
    }));
  };

  const addPhone = () => {
    setPersonFormData(prev => ({
      ...prev,
      phones: [
        ...prev.phones,
        {
          number: '',
          type: 'personal' as PhoneType,
          is_primary: false
        }
      ]
    }));
  };

  const removePhone = (index: number) => {
    if (personFormData.phones.length > 1) {
      setPersonFormData(prev => ({
        ...prev,
        phones: prev.phones.filter((_, i) => i !== index)
      }));
    }
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  };

  const validatePersonData = (): boolean => {
    if (personFormData.first_name.trim().length < USER_FIELD_MIN_LIMITS.firstName) {
      setError(`El primer nombre debe tener al menos ${USER_FIELD_MIN_LIMITS.firstName} caracteres`);
      return false;
    }
    if (personFormData.first_lastname.trim().length < USER_FIELD_MIN_LIMITS.firstLastname) {
      setError(`El primer apellido debe tener al menos ${USER_FIELD_MIN_LIMITS.firstLastname} caracteres`);
      return false;
    }
    if (personFormData.second_lastname.trim().length < USER_FIELD_MIN_LIMITS.secondLastname) {
      setError(`El segundo apellido debe tener al menos ${USER_FIELD_MIN_LIMITS.secondLastname} caracteres`);
      return false;
    }
    if (personFormData.email.trim().length < USER_FIELD_MIN_LIMITS.email) {
      setError(`El email debe tener al menos ${USER_FIELD_MIN_LIMITS.email} caracteres`);
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personFormData.email)) {
      setError('El email no tiene un formato válido');
      return false;
    }

    if (personFormData.phones.some(phone => phone.number.trim().length < USER_FIELD_MIN_LIMITS.phoneNumber)) {
      setError(`Todos los teléfonos deben tener al menos ${USER_FIELD_MIN_LIMITS.phoneNumber} caracteres`);
      return false;
    }

    return true;
  };

  const getFullName = () => {
    return `${personFormData.first_name} ${personFormData.second_name ? personFormData.second_name + ' ' : ''}${personFormData.first_lastname} ${personFormData.second_lastname}`.trim();
  };

  const getRoleName = () => {
    const selectedRole = roles.find(role => role.id_role === userFormData.id_role);
    return selectedRole ? selectedRole.name : 'Rol no encontrado';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePersonData()) {
      return;
    }

    if (userFormData.password.trim().length < USER_FIELD_MIN_LIMITS.password) {
      setError(`La contraseña debe tener al menos ${USER_FIELD_MIN_LIMITS.password} caracteres`);
      return;
    }

    if (!validatePassword(userFormData.password)) {
      setError('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales');
      return;
    }

    if (!userFormData.id_role) {
      setError('Debe seleccionar un rol');
      return;
    }

    const newPersonData: CreatePersonDto = {
      first_name: personFormData.first_name,
      second_name: personFormData.second_name || undefined,
      first_lastname: personFormData.first_lastname,
      second_lastname: personFormData.second_lastname,
      email: personFormData.email,
      phones: personFormData.phones.filter(phone => phone.number.trim())
    };

    const userData: CreateUserDto = {
      id_person: 0, 
      password: userFormData.password,
      id_role: userFormData.id_role,
      status: userFormData.status,
    };

    setPendingFormData({ person: newPersonData, user: userData });
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    if (!pendingFormData) return;

    setIsCreating(true);

    try {
      const createdPerson = await addPerson.mutateAsync(pendingFormData.person);

      const userData: CreateUserDto = {
        ...pendingFormData.user,
        id_person: createdPerson.id_person,
      };

      await addUser.mutateAsync(userData);
      setShowConfirmModal(false);
      setPendingFormData(null);
      onSuccess();
    } catch (err: any) {
      console.error('Error creating person/user:', err);
      setError(err.response?.data?.message || err.message || 'Error al crear la persona y usuario');
      setShowConfirmModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowConfirmModal(false);
    setPendingFormData(null);
  };

  if (isLoadingRoles) {
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

  return (
    <>
      <div className="add-user-form">
        <form onSubmit={handleSubmit} className="add-user-form__form" autoComplete="off">
          {/* Campos ocultos para confundir al navegador */}
          <input type="text" style={{ display: 'none' }} />
          <input type="password" style={{ display: 'none' }} />
          
          {/* Datos de la persona */}
          <div className="add-user-form__section">
            <h3 className="add-user-form__section-title">Datos Personales</h3>
            
            {/* Primer nombre */}
            <div>
              <label htmlFor="first_name" className="add-user-form__label">
                Primer Nombre <span className="add-user-form__required">campo obligatorio</span>
              </label>
              <div className="add-user-form__input-wrapper">
                <div className="add-user-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={personFormData.first_name}
                  onChange={handlePersonDataChange}
                  placeholder="Ingresa el primer nombre"
                  className="add-user-form__input add-user-form__input--with-icon"
                  maxLength={USER_FIELD_LIMITS.firstName}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="add-user-form__field-info">
                <div className="add-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.firstName} caracteres</div>
                <div className={`add-user-form__character-count ${getCharacterCountClass(personFormData.first_name.length, USER_FIELD_LIMITS.firstName)}`}>
                  {personFormData.first_name.length}/{USER_FIELD_LIMITS.firstName} caracteres
                </div>
              </div>
            </div>

            {/* Segundo nombre */}
            <div>
              <label htmlFor="second_name" className="add-user-form__label">
                Segundo Nombre <span className="add-user-form__optional">campo opcional</span>
              </label>
              <div className="add-user-form__input-wrapper">
                <div className="add-user-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="second_name"
                  name="second_name"
                  type="text"
                  value={personFormData.second_name}
                  onChange={handlePersonDataChange}
                  placeholder="Segundo nombre (opcional)"
                  className="add-user-form__input add-user-form__input--with-icon"
                  maxLength={USER_FIELD_LIMITS.secondName}
                  autoComplete="off"
                />
              </div>
              <div className="add-user-form__field-info">
                <div className="add-user-form__min-length">Opcional</div>
                <div className={`add-user-form__character-count ${getCharacterCountClass(personFormData.second_name.length, USER_FIELD_LIMITS.secondName)}`}>
                  {personFormData.second_name.length}/{USER_FIELD_LIMITS.secondName} caracteres
                </div>
              </div>
            </div>

            {/* Primer apellido */}
            <div>
              <label htmlFor="first_lastname" className="add-user-form__label">
                Primer Apellido <span className="add-user-form__required">campo obligatorio</span>
              </label>
              <div className="add-user-form__input-wrapper">
                <div className="add-user-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="first_lastname"
                  name="first_lastname"
                  type="text"
                  value={personFormData.first_lastname}
                  onChange={handlePersonDataChange}
                  placeholder="Ingresa el primer apellido"
                  className="add-user-form__input add-user-form__input--with-icon"
                  maxLength={USER_FIELD_LIMITS.firstLastname}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="add-user-form__field-info">
                <div className="add-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.firstLastname} caracteres</div>
                <div className={`add-user-form__character-count ${getCharacterCountClass(personFormData.first_lastname.length, USER_FIELD_LIMITS.firstLastname)}`}>
                  {personFormData.first_lastname.length}/{USER_FIELD_LIMITS.firstLastname} caracteres
                </div>
              </div>
            </div>

            {/* Segundo apellido */}
            <div>
              <label htmlFor="second_lastname" className="add-user-form__label">
                Segundo Apellido <span className="add-user-form__required">campo obligatorio</span>
              </label>
              <div className="add-user-form__input-wrapper">
                <div className="add-user-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="second_lastname"
                  name="second_lastname"
                  type="text"
                  value={personFormData.second_lastname}
                  onChange={handlePersonDataChange}
                  placeholder="Ingresa el segundo apellido"
                  className="add-user-form__input add-user-form__input--with-icon"
                  maxLength={USER_FIELD_LIMITS.secondLastname}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="add-user-form__field-info">
                <div className="add-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.secondLastname} caracteres</div>
                <div className={`add-user-form__character-count ${getCharacterCountClass(personFormData.second_lastname.length, USER_FIELD_LIMITS.secondLastname)}`}>
                  {personFormData.second_lastname.length}/{USER_FIELD_LIMITS.secondLastname} caracteres
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="add-user-form__label">
                Email <span className="add-user-form__required">campo obligatorio</span>
              </label>
              <div className="add-user-form__input-wrapper">
                <div className="add-user-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={personFormData.email}
                  onChange={handlePersonDataChange}
                  placeholder="Ingresa el email del usuario"
                  className="add-user-form__input add-user-form__input--with-icon"
                  maxLength={USER_FIELD_LIMITS.email}
                  required
                  autoComplete="off"
                  data-lpignore="true"
                />
              </div>
              <div className="add-user-form__field-info">
                <div className="add-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.email} caracteres</div>
                <div className={`add-user-form__character-count ${getCharacterCountClass(personFormData.email.length, USER_FIELD_LIMITS.email)}`}>
                  {personFormData.email.length}/{USER_FIELD_LIMITS.email} caracteres
                </div>
              </div>
            </div>

            {/* Teléfonos */}
            <div>
              <label className="add-user-form__label">
                Teléfonos <span className="add-user-form__required">campo obligatorio</span>
              </label>
              {personFormData.phones.map((phone, index) => (
                <div key={index} className="add-user-form__phone-group">
                  <div className="add-user-form__phone-inputs">
                    <div className="add-user-form__input-wrapper" style={{ flex: 2 }}>
                      <div className="add-user-form__icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={phone.number}
                        onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                        placeholder="Número de teléfono"
                        className="add-user-form__input add-user-form__input--with-icon"
                        maxLength={USER_FIELD_LIMITS.phoneNumber}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <select
                      value={phone.type}
                      onChange={(e) => handlePhoneChange(index, 'type', e.target.value)}
                      className="add-user-form__input add-user-form__select"
                      style={{ flex: 1 }}
                    >
                      <option value="personal">Personal</option>
                      <option value="business">Trabajo</option>
                    </select>
                    {personFormData.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhone(index)}
                        className="add-user-form__remove-phone"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="add-user-form__field-info">
                    <div className="add-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.phoneNumber} caracteres</div>
                    <div className={`add-user-form__character-count ${getCharacterCountClass(phone.number.length, USER_FIELD_LIMITS.phoneNumber)}`}>
                      {phone.number.length}/{USER_FIELD_LIMITS.phoneNumber} caracteres
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addPhone}
                className="add-user-form__add-phone"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar teléfono
              </button>
            </div>
          </div>

          {/* Datos del usuario */}
          <div className="add-user-form__section">
            <h3 className="add-user-form__section-title">Datos de Acceso</h3>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="add-user-form__label">
                Contraseña <span className="add-user-form__required">campo obligatorio</span>
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
                  value={userFormData.password}
                  onChange={handleUserDataChange}
                  placeholder="Ingresa una contraseña segura"
                  className="add-user-form__input add-user-form__input--with-icon"
                  maxLength={USER_FIELD_LIMITS.password}
                  required
                  autoComplete="new-password"
                  data-lpignore="true"
                />
              </div>
              <div className="add-user-form__field-info">
                <div className="add-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.password} caracteres</div>
                <div className={`add-user-form__character-count ${getCharacterCountClass(userFormData.password.length, USER_FIELD_LIMITS.password)}`}>
                  {userFormData.password.length}/{USER_FIELD_LIMITS.password} caracteres
                </div>
              </div>
              <p className="add-user-form__help-text">
                Debe contener mayúsculas, minúsculas, números y caracteres especiales
              </p>
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="id_role" className="add-user-form__label">
                Rol <span className="add-user-form__required">campo obligatorio</span>
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
                  value={userFormData.id_role}
                  onChange={handleUserDataChange}
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
              <label className="add-user-form__label">Estado del Usuario <span className="add-user-form__initial-editable">valor inicial editable</span></label>
              <div className="add-user-form__checkbox-wrapper">
                <input
                  id="status"
                  name="status"
                  type="checkbox"
                  checked={userFormData.status}
                  onChange={handleUserDataChange}
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
              disabled={isCreating}
              className={`add-user-form__submit-btn ${isCreating ? 'add-user-form__submit-btn--loading' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear Usuario
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelCreate}
        onConfirm={handleConfirmCreate}
        title="Confirmar creación de usuario"
        message={`¿Estás seguro de que deseas crear el usuario "${getFullName()}" con el rol "${getRoleName()}"?`}
        confirmText="Crear Usuario"
        cancelText="Cancelar"
        type="info"
        isLoading={isCreating}
      />
    </>
  );
};

export default AddUserForm;