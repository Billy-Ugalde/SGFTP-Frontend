import React, { useState, useEffect } from "react";
import {
  useUpdatePerson,
  useRoles,
  useUpdateUserRoles,
  type UpdatePersonDto,
  type User,
} from "../Services/UserService";
import ConfirmationModal from './ConfirmationModal';
import "../styles/EditUserForm.css";

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

  const [error, setError] = useState("");
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

    setPersonFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setError("El email no tiene un formato válido");
      return false;
    }

    if (personFormData.phone_primary.trim().length < USER_FIELD_MIN_LIMITS.phoneNumber) {
      setError(`El teléfono principal debe tener al menos ${USER_FIELD_MIN_LIMITS.phoneNumber} caracteres`);
      return false;
    }

    return true;
  };

  const validateUserData = (): boolean => {
    if (userFormData.id_roles.length === 0) {
      setError('Debe seleccionar al menos un rol');
      return false;
    }
    return true;
  };

  const getFullName = () => {
    return `${personFormData.first_name} ${personFormData.second_name ? personFormData.second_name + ' ' : ''}${personFormData.first_lastname} ${personFormData.second_lastname}`.trim();
  };

  const getRoleName = () => {
    const selectedRoles = roles.filter(role => userFormData.id_roles.includes(role.id_role));
    return selectedRoles.map(role => getRoleDisplayName(role.name)).join(', ');
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1) {
      if (validatePersonData()) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    setError("");
    setCurrentStep(1);
  };

  const getRoleDisplayName = (roleName: string): string => {
    const roleTranslations: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'general_admin': 'Administrador General',
      'fair_admin': 'Administrador de Ferias',
      'content_admin': 'Administrador de Contenido',
      'auditor': 'Auditor',
      'entrepreneur': 'Emprendedor',
      'volunteer': 'Voluntario'
    };
    
    return roleTranslations[roleName] || roleName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

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
      onSuccess();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || err.message || "Error al actualizar el usuario");
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
    <div className="edit-user-form__step-indicator">
      <div className="edit-user-form__steps">
        <div className={`edit-user-form__step ${currentStep >= 1 ? 'edit-user-form__step--active' : ''}`}>
          <div className="edit-user-form__step-number">1</div>
          <div className="edit-user-form__step-label">Datos Personales</div>
        </div>
        <div className="edit-user-form__step-divider"></div>
        <div className={`edit-user-form__step ${currentStep >= 2 ? 'edit-user-form__step--active' : ''}`}>
          <div className="edit-user-form__step-number">2</div>
          <div className="edit-user-form__step-label">Configuración de Acceso</div>
        </div>
      </div>
    </div>
  );

  const renderPersonalDataStep = () => (
    <div className="edit-user-form__section">
      <h3 className="edit-user-form__section-title">Datos Personales</h3>

      {/* Primer nombre */}
      <div>
        <label htmlFor="first_name" className="edit-user-form__label">
          Primer Nombre <span className="edit-user-form__required-editable">editable - no puede estar vacío</span>
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
            required
          />
        </div>
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
          Segundo Nombre <span className="edit-user-form__optional">campo opcional</span>
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
          Primer Apellido{" "}
          <span className="edit-user-form__required-editable">editable - no puede estar vacío</span>
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
            required
          />
        </div>
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
          Segundo Apellido{" "}
          <span className="edit-user-form__required-editable">editable - no puede estar vacío</span>
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
            required
          />
        </div>
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
          Email <span className="edit-user-form__required-editable">editable - no puede estar vacío</span>
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
            required
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
      <div>
        <label className="edit-user-form__label">
          Teléfono Principal <span className="edit-user-form__required-editable">editable - no puede estar vacío</span>
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input
            type="tel"
            name="phone_primary"
            value={personFormData.phone_primary}
            onChange={handlePersonDataChange}
            placeholder="+506 8888-8888"
            className="edit-user-form__input edit-user-form__input--with-icon"
            maxLength={USER_FIELD_LIMITS.phoneNumber}
            required
          />
        </div>
        <div className="edit-user-form__field-info">
          <div className="edit-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.phoneNumber} caracteres</div>
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.phone_primary.length, USER_FIELD_LIMITS.phoneNumber)}`}>
            {personFormData.phone_primary.length}/{USER_FIELD_LIMITS.phoneNumber} caracteres
          </div>
        </div>
      </div>

      {/* Teléfono Secundario */}
      <div>
        <label className="edit-user-form__label">
          Teléfono Secundario (Opcional)
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.2.48 2.54.73 3.95.73a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.41.25 2.75.73 3.95a1 1 0 01-.21 1.11l-2.2 2.2z" />
            </svg>
          </div>
          <input
            type="tel"
            name="phone_secondary"
            value={personFormData.phone_secondary}
            onChange={handlePersonDataChange}
            placeholder="+506 2222-2222"
            className="edit-user-form__input edit-user-form__input--with-icon"
            maxLength={USER_FIELD_LIMITS.phoneNumber}
          />
        </div>
        <div className="edit-user-form__field-info">
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.phone_secondary.length, USER_FIELD_LIMITS.phoneNumber)}`}>
            {personFormData.phone_secondary.length}/{USER_FIELD_LIMITS.phoneNumber} caracteres
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessConfigStep = () => (
    <div className="edit-user-form__section">
      <h3 className="edit-user-form__section-title">
        Configuración de Acceso
      </h3>

      {/* Rol */}
      <div>
        <label htmlFor="id_roles" className="edit-user-form__label">
          Roles <span className="edit-user-form__editable">editable</span>
        </label>
        <div className="edit-user-form__multi-select">
          {roles
            .filter(role => role.name !== 'super_admin')  // Filtrar super_admin
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
        
        <form onSubmit={handleSubmit} className="edit-user-form__form">
          {currentStep === 1 && renderPersonalDataStep()}
          {currentStep === 2 && renderAccessConfigStep()}

          {/* Mensaje de Error */}
          {error && (
            <div className="edit-user-form__error">
              <svg
                className="edit-user-form__error-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="edit-user-form__error-text">{error}</p>
            </div>
          )}

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
                  className={`edit-user-form__submit-btn ${
                    isUpdating ? "edit-user-form__submit-btn--loading" : ""
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
        title="Confirmar actualización de usuario"
        message={`¿Estás seguro de que deseas actualizar los datos del usuario "${getFullName()}" con el rol "${getRoleName()}"?`}
        confirmText="Actualizar Usuario"
        cancelText="Cancelar"
        type="info"
        isLoading={isUpdating}
      />
    </>
  );
};

export default EditUserForm;