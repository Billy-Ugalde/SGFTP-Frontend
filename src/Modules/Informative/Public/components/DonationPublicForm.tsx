import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { DonationsApi } from '../../services/donationService';
import type { CreateDonationDto, DonorType, DonorInterest, DonationType } from '../../services/donationService';
import GenericModal from '../../../Entrepreneurs/Components/GenericModal';
import ConsentCheckbox from '../../../Shared/components/ConsentCheckbox';
import styles from '../styles/DonationPublicForm.module.css';

type Props = {
  onClose?: () => void;
};

type FormValues = {
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

const INTEREST_LABELS: Record<DonorInterest, string> = {
  cultural: 'Cultural',
  environmental: 'Ambiental',
  social: 'Social',
};

const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  food: 'Víveres',
  clothing: 'Ropa',
  money: 'Dinero',
  used_items: 'Artículos usados',
  other: 'Otro',
};

const charCountClass = (len: number, max: number) => {
  const base = styles['donation-form__char-count'];
  if (len >= max)         return `${base} ${styles['donation-form__char-count--error']}`;
  if (len >= max * 0.9)   return `${base} ${styles['donation-form__char-count--warning']}`;
  return base;
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

export default function DonationPublicForm({ onClose }: Props) {
  const [donorType, setDonorType] = useState<DonorType>('donor');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      interest:     '' as DonorInterest,
      donationType: '' as DonationType,
    },
    shouldFocusError: false,
  });

  const firstName       = watch('firstName');
  const secondName      = watch('secondName');
  const firstLastName   = watch('firstLastName');
  const secondLastName  = watch('secondLastName');
  const nameCompany     = watch('nameCompany');
  const email           = watch('email');
  const phone           = watch('phone');
  const interest        = watch('interest');
  const donationType    = watch('donationType');
  const donationDetails = watch('donationDetails');

  const validationErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && validationErrorRef.current) {
      validationErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors]);

  const createDonation = useMutation({
    mutationFn: (dto: CreateDonationDto) => DonationsApi.createDonation(dto),
    onSuccess: () => setIsButtonDisabled(false),
    onError:   () => setIsButtonDisabled(false),
  });

  const onSubmit = (values: FormValues) => {
    if (!consent) {
      setConsentError('Debes aceptar el Aviso de Privacidad para continuar.');
      return;
    }
    setConsentError('');
    setIsButtonDisabled(true);
    const dto: CreateDonationDto = {
      firstName:       values.firstName.trim(),
      secondName:      values.secondName?.trim() || undefined,
      firstLastName:   values.firstLastName.trim(),
      secondLastName:  values.secondLastName.trim(),
      donorType:       donorType,
      nameCompany:     donorType === 'strategic_ally' ? values.nameCompany?.trim() : undefined,
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
    <GenericModal show onClose={onClose!} title="Intención de donación" size="lg" maxHeight>
      <div className={styles['donation-form']}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles['donation-form__form']}>

          <p className={styles['donation-form__required-legend']}>
            <span className={styles['donation-form__required']}>*</span> Campo obligatorio
          </p>

          {/* ── Tipo de Donador ── */}
          <div className={styles['donation-form__section']}>
            <p className={styles['donation-form__section-title']}>Tipo de Donador</p>
            <div className={styles['donation-form__type-buttons']}>
              {([['donor', 'Donador particular'], ['strategic_ally', 'Aliado estratégico']] as [DonorType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles['donation-form__type-btn']} ${donorType === value ? styles['donation-form__type-btn--active'] : ''}`}
                  onClick={() => setDonorType(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {donorType === 'strategic_ally' && (
              <div className={styles['donation-form__field-full']} style={{ marginTop: '1rem' }}>
                <label className={styles['donation-form__label']} htmlFor="nameCompany">
                  Nombre de la empresa{' '}
                  {!nameCompany?.trim() && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <input
                  id="nameCompany"
                  className={styles['donation-form__input']}
                  maxLength={100}
                  required
                  {...register('nameCompany', {
                    minLength: { value: 2, message: 'Nombre de la empresa es obligatorio (mínimo 2 caracteres).' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(nameCompany?.length ?? 0, 100)}>
                    {nameCompany?.length ?? 0}/100 caracteres
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Datos del Donador ── */}
          <div className={styles['donation-form__section']}>
            <p className={styles['donation-form__section-title']}>Datos del Donador</p>
            <div className={styles['donation-form__fields']}>

              <div>
                <label className={styles['donation-form__label']} htmlFor="firstName">
                  Primer nombre{' '}
                  {!firstName?.trim() && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <input
                  id="firstName"
                  className={styles['donation-form__input']}
                  maxLength={50}
                  required
                  {...register('firstName', {
                    minLength: { value: 2, message: 'Primer nombre es obligatorio (mínimo 2 caracteres).' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(firstName?.length ?? 0, 50)}>
                    {firstName?.length ?? 0}/50 caracteres
                  </span>
                </div>
              </div>

              <div>
                <label className={styles['donation-form__label']} htmlFor="secondName">
                  Segundo nombre{' '}
                  {!secondName?.trim() && <span className={styles['donation-form__optional']}>(opcional)</span>}
                </label>
                <input
                  id="secondName"
                  className={styles['donation-form__input']}
                  maxLength={50}
                  {...register('secondName')}
                />
                <div className={styles['donation-form__field-info']}>
                  <span />
                  <span className={charCountClass(secondName?.length ?? 0, 50)}>
                    {secondName?.length ?? 0}/50 caracteres
                  </span>
                </div>
              </div>

              <div>
                <label className={styles['donation-form__label']} htmlFor="firstLastName">
                  Primer apellido{' '}
                  {!firstLastName?.trim() && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <input
                  id="firstLastName"
                  className={styles['donation-form__input']}
                  maxLength={50}
                  required
                  {...register('firstLastName', {
                    minLength: { value: 2, message: 'Primer apellido es obligatorio (mínimo 2 caracteres).' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(firstLastName?.length ?? 0, 50)}>
                    {firstLastName?.length ?? 0}/50 caracteres
                  </span>
                </div>
              </div>

              <div>
                <label className={styles['donation-form__label']} htmlFor="secondLastName">
                  Segundo apellido{' '}
                  {!secondLastName?.trim() && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <input
                  id="secondLastName"
                  className={styles['donation-form__input']}
                  maxLength={50}
                  required
                  {...register('secondLastName', {
                    minLength: { value: 2, message: 'Segundo apellido es obligatorio (mínimo 2 caracteres).' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(secondLastName?.length ?? 0, 50)}>
                    {secondLastName?.length ?? 0}/50 caracteres
                  </span>
                </div>
              </div>

              <div>
                <label className={styles['donation-form__label']} htmlFor="email">
                  Email{' '}
                  {!email?.trim() && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles['donation-form__input']}
                  maxLength={100}
                  required
                  {...register('email')}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']} />
                  <span className={charCountClass(email?.length ?? 0, 100)}>
                    {email?.length ?? 0}/100 caracteres
                  </span>
                </div>
                {errors.email && <span className={styles['donation-form__error-text']}>{errors.email.message}</span>}
              </div>

              <div>
                <label className={styles['donation-form__label']} htmlFor="phone">
                  Teléfono{' '}
                  {!phone?.trim() && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={styles['donation-form__input']}
                  maxLength={20}
                  required
                  {...register('phone', {
                    minLength: { value: 8, message: 'Teléfono es obligatorio (mínimo 8 caracteres).' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 8 caracteres</span>
                  <span className={charCountClass(phone?.length ?? 0, 20)}>
                    {phone?.length ?? 0}/20 caracteres
                  </span>
                </div>
              </div>

              <div>
                <label className={styles['donation-form__label']} htmlFor="interest">
                  Interés{' '}
                  {!interest && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <select
                  id="interest"
                  className={styles['donation-form__select']}
                  required
                  {...register('interest')}
                >
                  <option value="" disabled hidden>Selecciona una opción</option>
                  {(Object.entries(INTEREST_LABELS) as [DonorInterest, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* ── Datos de la Donación ── */}
          <div className={styles['donation-form__section']}>
            <p className={styles['donation-form__section-title']}>Datos de la Donación</p>
            <div className={styles['donation-form__fields']}>

              <div>
                <label className={styles['donation-form__label']} htmlFor="donationType">
                  Tipo de donación{' '}
                  {!donationType && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <select
                  id="donationType"
                  className={styles['donation-form__select']}
                  required
                  {...register('donationType')}
                >
                  <option value="" disabled hidden>Selecciona una opción</option>
                  {(Object.entries(DONATION_TYPE_LABELS) as [DonationType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles['donation-form__field-full']}>
                <label className={styles['donation-form__label']} htmlFor="donationDetails">
                  Detalles de la donación{' '}
                  {!donationDetails?.trim() && <span className={styles['donation-form__required']}>*</span>}
                </label>
                <textarea
                  id="donationDetails"
                  className={styles['donation-form__textarea']}
                  maxLength={1000}
                  required
                  {...register('donationDetails', {
                    minLength: { value: 10, message: 'Detalles de donación es obligatorio (mínimo 10 caracteres).' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 10 caracteres</span>
                  <span className={charCountClass(donationDetails?.length ?? 0, 1000)}>
                    {donationDetails?.length ?? 0}/1000 caracteres
                  </span>
                </div>
              </div>

            </div>
          </div>

          <ConsentCheckbox
            checked={consent}
            onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError(''); }}
            error={consentError}
          />

          {/* Error de validación (mínimo de caracteres) */}
          {Object.values(errors)[0]?.message && (
            <div ref={validationErrorRef} className={styles['donation-form__error-block']}>
              <svg className={styles['donation-form__error-icon']} viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 7h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <p>{Object.values(errors)[0]?.message as string}</p>
            </div>
          )}

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
                <p className={styles['donation-form__success-title']}>Intención de donación enviada</p>
                <p className={styles['donation-form__success-text']}>
                  Gracias por tu generosidad. Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo por medio de correo electrónico a la brevedad.
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
    </GenericModal>
  );
}
