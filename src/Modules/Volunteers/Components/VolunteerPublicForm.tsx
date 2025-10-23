import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { VolunteersApi } from "../Services/VolunteersServices";

import "../Styles/VolunteerPublicForm.css";

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills?: string; // coma separada
};

// ➜ helper: transforma el form en el payload que espera el backend
function toApiPayload(values: FormValues) {
  const skillsArr =
    values.skills
      ? values.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return {
    first_name: values.first_name?.trim(),
    last_name: values.last_name?.trim(),
    email: values.email?.trim(),
    phone: values.phone?.trim() || null,
    skills: skillsArr, // <-- ahora como array
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

  return "Ocurrió un error al enviar el registro. Intenta de nuevo.";
}

export default function VolunteerPublicForm({ onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const createVolunteer = useMutation({
    mutationFn: (payload: FormValues) => VolunteersApi.createPublic(payload),
    onSuccess: () => {
      reset();
      onSuccess?.();
    },
  });

  const onSubmit = (values: FormValues) =>
    createVolunteer.mutate(toApiPayload(values) as any);

  const errorMessage = createVolunteer.isError
    ? parseApiError(createVolunteer.error)
    : null;

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
              Nombre <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                {...register("first_name", { required: "Requerido" })}
              />
            </div>
            {errors.first_name && (
              <span className="volunteer-apply-form__error-text">{errors.first_name.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Apellido <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                {...register("last_name", { required: "Requerido" })}
              />
            </div>
            {errors.last_name && (
              <span className="volunteer-apply-form__error-text">{errors.last_name.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Correo electrónico <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="email"
                className="volunteer-apply-form__input"
                {...register("email", { required: "Requerido" })}
              />
            </div>
            {errors.email && (
              <span className="volunteer-apply-form__error-text">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">Teléfono</label>
            <div className="volunteer-apply-form__input-wrapper">
              <input className="volunteer-apply-form__input" {...register("phone")} />
            </div>
          </div>

          <div>
            <label className="volunteer-apply-form__label">Habilidades (separadas por comas)</label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                placeholder="Primeros auxilios, Logística"
                {...register("skills")}
              />
            </div>
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
        </div>

        {/* Acciones */}
        <div className="volunteer-apply-form__actions">
          <button
            type="button"
            className="volunteer-apply-form__btn volunteer-apply-form__btn--cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="volunteer-apply-form__btn volunteer-apply-form__btn--submit"
            disabled={isSubmitting}
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
