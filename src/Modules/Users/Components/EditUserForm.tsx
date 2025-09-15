import React, { useState, useEffect } from "react";
import {
  useUpdateUser,
  useUpdatePerson,
  useRoles,
  type UpdateUserDto,
  type UpdatePersonDto,
  type User,
  type PhoneType,
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

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personFormData, setPersonFormData] = useState({
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    email: "",
    phones: [
      {
        number: "",
        type: "personal" as PhoneType,
        is_primary: true,
      },
    ],
  });

  const [userFormData, setUserFormData] = useState({
    id_role: 0,
  });

  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<{ person: any, user: any } | null>(null);

  const updateUser = useUpdateUser();
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
        phones:
          user.person.phones && user.person.phones.length > 0
            ? user.person.phones.map((phone) => ({
                number: phone.number || "",
                type: phone.type || ("personal" as PhoneType),
                is_primary: phone.is_primary || false,
              }))
            : [
                {
                  number: "",
                  type: "personal" as PhoneType,
                  is_primary: true,
                },
              ],
      });

      setUserFormData({
        id_role: user.role.id_role || 0,
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

  const handleUserDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setUserFormData((prev) => ({
      ...prev,
      [name]: name === "id_role" ? Number(value) : value,
    }));
  };

  const handlePhoneChange = (index: number, field: string, value: string) => {
    setPersonFormData((prev) => ({
      ...prev,
      phones: prev.phones.map((phone, i) =>
        i === index ? { ...phone, [field]: value } : phone
      ),
    }));
  };

  const addPhone = () => {
    setPersonFormData((prev) => ({
      ...prev,
      phones: [
        ...prev.phones,
        {
          number: "",
          type: "personal" as PhoneType,
          is_primary: false,
        },
      ],
    }));
  };

  const removePhone = (index: number) => {
    if (personFormData.phones.length > 1) {
      setPersonFormData((prev) => ({
        ...prev,
        phones: prev.phones.filter((_, i) => i !== index),
      }));
    }
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

    if (personFormData.phones.some((phone) => phone.number.trim().length < USER_FIELD_MIN_LIMITS.phoneNumber)) {
      setError(`Todos los teléfonos deben tener al menos ${USER_FIELD_MIN_LIMITS.phoneNumber} caracteres`);
      return false;
    }

    return true;
  };

  const validateUserData = (): boolean => {
    if (!userFormData.id_role) {
      setError("Debe seleccionar un rol");
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
      phones: personFormData.phones.filter((phone) => phone.number.trim()),
    };

    const userData: UpdateUserDto = {
      id_role: userFormData.id_role,
    };

    setPendingFormData({ person: updatePersonData, user: userData });
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingFormData) return;

    setIsUpdating(true);

    try {
      await updatePerson.mutateAsync({
        id: user.person.id_person,
        ...pendingFormData.person,
      });

      await updateUser.mutateAsync({
        id_user: user.id_user,
        ...pendingFormData.user,
      });

      setShowConfirmModal(false);
      setPendingFormData(null);
      onSuccess();
    } catch (err: any) {
      console.error("Error updating person/user:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al actualizar la persona y usuario"
      );
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
          />
        </div>
        <div className="edit-user-form__field-info">
          <div className="edit-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.email} caracteres</div>
          <div className={`edit-user-form__character-count ${getCharacterCountClass(personFormData.email.length, USER_FIELD_LIMITS.email)}`}>
            {personFormData.email.length}/{USER_FIELD_LIMITS.email} caracteres
          </div>
        </div>
      </div>

      {/* Teléfonos */}
      <div>
        <label className="edit-user-form__label">
          Teléfonos <span className="edit-user-form__required-editable">editable - no puede estar vacío</span>
        </label>
        {personFormData.phones.map((phone, index) => (
          <div key={index} className="edit-user-form__phone-group">
            <div className="edit-user-form__phone-inputs">
              <div
                className="edit-user-form__input-wrapper"
                style={{ flex: 2 }}
              >
                <div className="edit-user-form__icon">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={phone.number}
                  onChange={(e) =>
                    handlePhoneChange(index, "number", e.target.value)
                  }
                  placeholder="Número de teléfono"
                  className="edit-user-form__input edit-user-form__input--with-icon"
                  maxLength={USER_FIELD_LIMITS.phoneNumber}
                  required
                />
              </div>
              <select
                value={phone.type}
                onChange={(e) =>
                  handlePhoneChange(index, "type", e.target.value)
                }
                className="edit-user-form__input edit-user-form__select"
                style={{ flex: 1 }}
              >
                <option value="personal">Personal</option>
                <option value="business">Trabajo</option>
              </select>
              {personFormData.phones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhone(index)}
                  className="edit-user-form__remove-phone"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="edit-user-form__field-info">
              <div className="edit-user-form__min-length">Mínimo: {USER_FIELD_MIN_LIMITS.phoneNumber} caracteres</div>
              <div className={`edit-user-form__character-count ${getCharacterCountClass(phone.number.length, USER_FIELD_LIMITS.phoneNumber)}`}>
                {phone.number.length}/{USER_FIELD_LIMITS.phoneNumber} caracteres
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addPhone}
          className="edit-user-form__add-phone"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Agregar teléfono
        </button>
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
        <label htmlFor="id_role" className="edit-user-form__label">
          Rol <span className="edit-user-form__editable">editable</span>
        </label>
        <div className="edit-user-form__input-wrapper">
          <div className="edit-user-form__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <select
            id="id_role"
            name="id_role"
            value={userFormData.id_role}
            onChange={handleUserDataChange}
            required
            className="edit-user-form__input edit-user-form__input--with-icon edit-user-form__select"
          >
            <option value="">Selecciona un rol</option>
            {roles.map((role) => (
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