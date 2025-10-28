import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Volunteer,
  PhoneType,
  UpdateMyProfileDto,
  useUpdateMyVolunteerProfile,
} from "../Services/VolunteersServices";

import "../Styles/VolunteerPublicForm.css";

type Props = {
  volunteer: Volunteer;
  onSuccess?: () => void;
};

type FormValues = {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_number: string;
  phone_type: PhoneType;
  phone_is_primary: boolean;
};

// ➜ helper: transforma el form en el payload que espera el backend
function toApiPayload(values: FormValues): UpdateMyProfileDto {
  return {
    person: {
      first_name: values.first_name.trim(),
      second_name: values.second_name?.trim() || undefined,
      first_lastname: values.first_lastname.trim(),
      second_lastname: values.second_lastname.trim(),
      email: values.email.trim().toLowerCase(),
      phones: [
        {
          number: values.phone_number.trim(),
          type: values.phone_type,
          is_primary: values.phone_is_primary,
        },
      ],
    },
  };
}

// ➜ helper: extrae un mensaje legible del error del backend
function parseApiError(err: any): string {
  const res = err?.response;
  const data = res?.data;

  // 409/duplicado
  if (res?.status === 409) return "Este correo ya está registrado.";

  // message como string
  if (typeof data?.message === "string") return data.message;

  // message como array de strings
  if (Array.isArray(data?.message)) return data.message.join(" • ");

  // otros formatos comunes
  if (typeof data?.error === "string") return data.error;

  return "Ocurrió un error al actualizar tu perfil. Intenta de nuevo.";
}

export default function EditVolunteerProfileForm({ volunteer, onSuccess }: Props) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Obtener el primer teléfono (el backend garantiza al menos 1)
  const primaryPhone = volunteer.person.phones[0] || {
    number: "",
    type: "personal" as PhoneType,
    is_primary: true,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      first_name: volunteer.person.first_name || "",
      second_name: volunteer.person.second_name || "",
      first_lastname: volunteer.person.first_lastname || "",
      second_lastname: volunteer.person.second_lastname || "",
      email: volunteer.person.email || "",
      phone_number: primaryPhone.number || "",
      phone_type: primaryPhone.type || "personal",
      phone_is_primary: primaryPhone.is_primary !== undefined ? primaryPhone.is_primary : true,
    },
  });

  const updateProfile = useUpdateMyVolunteerProfile();

  const onSubmit = (values: FormValues) => {
    // Deshabilitar botón inmediatamente al hacer clic
    setIsButtonDisabled(true);
    updateProfile.mutate(toApiPayload(values), {
      onSuccess: () => {
        // Mostrar mensaje de éxito por 2 segundos
        setTimeout(() => {
          setIsButtonDisabled(false);
          onSuccess?.();
        }, 2000);
      },
      onError: () => {
        // Si hay error, rehabilitar el botón
        setIsButtonDisabled(false);
      },
    });
  };

  const errorMessage = updateProfile.isError ? parseApiError(updateProfile.error) : null;
  const successMessage = updateProfile.isSuccess;

  return (
    <div className="volunteer-apply-form" style={{ width: "100%", maxWidth: 720 }}>
      <form onSubmit={handleSubmit(onSubmit)} className="volunteer-apply-form__form" noValidate>
        {/* Encabezado */}
        <div className="volunteer-apply-form__step-header">
          <div className="volunteer-apply-form__step-icon">✏️</div>
          <div>
            <h3 className="volunteer-apply-form__step-title">Editar Perfil de Voluntario</h3>
            <p className="volunteer-apply-form__step-description">
              Actualiza tu información personal.
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
                  maxLength: { value: 50, message: "Máximo 50 caracteres" },
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
                  maxLength: { value: 50, message: "Máximo 50 caracteres" },
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
                  maxLength: { value: 50, message: "Máximo 50 caracteres" },
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
                  maxLength: { value: 50, message: "Máximo 50 caracteres" },
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
                    message: "Formato de correo inválido",
                  },
                  maxLength: { value: 150, message: "Máximo 150 caracteres" },
                })}
              />
            </div>
            {errors.email && (
              <span className="volunteer-apply-form__error-text">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Número de Teléfono <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="tel"
                className="volunteer-apply-form__input"
                maxLength={20}
                placeholder="+506 8888-8888"
                {...register("phone_number", {
                  required: "El número de teléfono es requerido",
                  pattern: {
                    value: /^[\+]?[\d\s\-\(\)]+$/,
                    message: "Solo números, espacios, guiones, paréntesis y + son permitidos",
                  },
                })}
              />
            </div>
            {errors.phone_number && (
              <span className="volunteer-apply-form__error-text">{errors.phone_number.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Tipo de Teléfono <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <select
                className="volunteer-apply-form__input"
                {...register("phone_type", { required: "El tipo de teléfono es requerido" })}
              >
                <option value="personal">Personal</option>
                <option value="business">Empresa</option>
              </select>
            </div>
            {errors.phone_type && (
              <span className="volunteer-apply-form__error-text">{errors.phone_type.message}</span>
            )}
          </div>

          {/* Error global */}
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
              <svg className="volunteer-apply-form__success-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <p className="volunteer-apply-form__success-text">Perfil actualizado correctamente</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="volunteer-apply-form__actions">
          <button
            type="button"
            className="volunteer-apply-form__btn volunteer-apply-form__btn--cancel"
            onClick={() => reset()}
            disabled={isButtonDisabled}
          >
            Restaurar
          </button>
          <button
            type="submit"
            className="volunteer-apply-form__btn volunteer-apply-form__btn--submit"
            disabled={isButtonDisabled}
          >
            {updateProfile.isPending ? "Guardando..." : updateProfile.isSuccess ? "Guardado ✓" : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
