import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelfEnrollToActivity, usePublicEnrollToActivity, VolunteersApi, type CreatePersonDto } from "../Services/VolunteersServices";
import { useAuth } from "../../Auth/context/AuthContext";
import "../Styles/VolunteerPublicForm.css";

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
  phone_personal?: string;
  phone_business?: string;
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

export default function ActivityEnrollmentPublicForm({ activityId, activityName, onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const isVolunteer = user?.roles?.includes('volunteer') || false;

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const selfEnroll = useSelfEnrollToActivity();
  const publicEnroll = usePublicEnrollToActivity();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    defaultValues: {
      first_name: '',
      second_name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      phone_personal: '',
      phone_business: ''
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

            const phones = profile.person.phones || [];
            const personalPhone = phones.find((p: any) => p.type === 'personal');
            const businessPhone = phones.find((p: any) => p.type === 'business');

            if (personalPhone) setValue('phone_personal', personalPhone.number);
            if (businessPhone) setValue('phone_business', businessPhone.number);
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

    try {
      if (isVolunteer) {
        await selfEnroll.mutateAsync(activityId);
        alert('¡Te has inscrito exitosamente a la actividad!');
        onSuccess?.();
      } else {
        if (!validateEmailDomain(data.email)) {
          setErrorMessage(
            "Por favor usa un correo electrónico de un proveedor reconocido (Gmail, Outlook, Yahoo, etc.) o un correo institucional válido."
          );
          return;
        }

        const phones: any[] = [];
        if (data.phone_personal?.trim()) {
          phones.push({
            number: data.phone_personal.trim(),
            type: "personal",
            is_primary: true,
          });
        }
        if (data.phone_business?.trim()) {
          phones.push({
            number: data.phone_business.trim(),
            type: "business",
            is_primary: phones.length === 0,
          });
        }

        if (phones.length === 0) {
          setErrorMessage("Debes proporcionar al menos un número de teléfono");
          return;
        }

        const personData: CreatePersonDto = {
          first_name: data.first_name.trim(),
          second_name: data.second_name?.trim() || undefined,
          first_lastname: data.first_lastname.trim(),
          second_lastname: data.second_lastname.trim(),
          email: data.email.trim().toLowerCase(),
          phones,
        };

        await publicEnroll.mutateAsync({
          person: personData,
          id_activity: activityId,
        });

        alert('¡Te has registrado e inscrito exitosamente a la actividad!');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Error en inscripción:", error);

      if (error.response?.status === 409 || error.response?.data?.message?.includes('correo') || error.response?.data?.message?.includes('email')) {
        setErrorMessage('Este correo electrónico ya está registrado. Por favor inicia sesión antes de inscribirte.');
      } else {
        setErrorMessage(error.response?.data?.message || "Hubo un error al procesar tu inscripción. Por favor, intenta de nuevo.");
      }
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

        {errorMessage && (
          <div className="volunteer-apply-form__error">
            <div className="volunteer-apply-form__error-icon">⚠</div>
            <p>{errorMessage}</p>
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
                {...register("email", {
                  required: "El correo electrónico es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Formato de correo inválido",
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="volunteer-apply-form__error-text">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">Teléfono Personal</label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="tel"
                className="volunteer-apply-form__input"
                placeholder="88888888"
                disabled={isVolunteer}
                maxLength={8}
                {...register("phone_personal", {
                  pattern: {
                    value: /^\d{8}$/,
                    message: "Debe tener exactamente 8 dígitos",
                  },
                })}
              />
            </div>
            {errors.phone_personal && (
              <span className="volunteer-apply-form__error-text">{errors.phone_personal.message}</span>
            )}
          </div>

          <div>
            <label className="volunteer-apply-form__label">Teléfono de Empresa</label>
            <div className="volunteer-apply-form__input-wrapper">
              <input
                type="tel"
                className="volunteer-apply-form__input"
                placeholder="22222222"
                disabled={isVolunteer}
                maxLength={8}
                {...register("phone_business", {
                  pattern: {
                    value: /^\d{8}$/,
                    message: "Debe tener exactamente 8 dígitos",
                  },
                })}
              />
            </div>
            {errors.phone_business && (
              <span className="volunteer-apply-form__error-text">{errors.phone_business.message}</span>
            )}
          </div>

          <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
            * Debes proporcionar al menos un número de teléfono (personal o de empresa)
          </p>
        </div>

        {/* Botones */}
        <div className="volunteer-apply-form__actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="volunteer-apply-form__btn-secondary"
              disabled={selfEnroll.isPending || publicEnroll.isPending}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="volunteer-apply-form__btn-primary"
            disabled={selfEnroll.isPending || publicEnroll.isPending}
          >
            {selfEnroll.isPending || publicEnroll.isPending ? "Procesando..." : "Inscribirse"}
          </button>
        </div>
      </form>
    </div>
  );
}
