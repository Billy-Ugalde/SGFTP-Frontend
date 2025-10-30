import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { VolunteersApi, PublicRegisterVolunteerDto, PhoneType } from "../Services/VolunteersServices";

import "../Styles/VolunteerPublicForm.css";

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_personal?: string;
  phone_business?: string;
};

// ➜ helper: transforma el form en el payload que espera el backend
function toApiPayload(values: FormValues): PublicRegisterVolunteerDto {
  const phones: any[] = [];

  // Agregar teléfono personal si existe
  if (values.phone_personal?.trim()) {
    phones.push({
      number: values.phone_personal.trim(),
      type: "personal",
      is_primary: true,
    });
  }

  // Agregar teléfono de empresa si existe
  if (values.phone_business?.trim()) {
    phones.push({
      number: values.phone_business.trim(),
      type: "business",
      is_primary: phones.length === 0, // Es primario solo si no hay teléfono personal
    });
  }

  // Validar que al menos haya un teléfono
  if (phones.length === 0) {
    throw new Error("Debes proporcionar al menos un número de teléfono");
  }

  return {
    person: {
      first_name: values.first_name.trim(),
      second_name: values.second_name?.trim() || undefined,
      first_lastname: values.first_lastname.trim(),
      second_lastname: values.second_lastname.trim(),
      email: values.email.trim().toLowerCase(),
      phones,
    },
  };
}

// Lista de dominios de correo permitidos
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'outlook.es', 'outlook.com.mx',
  'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'yahoo.com', 'yahoo.es', 'ymail.com', 'rocketmail.com',
  'aol.com',
  'proton.me', 'protonmail.com',
  'zoho.com',
  'gmx.com', 'gmx.de',
  'mail.com',
  'yandex.com', 'yandex.ru',
  'fastmail.com',
  'tuta.com', 'tutanota.com',
  'hey.com',
  'miempresa.com'
];

// Dominios institucionales que permiten subdominios
const ALLOWED_DOMAIN_PATTERNS = [
  '.ucr.ac.cr',
  '.una.ac.cr',
  '.go.cr'
];

// Validar que el dominio del correo esté permitido
function validateEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];

  // Verificar dominios exactos
  if (ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return true;
  }

  // Verificar patrones de dominios (subdominios)
  return ALLOWED_DOMAIN_PATTERNS.some(pattern => domain.endsWith(pattern));
}

// ➜ helper: extrae un mensaje legible del error del backend
function parseApiError(err: any): string {
  const res = err?.response;
  const data = res?.data;

  // 409/duplicado - correo exactamente igual
  if (res?.status === 409) {
    const message = data?.message || '';
    if (typeof message === 'string' && message.toLowerCase().includes('email')) {
      return "Este correo ya está registrado. Si ya tienes una cuenta, por favor inicia sesión.";
    }
    return "Ya existe un registro con estos datos.";
  }

  // message como string
  if (typeof data?.message === "string") return data.message;

  // message como array de strings
  if (Array.isArray(data?.message)) return data.message.join(" • ");

  // otros formatos comunes
  if (typeof data?.error === "string") return data.error;

  return "Ocurrió un error al enviar el registro. Intenta de nuevo.";
}

