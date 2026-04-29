import React, { useState } from 'react';
import { useAddCompleteUser, useRoles, type CreateUserDto, type CreatePersonDto, type CreateCompleteInvitationDto } from '../Services/UserService';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/AddUserForm.css';
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface AddUserFormProps {
  onSuccess: () => void;
}

const USER_FIELD_LIMITS = {
  firstName: 50,
  secondName: 50,
  firstLastname: 50,
  secondLastname: 50,
  email: 50,
  phoneNumber: 20,
  password: 75
};

const USER_FIELD_MIN_LIMITS = {
  firstName: 2,
  firstLastname: 2,
  secondLastname: 2,
  email: 6,
  phoneNumber: 7,
  password: 8
};

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personFormData, setPersonFormData] = useState({
    first_name: '',
    second_name: '',
    first_lastname: '',
    second_lastname: '',
    email: '',
    phone_primary: '',
    phone_secondary: ''
  });

  const [userFormData, setUserFormData] = useState({
    id_roles: [] as number[],
    status: true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<{ person: any, user: any } | null>(null);

  const addCompleteUser = useAddCompleteUser();
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
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
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

  const validatePersonData = (): boolean => {
    const errors: Record<string, string> = {};
    if (personFormData.first_name.trim().length < USER_FIELD_MIN_LIMITS.firstName)
      errors.first_name = `El primer nombre debe tener al menos ${USER_FIELD_MIN_LIMITS.firstName} caracteres.`;
    if (personFormData.first_lastname.trim().length < USER_FIELD_MIN_LIMITS.firstLastname)
      errors.first_lastname = `El primer apellido debe tener al menos ${USER_FIELD_MIN_LIMITS.firstLastname} caracteres.`;
    if (personFormData.second_lastname.trim().length < USER_FIELD_MIN_LIMITS.secondLastname)
      errors.second_lastname = `El segundo apellido debe tener al menos ${USER_FIELD_MIN_LIMITS.secondLastname} caracteres.`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (personFormData.email.trim().length < USER_FIELD_MIN_LIMITS.email)
      errors.email = `El email debe tener al menos ${USER_FIELD_MIN_LIMITS.email} caracteres.`;
    else if (!emailRegex.test(personFormData.email))
      errors.email = 'El email no tiene un formato válido.';
    if (!personFormData.phone_primary)
      errors.phone_primary = 'El teléfono principal es obligatorio.';
    else if (!validatePhone(personFormData.phone_primary))
      errors.phone_primary = 'El teléfono principal no es válido. Selecciona el código de país e ingresa el número.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUserData = (): boolean => {
    const errors: Record<string, string> = {};
    if (userFormData.id_roles.length === 0)
      errors.id_roles = 'Debe seleccionar al menos un rol.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getFullName = () => {
    return `${personFormData.first_name} ${personFormData.second_name ? personFormData.second_name + ' ' : ''}${personFormData.first_lastname} ${personFormData.second_lastname}`.trim();
  };

  const getRoleDisplayName = (roleName: string): string => {
    const roleTranslations: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'general_admin': 'Administrador General',
      'fair_admin': 'Administrador de Ferias',
      'content_admin': 'Administrador de Contenido',
      'auditor': 'Auditor',
    };

    return roleTranslations[roleName] || roleName;
  };

  const getRoleName = () => {
    const selectedRoles = roles.filter(role => userFormData.id_roles.includes(role.id_role));
    return selectedRoles.map(role => getRoleDisplayName(role.name)).join(', ');
  };

  const handleNextStep = () => {
    setFieldErrors({});
    if (currentStep === 1) {
      if (validatePersonData()) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    setFieldErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!validateUserData()) {
      return;
    }

    const newPersonData: CreatePersonDto = {
      first_name: personFormData.first_name,
      second_name: personFormData.second_name || undefined,
      first_lastname: personFormData.first_lastname,
      second_lastname: personFormData.second_lastname,
      email: personFormData.email,
      phone_primary: personFormData.phone_primary,
      phone_secondary: personFormData.phone_secondary?.trim() || undefined
    };

    const userData: CreateUserDto = {
      id_person: 0,
      id_roles: userFormData.id_roles,
      status: userFormData.status,
    };

    setPendingFormData({ person: newPersonData, user: userData });
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    if (!pendingFormData) return;

    setIsCreating(true);

    try {
      const completeData: CreateCompleteInvitationDto = {
        // Person data
        first_name: pendingFormData.person.first_name,
        second_name: pendingFormData.person.second_name,
        first_lastname: pendingFormData.person.first_lastname,
        second_lastname: pendingFormData.person.second_lastname,
        email: pendingFormData.person.email,
        phone_primary: pendingFormData.person.phone_primary,
        phone_secondary: pendingFormData.person.phone_secondary,
        // User data
        id_roles: pendingFormData.user.id_roles,
        status: pendingFormData.user.status,
      };

      await addCompleteUser.mutateAsync(completeData);
      setShowConfirmModal(false);
      setPendingFormData(null);
      onSuccess();
    } catch (err: any) {
      console.error('Error creating invitation:', err);
      setApiError(err.response?.data?.message || err.message || 'Error al crear la invitación.');
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

  const renderStepIndicator = () => (
    <div className="add-user-form__step-indicator">
      <div className="add-user-form__steps">
        <div className={`add-user-form__step ${currentStep >= 1 ? 'add-user-form__step--active' : ''}`}>
          <div className="add-user-form__step-number">1</div>
          <div className="add-user-form__step-label">Datos Personales</div>
        </div>
        <div className="add-user-form__step-divider"></div>
        <div className={`add-user-form__step ${currentStep >= 2 ? 'add-user-form__step--active' : ''}`}>
          <div className="add-user-form__step-number">2</div>
          <div className="add-user-form__step-label">Configuración de Acceso</div>
        </div>
      </div>
    </div>
  );

  const renderPersonalDataStep = () => (
    <div className="add-user-form__section">
      <h3 className="add-user-form__section-title">Datos Personales</h3>
      <p className="add-user-form__required-legend"><span className="add-user-form__required">*</span> Campo obligatorio</p>

      {/* Primer nombre */}
      <div>
        <label htmlFor="first_name" className="add-user-form__label">
          Primer Nombre{' '}
          {personFormData.first_name.trim().length < USER_FIELD_MIN_LIMITS.firstName && <span className="add-user-form__required">*</span>}
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
            autoComplete="off"
          />
        </div>
        {fieldErrors.first_name && <span className="add-user-form__error-text">{fieldErrors.first_name}</span>}
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
          Segundo Nombre{' '}
          {!personFormData.second_name?.trim() && <span className="add-user-form__optional">(opcional)</span>}
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
          Primer Apellido{' '}
          {personFormData.first_lastname.trim().length < USER_FIELD_MIN_LIMITS.firstLastname && <span className="add-user-form__required">*</span>}
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
            autoComplete="off"
          />
        </div>
        {fieldErrors.first_lastname && <span className="add-user-form__error-text">{fieldErrors.first_lastname}</span>}
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
          Segundo Apellido{' '}
          {personFormData.second_lastname.trim().length < USER_FIELD_MIN_LIMITS.secondLastname && <span className="add-user-form__required">*</span>}
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
            autoComplete="off"
          />
        </div>
        {fieldErrors.second_lastname && <span className="add-user-form__error-text">{fieldErrors.second_lastname}</span>}
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
          Email{' '}
          {!personFormData.email.trim() && <span className="add-user-form__required">*</span>}
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
            autoComplete="new'password"
            data-lpignore="true"
            data-form-type="other"
          />
        </div>
        {fieldErrors.email && <span className="add-user-form__error-text">{fieldErrors.email}</span>}
        <div className="add-user-form__field-info">
          <div className="add-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.email} caracteres</div>
          <div className={`add-user-form__character-count ${getCharacterCountClass(personFormData.email.length, USER_FIELD_LIMITS.email)}`}>
            {personFormData.email.length}/{USER_FIELD_LIMITS.email} caracteres
          </div>
        </div>
      </div>

      {/* Teléfono Principal */}
      <PhoneInputField
        label="Teléfono Principal"
        required
        value={personFormData.phone_primary}
        onChange={(val) => { setPersonFormData(prev => ({ ...prev, phone_primary: val })); if (fieldErrors.phone_primary) setFieldErrors(prev => ({ ...prev, phone_primary: '' })); }}
        error={fieldErrors.phone_primary || (personFormData.phone_primary && !validatePhone(personFormData.phone_primary) ? 'El número de teléfono no es válido.' : undefined)}
        variant="add"
      />

      {/* Teléfono Secundario */}
      <PhoneInputField
        label="Teléfono Secundario"
        value={personFormData.phone_secondary}
        onChange={(val) => setPersonFormData(prev => ({ ...prev, phone_secondary: val }))}
        error={
          personFormData.phone_secondary && !validatePhone(personFormData.phone_secondary)
            ? 'El número de teléfono no es válido'
            : undefined
        }
        variant="add"
      />
    </div>
  );

  const renderAccessConfigStep = () => (
    <div className="add-user-form__section">
      <h3 className="add-user-form__section-title">Configuración de Acceso</h3>
      <p className="add-user-form__required-legend"><span className="add-user-form__required">*</span> Campo obligatorio</p>
      <div className="add-user-form__info-section">
        <div className="add-user-form__info-card">
          <div>
            <h4 className="add-user-form__info-title">Activación de Cuenta</h4>
            <p className="add-user-form__info-text">
              El usuario recibirá un email de invitación para establecer su propia contraseña de forma segura.
            </p>
          </div>
        </div>
      </div>
      {/* Rol */}
      <div>
        <label htmlFor="id_roles" className="add-user-form__label">
          Roles{' '}
          {userFormData.id_roles.length === 0 && <span className="add-user-form__required">*</span>}
        </label>
        <div className="add-user-form__multi-select">
          {roles
            .filter(role => {
              // Filtrar super_admin - nadie puede crear super_admin
              return (role.name !== 'super_admin' &&
                role.name !== 'volunteer' &&
                role.name !== 'entrepreneur'
              );
            })
            .map(role => (
              <div key={role.id_role} className="add-user-form__checkbox-wrapper">
                <input
                  id={`role-${role.id_role}`}
                  type="checkbox"
                  checked={userFormData.id_roles.includes(role.id_role)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setUserFormData(prev => ({
                        ...prev,
                        id_roles: [...prev.id_roles, role.id_role]
                      }));
                    } else {
                      setUserFormData(prev => ({
                        ...prev,
                        id_roles: prev.id_roles.filter(id => id !== role.id_role)
                      }));
                    }
                  }}
                  className="add-user-form__checkbox"
                />
                <label htmlFor={`role-${role.id_role}`} className="add-user-form__checkbox-label">
                  {getRoleDisplayName(role.name)}
                </label>
              </div>
            ))}
        </div>
        {fieldErrors.id_roles && <span className="add-user-form__error-text">{fieldErrors.id_roles}</span>}
        <p className="add-user-form__help-text">
          Selecciona uno o más roles que tendrá el usuario
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
  );

  return (
    <>
      <div className="add-user-form">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="add-user-form__form" autoComplete="off" noValidate>
          {/* Campos ocultos para confundir al navegador */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
            <input type="text" name="username" tabIndex={-1} autoComplete="username" />
            <input type="password" name="password" tabIndex={-1} autoComplete="current-password" />
            <input type="email" name="user_email" tabIndex={-1} autoComplete="email" />
          </div>

          {currentStep === 1 && renderPersonalDataStep()}
          {currentStep === 2 && renderAccessConfigStep()}

          {apiError && <p className="add-user-form__error-text">{apiError}</p>}

          {/* Botones de navegación */}
          <div className="add-user-form__actions">
            {currentStep === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onSuccess}
                  className="add-user-form__cancel-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="add-user-form__next-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  Siguiente
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="add-user-form__back-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 17l-5-5m0 0l5-5m-5 5h12"
                    />
                  </svg>
                  Anterior
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`add-user-form__submit-btn ${isCreating ? "add-user-form__submit-btn--loading" : ""
                    }`}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Crear Usuario
                </button>
              </>
            )}
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