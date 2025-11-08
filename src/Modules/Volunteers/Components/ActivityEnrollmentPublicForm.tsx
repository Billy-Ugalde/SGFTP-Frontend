import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelfEnrollToActivity, usePublicEnrollToActivity, VolunteersApi } from "../Services/VolunteersServices";
import type { CreatePersonDto } from "../Types";
import { useAuth } from "../../Auth/context/AuthContext";
import "../Styles/VolunteerPublicForm.module.css";

type Props = {
  activityId: number;
  activityName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone: string;
};

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

const ALLOWED_DOMAIN_PATTERNS = [
  '.ucr.ac.cr',
  '.una.ac.cr',
  '.go.cr'
];

function validateEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return true;
  }
  return ALLOWED_DOMAIN_PATTERNS.some(pattern => domain.endsWith(pattern));
}

function parseApiError(err: any): string {
  const res = err?.response;
  const data = res?.data;

  if (res?.status === 409) {
    const message = data?.message || '';
    if (typeof message === 'string' && message.toLowerCase().includes('email')) {
      return "Este correo ya está registrado. Si ya tienes una cuenta, por favor inicia sesión.";
    }
    return "Ya existe un registro con estos datos.";
  }

  if (typeof data?.message === "string") return data.message;

  if (Array.isArray(data?.message)) return data.message.join(" • ");

  if (typeof data?.error === "string") return data.error;

  return "Ocurrió un error al enviar el registro. Intenta de nuevo.";
}

