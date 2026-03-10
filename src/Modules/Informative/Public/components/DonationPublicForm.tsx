import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { DonationsApi } from '../../services/donationService';
import type { CreateDonationDto, DonorType, DonorInterest, DonationType } from '../../services/donationService';
import styles from '../styles/DonationPublicForm.module.css';

type Props = {
  onClose?: () => void;
};

type FormValues = {
  donorType: DonorType;
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName: string;
  nameCompany?: string;
  interest: DonorInterest;
  email: string;
  phone: string;
  donationType: DonationType;
  donationDetails: string;
};

function parseApiError(err: unknown): string {
  const e = err as { response?: { status?: number; data?: { message?: string | string[]; error?: string } } };
  const data = e?.response?.data;
  if (e?.response?.status === 409) return 'Ya existe un registro con estos datos.';
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.message)) return data.message.join(' • ');
  if (typeof data?.error === 'string') return data.error;
  return 'Ocurrió un error al enviar el formulario. Intenta de nuevo.';
}

const INTEREST_LABELS: Record<DonorInterest, string> = {
  cultural: 'Cultural',
  environmental: 'Ambiental',
  social: 'Social',
};

const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  food:       'Víveres',
  clothing:   'Ropa',
  money:      'Dinero',
  used_items: 'Artículos usados',
  other:      'Otro',
};

