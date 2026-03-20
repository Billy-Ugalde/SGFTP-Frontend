import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { VolunteersApi, type PublicRegisterVolunteerDto } from "../Services/VolunteersServices";
import { useAuth } from "../../Auth/context/AuthContext";
import { HandHeart } from "lucide-react";
import ConsentCheckbox from "../../Shared/components/ConsentCheckbox";
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';
import volunteerFormStyles from "../Styles/VolunteerPublicForm.module.css";

type Props = {
  onClose?: () => void;
};

type FormValues = {
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname: string;
  email: string;
  phone_personal?: string;
  phone_business?: string;
  consent: boolean;
};

function toApiPayload(values: FormValues): PublicRegisterVolunteerDto {
  const phonePrimary = values.phone_personal || "";
  const phoneSecondary = values.phone_business || "";

  return {
    person: {
      first_name: values.first_name.trim(),
      second_name: values.second_name?.trim() || undefined,
      first_lastname: values.first_lastname.trim(),
      second_lastname: values.second_lastname.trim(),
      email: values.email.trim().toLowerCase(),
      phone_primary: phonePrimary,
      phone_secondary: phoneSecondary || undefined,
    },
  };
}

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

export default function VolunteerPublicForm({ onClose }: Props) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
    watch,
  } = useForm<FormValues>();

  const watchFirstName      = watch('first_name');
  const watchSecondName     = watch('second_name');
  const watchFirstLastname  = watch('first_lastname');
  const watchSecondLastname = watch('second_lastname');
  const watchEmail          = watch('email');

  const charCountClass = (len: number, max: number) => {
    const base = volunteerFormStyles['volunteer-apply-form__character-count'];
    if (len >= max)           return `${base} ${volunteerFormStyles['volunteer-apply-form__character-count--error']}`;
    if (len >= max * 0.9)     return `${base} ${volunteerFormStyles['volunteer-apply-form__character-count--warning']}`;
    return base;
  };

  useEffect(() => {
    if (isAuthenticated && user?.person) {
      if (user.person.firstName) setValue('first_name', user.person.firstName);
      if (user.person.secondName) setValue('second_name', user.person.secondName);
      if (user.person.firstLastname) setValue('first_lastname', user.person.firstLastname);
      if (user.person.secondLastname) setValue('second_lastname', user.person.secondLastname);
      if (user.person.email) setValue('email', user.person.email);
      if (user.person.phonePrimary) setValue('phone_personal', user.person.phonePrimary);
      if (user.person.phoneSecondary) setValue('phone_business', user.person.phoneSecondary);
    }
  }, [isAuthenticated, user, setValue]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const createVolunteer = useMutation({
    mutationFn: (payload: PublicRegisterVolunteerDto) => VolunteersApi.createPublic(payload),
    onSuccess: () => {
      setTimeout(() => {
        reset();
        setIsButtonDisabled(false);
        onClose?.();
      }, 15000);
    },
    onError: () => {
      setIsButtonDisabled(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsButtonDisabled(true);
    createVolunteer.mutate(toApiPayload(values));
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const errorMessage = createVolunteer.isError
    ? parseApiError(createVolunteer.error)
    : null;

  const successMessage = createVolunteer.isSuccess;

  return (
    <div className={volunteerFormStyles.modalOverlay} role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <div className={volunteerFormStyles.modal} onClick={handleModalClick}>
        <div className={volunteerFormStyles.modalHeader}>
          <h3 className={volunteerFormStyles.modalTitle}>Formulario de Voluntariado</h3>
          <button
            className={volunteerFormStyles.modalClose}
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={volunteerFormStyles.modalBody}>
          <div className={volunteerFormStyles["volunteer-apply-form"]} style={{ width: "100%", maxWidth: 720 }}>
            <form onSubmit={handleSubmit(onSubmit)} className={volunteerFormStyles["volunteer-apply-form__form"]} noValidate>
              <div className={volunteerFormStyles["volunteer-apply-form__step-header"]}>
                <div className={volunteerFormStyles["volunteer-apply-form__step-icon"]}>
                  <HandHeart size={28} strokeWidth={2} />
                </div>
                <div>
                  <h3 className={volunteerFormStyles["volunteer-apply-form__step-title"]}>Registro de Voluntariado</h3>
                  <p className={volunteerFormStyles["volunteer-apply-form__step-description"]}>
                    Dejanos tus datos para ponernos en contacto contigo.
                  </p>
                </div>
              </div>

              <p className={volunteerFormStyles["volunteer-apply-form__required-legend"]}>
                <span className={volunteerFormStyles["volunteer-apply-form__required"]}>*</span> Campo obligatorio
              </p>

              <div className={volunteerFormStyles["volunteer-apply-form__fields"]}>
          <div>
            <label className={volunteerFormStyles["volunteer-apply-form__label"]}>
              Primer Nombre{' '}
              {!watchFirstName?.trim() && <span className={volunteerFormStyles["volunteer-apply-form__required"]}>*</span>}
            </label>
            <div className={volunteerFormStyles["volunteer-apply-form__input-wrapper"]}>
              <input
                className={volunteerFormStyles["volunteer-apply-form__input"]}
                maxLength={50}
                {...register("first_name", {
                  required: "El primer nombre es requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            <div className={volunteerFormStyles["volunteer-apply-form__field-info"]}>
              <span className={volunteerFormStyles["volunteer-apply-form__min-length"]}>Mínimo: 2 caracteres</span>
              <span className={charCountClass(watchFirstName?.length ?? 0, 50)}>
                {watchFirstName?.length ?? 0}/50 caracteres
              </span>
            </div>
            {errors.first_name && (
              <span className={volunteerFormStyles["volunteer-apply-form__error-text"]}>{errors.first_name.message}</span>
            )}
          </div>

          <div>
            <label className={volunteerFormStyles["volunteer-apply-form__label"]}>
              Segundo Nombre{' '}
              {!watchSecondName?.trim() && <span className={volunteerFormStyles["volunteer-apply-form__optional"]}>(opcional)</span>}
            </label>
            <div className={volunteerFormStyles["volunteer-apply-form__input-wrapper"]}>
              <input
                className={volunteerFormStyles["volunteer-apply-form__input"]}
                maxLength={50}
                {...register("second_name", {
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            <div className={volunteerFormStyles["volunteer-apply-form__field-info"]}>
              <span />
              <span className={charCountClass(watchSecondName?.length ?? 0, 50)}>
                {watchSecondName?.length ?? 0}/50 caracteres
              </span>
            </div>
            {errors.second_name && (
              <span className={volunteerFormStyles["volunteer-apply-form__error-text"]}>{errors.second_name.message}</span>
            )}
          </div>

          <div>
            <label className={volunteerFormStyles["volunteer-apply-form__label"]}>
              Primer Apellido{' '}
              {!watchFirstLastname?.trim() && <span className={volunteerFormStyles["volunteer-apply-form__required"]}>*</span>}
            </label>
            <div className={volunteerFormStyles["volunteer-apply-form__input-wrapper"]}>
              <input
                className={volunteerFormStyles["volunteer-apply-form__input"]}
                maxLength={50}
                {...register("first_lastname", {
                  required: "El primer apellido es requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            <div className={volunteerFormStyles["volunteer-apply-form__field-info"]}>
              <span className={volunteerFormStyles["volunteer-apply-form__min-length"]}>Mínimo: 2 caracteres</span>
              <span className={charCountClass(watchFirstLastname?.length ?? 0, 50)}>
                {watchFirstLastname?.length ?? 0}/50 caracteres
              </span>
            </div>
            {errors.first_lastname && (
              <span className={volunteerFormStyles["volunteer-apply-form__error-text"]}>{errors.first_lastname.message}</span>
            )}
          </div>

          <div>
            <label className={volunteerFormStyles["volunteer-apply-form__label"]}>
              Segundo Apellido{' '}
              {!watchSecondLastname?.trim() && <span className={volunteerFormStyles["volunteer-apply-form__required"]}>*</span>}
            </label>
            <div className={volunteerFormStyles["volunteer-apply-form__input-wrapper"]}>
              <input
                className={volunteerFormStyles["volunteer-apply-form__input"]}
                maxLength={50}
                {...register("second_lastname", {
                  required: "El segundo apellido es requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
              />
            </div>
            <div className={volunteerFormStyles["volunteer-apply-form__field-info"]}>
              <span className={volunteerFormStyles["volunteer-apply-form__min-length"]}>Mínimo: 2 caracteres</span>
              <span className={charCountClass(watchSecondLastname?.length ?? 0, 50)}>
                {watchSecondLastname?.length ?? 0}/50 caracteres
              </span>
            </div>
            {errors.second_lastname && (
              <span className={volunteerFormStyles["volunteer-apply-form__error-text"]}>{errors.second_lastname.message}</span>
            )}
          </div>

          <div>
            <label className={volunteerFormStyles["volunteer-apply-form__label"]}>
              Correo Electrónico{' '}
              {!watchEmail?.trim() && <span className={volunteerFormStyles["volunteer-apply-form__required"]}>*</span>}
              {isAuthenticated && user?.person && (
                <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>
                  (no editable)
                </span>
              )}
            </label>
            <div className={volunteerFormStyles["volunteer-apply-form__input-wrapper"]}>
              <input
                type="email"
                className={volunteerFormStyles["volunteer-apply-form__input"]}
                maxLength={150}
                disabled={isAuthenticated && !!user?.person}
                style={isAuthenticated && user?.person ? {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                  opacity: 0.7
                } : {}}
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
            <div className={volunteerFormStyles["volunteer-apply-form__field-info"]}>
              <span />
              <span className={charCountClass(watchEmail?.length ?? 0, 150)}>
                {watchEmail?.length ?? 0}/150 caracteres
              </span>
            </div>
            {errors.email && (
              <span className={volunteerFormStyles["volunteer-apply-form__error-text"]}>{errors.email.message}</span>
            )}
          </div>

          <div>
            <Controller
              name="phone_personal"
              control={control}
              rules={{
                validate: (value, formValues) => {
                  if (!value && !formValues.phone_business) {
                    return "Debes proporcionar al menos un número de teléfono";
                  }
                  if (value && !validatePhone(value)) {
                    return "El número de teléfono no es válido. Debe incluir código de país (ej: +50688888888)";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <PhoneInputField
                  label="Teléfono Personal"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.phone_personal?.message}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="phone_business"
              control={control}
              rules={{
                validate: (value, formValues) => {
                  if (!value && !formValues.phone_personal) {
                    return "Debes proporcionar al menos un número de teléfono";
                  }
                  if (value && !validatePhone(value)) {
                    return "El número de teléfono no es válido. Debe incluir código de país (ej: +50688888888)";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <PhoneInputField
                  label="Teléfono Secundario"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.phone_business?.message}
                />
              )}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
            * Debes proporcionar al menos un número de teléfono
          </div>

          <ConsentCheckbox
            {...register("consent", {
              required: "Debes aceptar los términos y condiciones para continuar"
            })}
            error={errors.consent?.message}
          />

          {errorMessage && (
            <p className={volunteerFormStyles["volunteer-apply-form__error-text"]} style={{ display: 'block' }}>
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <div className={volunteerFormStyles["volunteer-apply-form__success"]}>
              <svg
                className={volunteerFormStyles["volunteer-apply-form__success-icon"]}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <div>
                <p
                  className={volunteerFormStyles["volunteer-apply-form__success-text"]}
                  style={{ fontWeight: 'bold', marginBottom: '8px' }}
                >
                  ¡Registro enviado correctamente!
                </p>
                <p
                  className={volunteerFormStyles["volunteer-apply-form__success-text"]}
                  style={{ fontSize: '0.9em', marginBottom: '12px' }}
                >
                  Para continuar con el proceso, por favor revisa tu correo electrónico
                  para realizar la activación de tu cuenta y poder participar en
                  actividades.
                </p>

                <button
                  type="button"
                  onClick={() => onClose?.()}
                  className={volunteerFormStyles["volunteer-apply-form__success-btn"]}
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

        </div>

        <div className={volunteerFormStyles["volunteer-apply-form__actions"]}>
                <button
                  type="button"
                  className={`${volunteerFormStyles["volunteer-apply-form__btn"]} ${volunteerFormStyles["volunteer-apply-form__btn--cancel"]}`}
                  onClick={onClose}
                  disabled={isButtonDisabled || createVolunteer.isPending || createVolunteer.isSuccess}
                  style={{
                    cursor: (isButtonDisabled || createVolunteer.isPending || createVolunteer.isSuccess) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${volunteerFormStyles["volunteer-apply-form__btn"]} ${volunteerFormStyles["volunteer-apply-form__btn--submit"]}`}
                  disabled={isButtonDisabled}
                >
                  {createVolunteer.isPending ? 'Enviando...' : createVolunteer.isSuccess ? 'Enviado ✓' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}