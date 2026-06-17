import React, { useState, useEffect, useRef } from "react";
import { UserCog, ShieldCheck } from 'lucide-react';
import {
  useUpdatePerson,
  useRoles,
  useUpdateUserRoles,
  type UpdatePersonDto,
  type User,
} from "../Services/UserService";
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { useSuccessAlert } from '../../Shared/components';
import { copyUpdate } from '../../Shared/utils/confirmationCopy';
import "../Styles/EditUserForm.css";
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface EditUserFormProps {
  user: User;
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

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSuccess }) => {
  const { showSuccess } = useSuccessAlert();
  const originalRef = useRef({
    first_name: user.person.first_name || "",
    second_name: user.person.second_name || "",
    first_lastname: user.person.first_lastname || "",
    second_lastname: user.person.second_lastname || "",
    email: user.person.email || "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [personFormData, setPersonFormData] = useState({
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    email: "",
    phone_primary: "",
    phone_secondary: "",
  });

  const [userFormData, setUserFormData] = useState({
    id_roles: [] as number[],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<{ person: any, user: any } | null>(null);

  const updateUserRoles = useUpdateUserRoles();
  const updatePerson = useUpdatePerson();
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();

  const getCharacterCountClass = (currentLength: number, maxLength: number): string => {
    const remaining = maxLength - currentLength;
    if (remaining <= 0) {
      return 'edit-user-form__character-count--error';
    } else if (remaining <= 10) {
      return 'edit-user-form__character-count--warning';
    }
    return '';
  };

  useEffect(() => {
    if (user) {
      setPersonFormData({
        first_name: user.person.first_name || "",
        second_name: user.person.second_name || "",
        first_lastname: user.person.first_lastname || "",
        second_lastname: user.person.second_lastname || "",
        email: user.person.email || "",
        phone_primary: user.person.phone_primary || "",
        phone_secondary: user.person.phone_secondary || "",
      });

      setUserFormData({
        id_roles: user.roles.map(role => role.id_role),  // ← CAMBIO: mapear todos los roles
      });
    }
  }, [user]);

  const handlePersonDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));

    setPersonFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (!personFormData.phone_primary)
      errors.phone_primary = 'El teléfono principal es obligatorio.';
    else if (!validatePhone(personFormData.phone_primary))
      errors.phone_primary = 'El teléfono principal no es válido. Selecciona el código de país e ingresa el número.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const order = ['first_name', 'first_lastname', 'second_lastname', 'phone_primary'];
      const firstKey = order.find(k => errors[k]);
      if (firstKey) {
        const el = document.getElementById(firstKey) as HTMLElement | null;
        el?.focus();
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return Object.keys(errors).length === 0;
  };

  const validateUserData = (): boolean => {
    const errors: Record<string, string> = {};
    if (userFormData.id_roles.length === 0)
      errors.id_roles = 'Debe seleccionar al menos un rol.';
    setFieldErrors(errors);
    if (errors.id_roles) {
      const el = document.getElementById('id_roles') as HTMLElement | null;
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return Object.keys(errors).length === 0;
  };

  const getFullName = () => {
    return `${personFormData.first_name} ${personFormData.second_name ? personFormData.second_name + ' ' : ''}${personFormData.first_lastname} ${personFormData.second_lastname}`.trim();
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

    const updatePersonData: UpdatePersonDto = {
      first_name: personFormData.first_name,
      second_name: personFormData.second_name.trim() === "" ? null : personFormData.second_name,
      first_lastname: personFormData.first_lastname,
      second_lastname: personFormData.second_lastname,
      email: personFormData.email,
      phone_primary: personFormData.phone_primary,
      phone_secondary: personFormData.phone_secondary?.trim() || undefined,
    };

    // AGREGAR ESTA LÍNEA - CREAR userData:
    const userData = {
      id_roles: userFormData.id_roles,
    };

    setPendingFormData({ person: updatePersonData, user: userData });
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingFormData) return;

    setIsUpdating(true);

    try {
      // Actualizar datos de persona
      await updatePerson.mutateAsync({
        id: user.person.id_person,
        ...pendingFormData.person,
      });

      // Actualizar roles del usuario
      await updateUserRoles.mutateAsync({
        id_user: user.id_user,
        id_roles: pendingFormData.user.id_roles,
      });

      setShowConfirmModal(false);
      setPendingFormData(null);
      showSuccess('El usuario ha sido actualizado exitosamente.');
      onSuccess();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setApiError(err.response?.data?.message || err.message || 'Error al actualizar el usuario.');
      setShowConfirmModal(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
    setPendingFormData(null);
  };

  if (isLoadingRoles) {
    return (
      <div className="edit-user-form">
        <div className="edit-user-form__loading">
          <svg
            className="edit-user-form__loading-spinner"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando datos...
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="edit-user-form__progress">
      <div className="edit-user-form__progress-bar">
        <div
          className="edit-user-form__progress-fill"
          style={{ width: `${(currentStep / 2) * 100}%` }}
        ></div>
      </div>
      <div className="edit-user-form__steps">
        <div className={`edit-user-form__step ${currentStep >= 1 ? 'edit-user-form__step--active' : ''}`}>
          <div className="edit-user-form__step-number">1</div>
          <div className="edit-user-form__step-label">Datos Personales</div>
        </div>
        <div className={`edit-user-form__step ${currentStep >= 2 ? 'edit-user-form__step--active' : ''}`}>
          <div className="edit-user-form__step-number">2</div>
          <div className="edit-user-form__step-label">Configuración de Acceso</div>
        </div>
      </div>
    </div>
  );

  const renderPersonalDataStep = () => (
    <div className="edit-user-form__section">
      <div className="edit-user-form__step-header">
        <div className="edit-user-form__step-icon">
          <UserCog size={20} />
        </div>
        <div>
          <h3 className="edit-user-form__step-title">Datos Personales</h3>
          <p className="edit-user-form__step-description">Actualiza la información personal del usuario</p>
        </div>
        <p className="edit-user-form__required-legend"><span className="edit-user-form__required">*</span> Campo obligatorio</p>
      </div>

      {/* Primer nombre */}
      <div>
        <label htmlFor="first_name" className="edit-user-form__label">
          Primer Nombre{' '}
          {personFormData.first_name === originalRef.current.first_name && personFormData.first_name.trim()
            ? <span className="edit-user-form__initial-editable">valor inicial editable</span>
            : personFormData.first_name.trim().length < USER_FIELD_MIN_LIMITS.firstName
              ? <span className="edit-user-form__required">*</span>
              : null
          }
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            id="first_name"
            name="first_name"
            type="text"
            value={personFormData.first_name}
            onChange={handlePersonDataChange}
            placeholder="Ingresa el primer nombre"
            className="edit-user-form__input edit-user-form__input--with-icon"
            maxLength={USER_FIELD_LIMITS.firstName}
          />
        </div>
        {fieldErrors.first_name && <span className="edit-user-form__error-text">{fieldErrors.first_name}</span>}
        <div className="edit-user-form__field-info">
          <div className="edit-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.firstName} caracteres</div>
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.first_name.length, USER_FIELD_LIMITS.firstName)}`}>
            {personFormData.first_name.length}/{USER_FIELD_LIMITS.firstName} caracteres
          </div>
        </div>
      </div>

      {/* Segundo nombre */}
      <div>
        <label htmlFor="second_name" className="edit-user-form__label">
          Segundo Nombre{' '}
          {!personFormData.second_name?.trim() && <span className="edit-user-form__optional">(opcional)</span>}
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            id="second_name"
            name="second_name"
            type="text"
            value={personFormData.second_name}
            onChange={handlePersonDataChange}
            placeholder="Segundo nombre (opcional)"
            className="edit-user-form__input edit-user-form__input--with-icon"
            maxLength={USER_FIELD_LIMITS.secondName}
          />
        </div>
        <div className="edit-user-form__field-info">
          <div className="edit-user-form__min-length">Opcional</div>
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.second_name.length, USER_FIELD_LIMITS.secondName)}`}>
            {personFormData.second_name.length}/{USER_FIELD_LIMITS.secondName} caracteres
          </div>
        </div>
      </div>

      {/* Primer apellido */}
      <div>
        <label htmlFor="first_lastname" className="edit-user-form__label">
          Primer Apellido{' '}
          {personFormData.first_lastname === originalRef.current.first_lastname && personFormData.first_lastname.trim()
            ? <span className="edit-user-form__initial-editable">valor inicial editable</span>
            : personFormData.first_lastname.trim().length < USER_FIELD_MIN_LIMITS.firstLastname
              ? <span className="edit-user-form__required">*</span>
              : null
          }
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            id="first_lastname"
            name="first_lastname"
            type="text"
            value={personFormData.first_lastname}
            onChange={handlePersonDataChange}
            placeholder="Ingresa el primer apellido"
            className="edit-user-form__input edit-user-form__input--with-icon"
            maxLength={USER_FIELD_LIMITS.firstLastname}
          />
        </div>
        {fieldErrors.first_lastname && <span className="edit-user-form__error-text">{fieldErrors.first_lastname}</span>}
        <div className="edit-user-form__field-info">
          <div className="edit-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.firstLastname} caracteres</div>
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.first_lastname.length, USER_FIELD_LIMITS.firstLastname)}`}>
            {personFormData.first_lastname.length}/{USER_FIELD_LIMITS.firstLastname} caracteres
          </div>
        </div>
      </div>

      {/* Segundo apellido */}
      <div>
        <label htmlFor="second_lastname" className="edit-user-form__label">
          Segundo Apellido{' '}
          {personFormData.second_lastname === originalRef.current.second_lastname && personFormData.second_lastname.trim()
            ? <span className="edit-user-form__initial-editable">valor inicial editable</span>
            : personFormData.second_lastname.trim().length < USER_FIELD_MIN_LIMITS.secondLastname
              ? <span className="edit-user-form__required">*</span>
              : null
          }
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            id="second_lastname"
            name="second_lastname"
            type="text"
            value={personFormData.second_lastname}
            onChange={handlePersonDataChange}
            placeholder="Ingresa el segundo apellido"
            className="edit-user-form__input edit-user-form__input--with-icon"
            maxLength={USER_FIELD_LIMITS.secondLastname}
          />
        </div>
        {fieldErrors.second_lastname && <span className="edit-user-form__error-text">{fieldErrors.second_lastname}</span>}
        <div className="edit-user-form__field-info">
          <div className="edit-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.secondLastname} caracteres</div>
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.second_lastname.length, USER_FIELD_LIMITS.secondLastname)}`}>
            {personFormData.second_lastname.length}/{USER_FIELD_LIMITS.secondLastname} caracteres
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="edit-user-form__label">
          Email{' '}
          <span className="edit-user-form__initial-editable">valor inicial editable</span>
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={personFormData.email}
            onChange={handlePersonDataChange}
            placeholder="Ingresa el email del usuario"
            className="edit-user-form__input edit-user-form__input--with-icon"
            maxLength={USER_FIELD_LIMITS.email}
            readOnly
            disabled
          />
        </div>
        <div className="edit-user-form__field-info">
          <div className="edit-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.email} caracteres</div>
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.email.length, USER_FIELD_LIMITS.email)}`}>
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
      />
    </div>
  );

  const renderAccessConfigStep = () => (
    <div className="edit-user-form__section">
      <div className="edit-user-form__step-header">
        <div className="edit-user-form__step-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="edit-user-form__step-title">Configuración de Acceso</h3>
          <p className="edit-user-form__step-description">Gestiona los roles y permisos del usuario</p>
        </div>
      </div>

      {/* Rol */}
      <div>
        <label htmlFor="id_roles" className="edit-user-form__label">
          Roles <span className="edit-user-form__editable">editable</span>
        </label>
        <div className="edit-user-form__multi-select">
          {roles
            .filter(role => !['super_admin', 'entrepreneur', 'volunteer'].includes(role.name))
            .map(role => (
              <div key={role.id_role} className="edit-user-form__checkbox-wrapper">
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
                  className="edit-user-form__checkbox"
                />
                <label htmlFor={`role-${role.id_role}`} className="edit-user-form__checkbox-label">
                  {getRoleDisplayName(role.name)}
                </label>
              </div>
            ))}
        </div>
        {fieldErrors.id_roles && <span className="edit-user-form__error-text">{fieldErrors.id_roles}</span>}
        <p className="edit-user-form__help-text">
          Selecciona uno o más roles que tendrá el usuario
        </p>
      </div>

      {/* Información sobre contraseña y estado */}
      <div className="edit-user-form__info-section">
        <div className="edit-user-form__info-card">
          <svg
            className="edit-user-form__info-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="edit-user-form__info-title">
              Gestión de Contraseña
            </h4>
            <p className="edit-user-form__info-text">
              Para cambiar la contraseña, el usuario debe utilizar la
              función "Recuperar Contraseña" en el login.
            </p>
          </div>
        </div>

        <div className="edit-user-form__info-card">
          <svg
            className="edit-user-form__info-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m13 0h-6m-4 0l3-3-3-3m13 3H5"
            />
          </svg>
          <div>
            <h4 className="edit-user-form__info-title">
              Estado del Usuario
            </h4>
            <p className="edit-user-form__info-text">
              El estado se gestiona desde los botones "Activar/Desactivar"
              en la lista de usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="edit-user-form">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="edit-user-form__form" noValidate>
          {currentStep === 1 && renderPersonalDataStep()}
          {currentStep === 2 && renderAccessConfigStep()}

          {apiError && <p className="edit-user-form__error-text">{apiError}</p>}

          {/* Botones de navegación */}
          <div className="edit-user-form__actions">
            {currentStep === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onSuccess}
                  className="edit-user-form__cancel-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="edit-user-form__next-btn"
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
                  className="edit-user-form__back-btn"
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
                  disabled={isUpdating}
                  className={`edit-user-form__submit-btn ${isUpdating ? "edit-user-form__submit-btn--loading" : ""
                    }`}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Actualizar Usuario
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmUpdate}
        {...copyUpdate({
          resourcePhrase: 'el usuario',
          name: getFullName(),
          note: `Rol: ${getRoleName()}.`,
        })}
        cancelText="Cancelar"
        type="info"
        isLoading={isUpdating}
      />
    </>
  );
};

export default EditUserForm;