export default function DonationPublicForm({ onClose }: Props) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [detailsLength, setDetailsLength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: { donorType: 'donor' },
  });

  const donorType       = watch('donorType');
  const firstName       = watch('firstName');
  const secondName      = watch('secondName');
  const firstLastName   = watch('firstLastName');
  const secondLastName  = watch('secondLastName');
  const email           = watch('email');
  const phone           = watch('phone');
  const nameCompany     = watch('nameCompany');

  const charCountClass = (len: number, max: number) => {
    if (len >= max)          return styles['donation-form__char-count--error'];
    if (len >= max * 0.9)    return styles['donation-form__char-count--warning'];
    return '';
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const focusAndReport = (fieldName: string) => {
    setTimeout(() => {
      const element = document.querySelector(`[name="${fieldName}"]`);
      if (element) {
        (element as HTMLElement).scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center' });
        (element as HTMLElement).focus();
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement
        ) {
          element.setCustomValidity('Rellena este campo.');
          element.reportValidity();
          element.addEventListener('input', () => element.setCustomValidity(''), { once: true });
          element.addEventListener('change', () => element.setCustomValidity(''), { once: true });
        }
      }
    }, 100);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = getValues();

    const requiredFields: Array<keyof FormValues> = [
      'firstName',
      'firstLastName',
      'secondLastName',
      ...(values.donorType === 'strategic ally' ? ['nameCompany' as keyof FormValues] : []),
      'email',
      'phone',
      'interest',
      'donationType',
      'donationDetails',
    ];

    for (const field of requiredFields) {
      const value = values[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        focusAndReport(field);
        return;
      }
    }

    handleSubmit(onSubmit)(e);
  };

  const createDonation = useMutation({
    mutationFn: (dto: CreateDonationDto) => DonationsApi.createDonation(dto),
    onSuccess: () => setIsButtonDisabled(false),
    onError: ()  => setIsButtonDisabled(false),
  });

  const onSubmit = (values: FormValues) => {
    setIsButtonDisabled(true);
    const dto: CreateDonationDto = {
      firstName:       values.firstName.trim(),
      secondName:      values.secondName?.trim() || undefined,
      firstLastName:   values.firstLastName.trim(),
      secondLastName:  values.secondLastName.trim(),
      donorType:       values.donorType,
      nameCompany:     values.donorType === 'strategic ally' ? values.nameCompany?.trim() : undefined,
      interest:        values.interest,
      email:           values.email.trim().toLowerCase(),
      phone:           values.phone.trim(),
      donationType:    values.donationType,
      donationDetails: values.donationDetails.trim(),
    };
    createDonation.mutate(dto);
  };

  const errorMessage = createDonation.isError ? parseApiError(createDonation.error) : null;
  const isSuccess    = createDonation.isSuccess;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <p className={styles.modalEyebrow}>Fundación Tamarindo</p>
            <h3 className={styles.modalTitle}>Intención de donación</h3>
          </div>
          <button className={styles.modalClose} aria-label="Cerrar" onClick={onClose}>
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles['donation-form']}>
            <form
              onSubmit={handleFormSubmit}
              className={styles['donation-form__form']}
              noValidate
            >
              {/* Descripción */}
              <div className={styles['donation-form__header']}>
                <p className={styles['donation-form__header-title']}>
                  Completa el formulario a continuación
                </p>
                <p className={styles['donation-form__header-desc']}>
                  Una vez recibida tu información, nuestro equipo se pondrá en contacto contigo
                  para coordinar los detalles de la donación.
                </p>
              </div>

              {/* Tipo de donante */}
              <div>
                <p className={styles['donation-form__section-title']}>Tipo de donante</p>
                <div className={styles['donation-form__type-selector']}>
                  {(['donor', 'strategic ally'] as DonorType[]).map((type) => (
                    <label key={type} className={styles['donation-form__type-option']}>
                      <input
                        type="radio"
                        value={type}
                        {...register('donorType', { required: true })}
                      />
                      <div className={styles['donation-form__type-card']}>
                        <span className={styles['donation-form__type-radio']} />
                        <span className={styles['donation-form__type-text']}>
                          <span className={styles['donation-form__type-label']}>
                            {type === 'donor' ? 'Donador particular' : 'Aliado estratégico'}
                          </span>
                          <span className={styles['donation-form__type-sublabel']}>
                            {type === 'donor' ? 'Persona individual' : 'Empresa u organización'}
                          </span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Datos personales */}
              <div>
                <p className={styles['donation-form__section-title']}>Datos personales</p>
                <div className={styles['donation-form__fields']}>

                  {/* Primer nombre */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Primer nombre{' '}
                      {!firstName?.trim() && (
                        <span className={styles['donation-form__required']}>campo obligatorio</span>
                      )}
                    </label>
                    <input
                      className={styles['donation-form__input']}
                      maxLength={50}
                      placeholder="Ingresa tu primer nombre"
                      {...register('firstName', {
                        required: 'El primer nombre es requerido',
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      })}
                    />
                    <div className={styles['donation-form__field-info']}>
                      <span className={`${styles['donation-form__char-count']} ${charCountClass(firstName?.length ?? 0, 50)}`}>
                        {firstName?.length ?? 0}/50 caracteres
                      </span>
                    </div>
                  </div>

                  {/* Segundo nombre */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Segundo nombre{' '}
                      {!secondName?.trim() && (
                        <span className={styles['donation-form__optional']}>(opcional)</span>
                      )}
                    </label>
                    <input
                      className={styles['donation-form__input']}
                      maxLength={50}
                      placeholder="Ingresa tu segundo nombre"
                      {...register('secondName', {
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      })}
                    />
                    <div className={styles['donation-form__field-info']}>
                      <span className={`${styles['donation-form__char-count']} ${charCountClass(secondName?.length ?? 0, 50)}`}>
                        {secondName?.length ?? 0}/50 caracteres
                      </span>
                    </div>
                    {errors.secondName && (
                      <span className={styles['donation-form__error-text']}>{errors.secondName.message}</span>
                    )}
                  </div>

                  {/* Primer apellido */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Primer apellido{' '}
                      {!firstLastName?.trim() && (
                        <span className={styles['donation-form__required']}>campo obligatorio</span>
                      )}
                    </label>
                    <input
                      className={styles['donation-form__input']}
                      maxLength={50}
                      placeholder="Ingresa tu primer apellido"
                      {...register('firstLastName', {
                        required: 'El primer apellido es requerido',
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      })}
                    />
                    <div className={styles['donation-form__field-info']}>
                      <span className={`${styles['donation-form__char-count']} ${charCountClass(firstLastName?.length ?? 0, 50)}`}>
                        {firstLastName?.length ?? 0}/50 caracteres
                      </span>
                    </div>
                  </div>

                  {/* Segundo apellido */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Segundo apellido{' '}
                      {!secondLastName?.trim() && (
                        <span className={styles['donation-form__required']}>campo obligatorio</span>
                      )}
                    </label>
                    <input
                      className={styles['donation-form__input']}
                      maxLength={50}
                      placeholder="Ingresa tu segundo apellido"
                      {...register('secondLastName', {
                        required: 'El segundo apellido es requerido',
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      })}
                    />
                    <div className={styles['donation-form__field-info']}>
                      <span className={`${styles['donation-form__char-count']} ${charCountClass(secondLastName?.length ?? 0, 50)}`}>
                        {secondLastName?.length ?? 0}/50 caracteres
                      </span>
                    </div>
                  </div>

                  {/* Empresa — solo aliado estratégico */}
                  {donorType === 'strategic ally' && (
                    <div className={styles['donation-form__field-full']}>
                      <label className={styles['donation-form__label']}>
                        Empresa u organización{' '}
                        {!nameCompany?.trim() && (
                          <span className={styles['donation-form__required']}>campo obligatorio</span>
                        )}
                      </label>
                      <input
                        className={styles['donation-form__input']}
                        maxLength={50}
                        placeholder="Nombre de la empresa u organización"
                        {...register('nameCompany', {
                          required: 'El nombre de la empresa es requerido',
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                        })}
                      />
                      <div className={styles['donation-form__field-info']}>
                        <span className={`${styles['donation-form__char-count']} ${charCountClass(nameCompany?.length ?? 0, 50)}`}>
                          {nameCompany?.length ?? 0}/50 caracteres
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Correo */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Correo electrónico{' '}
                      {!email?.trim() && (
                        <span className={styles['donation-form__required']}>campo obligatorio</span>
                      )}
                    </label>
                    <input
                      type="email"
                      className={styles['donation-form__input']}
                      maxLength={50}
                      placeholder="correo@ejemplo.com"
                      {...register('email', {
                        required: 'El correo electrónico es requerido',
                        minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Formato de correo inválido',
                        },
                      })}
                    />
                    <div className={styles['donation-form__field-info']}>
                      <span className={styles['donation-form__min-length']}>Mínimo: 5 caracteres</span>
                      <span className={`${styles['donation-form__char-count']} ${charCountClass(email?.length ?? 0, 50)}`}>
                        {email?.length ?? 0}/50 caracteres
                      </span>
                    </div>
                    {errors.email && (
                      <span className={styles['donation-form__error-text']}>{errors.email.message}</span>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Teléfono{' '}
                      {!phone?.trim() && (
                        <span className={styles['donation-form__required']}>campo obligatorio</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      className={styles['donation-form__input']}
                      maxLength={20}
                      placeholder="+506 8888-8888"
                      {...register('phone', {
                        required: 'El teléfono es requerido',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                        maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                        pattern: {
                          value: /^[\+]?[\d\s\-\(\)]+$/,
                          message: 'Solo números, espacios, guiones y paréntesis',
                        },
                      })}
                    />
                    <div className={styles['donation-form__field-info']}>
                      <span className={styles['donation-form__min-length']}>Mínimo: 8 caracteres</span>
                      <span className={`${styles['donation-form__char-count']} ${charCountClass(phone?.length ?? 0, 20)}`}>
                        {phone?.length ?? 0}/20 caracteres
                      </span>
                    </div>
                    {errors.phone && (
                      <span className={styles['donation-form__error-text']}>{errors.phone.message}</span>
                    )}
                  </div>

                </div>
              </div>

              {/* Detalles de la donación */}
              <div>
                <p className={styles['donation-form__section-title']}>Detalles de la donación</p>
                <div className={styles['donation-form__fields']}>

                  {/* Área de interés */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Área de interés <span className={styles['donation-form__required']}>campo obligatorio</span>
                    </label>
                    <select
                      className={styles['donation-form__select']}
                      {...register('interest', { required: 'El área de interés es requerida' })}
                    >
                      <option value="">Selecciona una opción</option>
                      {(Object.entries(INTEREST_LABELS) as [DonorInterest, string][]).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de donación */}
                  <div>
                    <label className={styles['donation-form__label']}>
                      Tipo de donación <span className={styles['donation-form__required']}>campo obligatorio</span>
                    </label>
                    <select
                      className={styles['donation-form__select']}
                      {...register('donationType', { required: 'El tipo de donación es requerido' })}
                    >
                      <option value="">Selecciona una opción</option>
                      {(Object.entries(DONATION_TYPE_LABELS) as [DonationType, string][]).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Detalles */}
                  <div className={styles['donation-form__field-full']}>
                    <label className={styles['donation-form__label']}>
                      Descripción de la donación <span className={styles['donation-form__required']}>campo obligatorio</span>
                    </label>
                    <textarea
                      className={styles['donation-form__textarea']}
                      maxLength={1000}
                      placeholder="Describe tu donación: cantidad, estado de los artículos, cualquier información relevante que nos ayude a coordinar la entrega…"
                      {...register('donationDetails', {
                        required: 'La descripción es requerida',
                        minLength: { value: 10, message: 'Mínimo 10 caracteres' },
                        maxLength: { value: 1000, message: 'Máximo 1000 caracteres' },
                        onChange: (e) => setDetailsLength(e.target.value.length),
                      })}
                    />
                    <div className={styles['donation-form__field-info']}>
                    <span className={`${styles['donation-form__char-count']} ${charCountClass(detailsLength, 1000)}`}>
                      {detailsLength}/1000 caracteres
                    </span>
                  </div>
                    {errors.donationDetails && (
                      <span className={styles['donation-form__error-text']}>{errors.donationDetails.message}</span>
                    )}
                  </div>

                  {/* Error general */}
                  {errorMessage && (
                    <div className={styles['donation-form__error-block']}>
                      <svg className={styles['donation-form__error-icon']} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 7h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  {/* Éxito */}
                  {isSuccess && (
                    <div className={styles['donation-form__success-block']}>
                      <svg className={styles['donation-form__success-icon']} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <div>
                        <p className={styles['donation-form__success-title']}>
                          Intención de donación recibida
                        </p>
                        <p className={styles['donation-form__success-text']}>
                          Gracias por tu generosidad. Nuestro equipo revisará tu solicitud y
                          se pondrá en contacto contigo a la brevedad para coordinar los detalles.
                        </p>
                        <button
                          type="button"
                          className={styles['donation-form__success-btn']}
                          onClick={() => { reset(); onClose?.(); }}
                        >
                          Entendido
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              {!isSuccess && (
                <div className={styles['donation-form__actions']}>
                  <button
                    type="button"
                    className={`${styles['donation-form__btn']} ${styles['donation-form__btn--cancel']}`}
                    onClick={onClose}
                    disabled={isButtonDisabled || createDonation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`${styles['donation-form__btn']} ${styles['donation-form__btn--submit']}`}
                    disabled={isButtonDisabled}
                  >
                    {createDonation.isPending ? 'Enviando…' : 'Enviar intención'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