export default function ActivityEnrollmentPublicForm({ activityId, activityName, onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const isVolunteer = user?.roles?.includes('volunteer') || false;

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const selfEnroll = useSelfEnrollToActivity();
  const publicEnroll = usePublicEnrollToActivity();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    defaultValues: {
      first_name: '',
      second_name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      phone: ''
    }
  });

  useState(() => {
    if (isVolunteer) {
      setIsLoadingProfile(true);
      VolunteersApi.getMe()
        .then((profile: any) => {
          if (profile.person) {
            setValue('first_name', profile.person.first_name || '');
            setValue('second_name', profile.person.second_name || '');
            setValue('first_lastname', profile.person.first_lastname || '');
            setValue('second_lastname', profile.person.second_lastname || '');
            setValue('email', profile.person.email || '');

            // Prellenar teléfono (prioridad: primario > secundario)
            const phoneNumber = profile.person.phone_primary || profile.person.phone_secondary || '';
            if (phoneNumber) setValue('phone', phoneNumber);
          }
        })
        .catch((error: any) => {
          console.error('Error al cargar perfil:', error);
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    }
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMessage("");
    setSuccessMessage(false);
    setIsButtonDisabled(true);

    try {
      if (isVolunteer) {
        await selfEnroll.mutateAsync(activityId);
        setSuccessMessage(true);

        setTimeout(() => {
          onSuccess?.();
        }, 5000);
      } else {
        if (!validateEmailDomain(data.email)) {
          setErrorMessage(
            "Por favor usa un correo electrónico de un proveedor reconocido (Gmail, Outlook, Yahoo, etc.) o un correo institucional válido."
          );
          setIsButtonDisabled(false);
          return;
        }

        if (!data.phone?.trim()) {
          setErrorMessage("El número de teléfono es requerido");
          setIsButtonDisabled(false);
          return;
        }

        const personData: CreatePersonDto = {
          first_name: data.first_name.trim(),
          second_name: data.second_name?.trim() || undefined,
          first_lastname: data.first_lastname.trim(),
          second_lastname: data.second_lastname.trim(),
          email: data.email.trim().toLowerCase(),
          phone_primary: data.phone.trim(),
        };

        await publicEnroll.mutateAsync({
          person: personData,
          id_activity: activityId,
        });

        setSuccessMessage(true);

        setTimeout(() => {
          onSuccess?.();
        }, 15000);
      }
    } catch (error: any) {
      console.error("Error en inscripción:", error);
      setErrorMessage(parseApiError(error));
      setIsButtonDisabled(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="volunteer-apply-form" style={{ width: "100%", maxWidth: 720 }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteer-apply-form" style={{ width: "100%", maxWidth: 720 }}>
      <form onSubmit={handleSubmit(onSubmit)} className="volunteer-apply-form__form" noValidate>
        {/* Encabezado */}
        <div className="volunteer-apply-form__step-header">
          <div className="volunteer-apply-form__step-icon">📝</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="volunteer-apply-form__step-title">Inscripción a Actividad</h3>
            <p className="volunteer-apply-form__step-description" style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>{activityName}</p>
          </div>
        </div>

        {!isVolunteer && (
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
            borderLeft: '4px solid #2196F3',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, color: '#1565C0', fontSize: '0.9rem' }}>
              ℹ️ <strong>¿Ya tienes cuenta?</strong> Inicia sesión antes de llenar este formulario
              para una inscripción más rápida.
            </p>
          </div>
        )}

        {isVolunteer && (
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            borderLeft: '4px solid #52AC83',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, color: '#2E7D32', fontSize: '0.9rem' }}>
              ✓ <strong>Inscripción rápida:</strong> Tus datos están prellenados. Solo confirma tu
              inscripción.
            </p>
          </div>
        )}

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
            <svg
              className="volunteer-apply-form__success-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <div>
              {isVolunteer ? (
                <>
                  <p
                    className="volunteer-apply-form__success-text"
                    style={{ fontWeight: 'bold', marginBottom: '8px' }}
                  >
                    ¡Inscripción exitosa!
                  </p>
                  <p
                    className="volunteer-apply-form__success-text"
                    style={{ fontSize: '0.9em', marginBottom: '12px' }}
                  >
                    Te has inscrito correctamente a la actividad. Revisa tus inscripciones
                    en tu perfil de voluntario.
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="volunteer-apply-form__success-text"
                    style={{ fontWeight: 'bold', marginBottom: '8px' }}
                  >
                    ¡Registro e inscripción exitosos!
                  </p>
                  <p
                    className="volunteer-apply-form__success-text"
                    style={{ fontSize: '0.9em', marginBottom: '12px' }}
                  >
                    Te has inscrito correctamente a la actividad. Por favor revisa tu correo
                    electrónico para activar tu cuenta de voluntario y poder participar en
                    futuras actividades.
                  </p>
                </>
              )}

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

        {/* Campos */}
        <div className="volunteer-apply-form__fields">
          <div>
            <label className="volunteer-apply-form__label">
              Primer Nombre <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                disabled={isVolunteer}
                maxLength={50}
                {...register("first_name", {
                  required: "El primer nombre es obligatorio",
                  minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
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
                disabled={isVolunteer}
                maxLength={50}
                {...register("second_name")}
              />
            </div>
          </div>

          <div>
            <label className="volunteer-apply-form__label">
              Primer Apellido <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                className="volunteer-apply-form__input"
                disabled={isVolunteer}
                maxLength={50}
                {...register("first_lastname", {
                  required: "El primer apellido es obligatorio",
                  minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
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
                disabled={isVolunteer}
                maxLength={50}
                {...register("second_lastname", {
                  required: "El segundo apellido es obligatorio",
                  minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
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
                disabled={isVolunteer}
                maxLength={150}
                {...register("email", {
                  required: "El correo electrónico es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Formato de correo inválido"
                  },
                  maxLength: { value: 150, message: "Máximo 150 caracteres" },
                  validate: (value) => {
                    if (!isVolunteer && !validateEmailDomain(value)) {
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
              Teléfono <span className="volunteer-apply-form__required">*</span>
            </label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="tel"
                className="volunteer-apply-form__input"
                placeholder="+506 8888-8888"
                disabled={isVolunteer}
                maxLength={20}
                {...register("phone", {
                  required: "El número de teléfono es requerido",
                  pattern: {
                    value: /^[\+]?[\d\s\-\(\)]+$/,
                    message: "Solo números, espacios, guiones, paréntesis y + son permitidos"
                  }
                })}
              />
            </div>
            {errors.phone && (
              <span className="volunteer-apply-form__error-text">{errors.phone.message}</span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="volunteer-apply-form__actions">
          <button
            type="button"
            className="volunteer-apply-form__btn volunteer-apply-form__btn--cancel"
            onClick={onCancel}
            disabled={isButtonDisabled || selfEnroll.isPending || publicEnroll.isPending || successMessage}
            style={{
              cursor: (isButtonDisabled || selfEnroll.isPending || publicEnroll.isPending || successMessage) ? 'not-allowed' : 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="volunteer-apply-form__btn volunteer-apply-form__btn--submit"
            disabled={isButtonDisabled}
          >
            {selfEnroll.isPending || publicEnroll.isPending ? 'Procesando...' : successMessage ? 'Inscrito ✓' : 'Inscribirse'}
          </button>
        </div>
      </form>
    </div>
  );
}