export default function VolunteerPublicForm({ onSuccess, onCancel }: Props) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const createVolunteer = useMutation({
    mutationFn: (payload: PublicRegisterVolunteerDto) => VolunteersApi.createPublic(payload),
    onSuccess: () => {
      // Mostrar mensaje de éxito por 15 segundos antes de cerrar (tiempo suficiente para leer)
      setTimeout(() => {
        reset();
        setIsButtonDisabled(false);
        onSuccess?.();
      }, 15000);
    },
    onError: () => {
      // Si hay error, rehabilitar el botón
      setIsButtonDisabled(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    // Deshabilitar botón inmediatamente al hacer clic
    setIsButtonDisabled(true);
    createVolunteer.mutate(toApiPayload(values));
  };

  const errorMessage = createVolunteer.isError
    ? parseApiError(createVolunteer.error)
    : null;

  const successMessage = createVolunteer.isSuccess;

  return (
    <div className="volunteer-apply-form" style={{ width: "100%", maxWidth: 720 }}>
      <form onSubmit={handleSubmit(onSubmit)} className="volunteer-apply-form__form" noValidate>
        {/* Encabezado */}
        <div className="volunteer-apply-form__step-header">
          <div className="volunteer-apply-form__step-icon">🤝</div>
          <div>
            <h3 className="volunteer-apply-form__step-title">Registro de Voluntariado</h3>
            <p className="volunteer-apply-form__step-description">
              Dejanos tus datos para ponernos en contacto contigo.
            </p>
          </div>
        </div>

        {/* Campos */}
        <div className="volunteer-apply-form__fields">
          <div>
            <label className="volunteer-apply-form__label">
              Primer Nombre <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                maxLength={50}
                {...register("first_name", {
                  required: "El primer nombre es requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            {errors.first_name && (
              <span className="volunteer-apply-form__error-text">{errors.first_name.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">Segundo Nombre</label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                maxLength={50}
                {...register("second_name", {
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            {errors.second_name && (
              <span className="volunteer-apply-form__error-text">{errors.second_name.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Primer Apellido <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                maxLength={50}
                {...register("first_lastname", {
                  required: "El primer apellido es requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            {errors.first_lastname && (
              <span className="volunteer-apply-form__error-text">{errors.first_lastname.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Segundo Apellido <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                maxLength={50}
                {...register("second_lastname", {
                  required: "El segundo apellido es requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            {errors.second_lastname && (
              <span className="volunteer-apply-form__error-text">{errors.second_lastname.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Correo Electrónico <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="email"
                className="volunteer-apply-form__input"
                maxLength={150}
                {...register("email", {
                  required: "El correo electrónico es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Formato de correo inválido"
                  },
                  maxLength: { value: 150, message: "Máximo 150 caracteres" },
                  validate: (value) => {
                    if (!validateEmailDomain(value)) {
                      return "El dominio del correo no está permitido. Por favor usa un correo de Gmail, Outlook, Yahoo, u otros proveedores autorizados.";
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="volunteer-apply-form__error-text">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Teléfono Personal
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="tel"
                className="volunteer-apply-form__input"
                maxLength={20}
                placeholder="+506 8888-8888"
                {...register("phone_personal", {
                  pattern: {
                    value: /^[\+]?[\d\s\-\(\)]+$/,
                    message: "Solo números, espacios, guiones, paréntesis y + son permitidos"
                  },
                  validate: (value, formValues) => {
                    // Al menos uno de los dos teléfonos debe estar lleno
                    if (!value && !formValues.phone_business) {
                      return "Debes proporcionar al menos un número de teléfono (personal o empresa)";
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.phone_personal && (
              <span className="volunteer-apply-form__error-text">{errors.phone_personal.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Teléfono de Empresa
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="tel"
                className="volunteer-apply-form__input"
                maxLength={20}
                placeholder="+506 2222-2222"
                {...register("phone_business", {
                  pattern: {
                    value: /^[\+]?[\d\s\-\(\)]+$/,
                    message: "Solo números, espacios, guiones, paréntesis y + son permitidos"
                  },
                  validate: (value, formValues) => {
                    // Al menos uno de los dos teléfonos debe estar lleno
                    if (!value && !formValues.phone_personal) {
                      return "Debes proporcionar al menos un número de teléfono (personal o empresa)";
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.phone_business && (
              <span className="volunteer-apply-form__error-text">{errors.phone_business.message}</span>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
            * Debes proporcionar al menos un número de teléfono (personal o empresa)
          </div>

          {/* Error global - ahora mostramos mensaje del backend si lo hay */}
          {errorMessage && (
            <div className="volunteer-apply-form__error">
              <svg className="volunteer-apply-form__error-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 7h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <p className="volunteer-apply-form__error-text">{errorMessage}</p>
            </div>
          )}

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="volunteer-apply-form__success">
              <svg
                className="volunteer-apply-form__success-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <div>
                <p
                  className="volunteer-apply-form__success-text"
                  style={{ fontWeight: 'bold', marginBottom: '8px' }}
                >
                  ¡Registro enviado correctamente!
                </p>
                <p
                  className="volunteer-apply-form__success-text"
                  style={{ fontSize: '0.9em', marginBottom: '12px' }}
                >
                  Para continuar con el proceso, por favor revisa tu correo electrónico
                  para realizar la activación de tu cuenta y poder participar en
                  actividades.
                </p>

                {/* Botón manual de cierre */}
                <button
                  type="button"
                  onClick={() => onSuccess?.()}
                  className="volunteer-apply-form__success-button"
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9em",
                  }}
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Acciones */}
        <div className="volunteer-apply-form__actions">
          <button
            type="button"
            className="volunteer-apply-form__btn volunteer-apply-form__btn--cancel"
            onClick={onCancel}
            disabled={isButtonDisabled || createVolunteer.isPending || createVolunteer.isSuccess}
            style={{
              cursor: (isButtonDisabled || createVolunteer.isPending || createVolunteer.isSuccess) ? 'not-allowed' : 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="volunteer-apply-form__btn volunteer-apply-form__btn--submit"
            disabled={isButtonDisabled}
          >
            {createVolunteer.isPending ? 'Enviando...' : createVolunteer.isSuccess ? 'Enviado ✓' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}
