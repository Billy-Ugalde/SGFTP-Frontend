import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { DonationsApi } from '../../services/donationService';
import type { CreateDonationDto, DonorType, DonorInterest, DonationType } from '../../services/donationService';
import { HandCoins } from 'lucide-react';
import GenericModal from '../../../Entrepreneurs/Components/GenericModal';
import ConsentCheckbox from '../../../Shared/components/ConsentCheckbox';
import PhoneInputField from '../../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../../shared/utils/phone.utils';
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
  donationType: DonationType;
  donationDetails: string;
  consent?: boolean;
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
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

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
      consent:      false,
    },
    shouldFocusError: false,
  });

  const firstName       = watch('firstName');
  const secondName      = watch('secondName');
  const firstLastName   = watch('firstLastName');
  const secondLastName  = watch('secondLastName');
  const nameCompany     = watch('nameCompany');
  const email           = watch('email');
  const interest        = watch('interest');
  const donationType    = watch('donationType');
  const donationDetails = watch('donationDetails');

  const createDonation = useMutation({
    mutationFn: (dto: CreateDonationDto) => DonationsApi.createDonation(dto),
    onSuccess: () => setIsButtonDisabled(false),
    onError:   () => setIsButtonDisabled(false),
  });

  const onSubmit = (values: FormValues) => {
    if (!phone || !validatePhone(phone)) {
      setPhoneError('El teléfono es obligatorio y debe incluir código de país (ej: +50688888888).');
      return;
    }
    setPhoneError('');
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
      phone:           phone.trim(),
      donationType:    values.donationType,
      donationDetails: values.donationDetails.trim(),
    };
    createDonation.mutate(dto);
  };

  const errorMessage = createDonation.isError ? parseApiError(createDonation.error) : null;
  const isSuccess    = createDonation.isSuccess;

  return (
    <GenericModal show onClose={onClose!} title="Formulario de Donación" size="xl" maxHeight>
      <div className={styles['donation-form']}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles['donation-form__form']} noValidate>

          <div className={styles['donation-form__step-header']}>
            <div className={styles['donation-form__step-icon']}>
              <HandCoins size={28} strokeWidth={2} />
            </div>
            <div>
              <h3 className={styles['donation-form__step-title']}>Intención de Donación</h3>
              <p className={styles['donation-form__step-description']}>
                Cuéntanos cómo te gustaría apoyar a la fundación y nos pondremos en contacto contigo.
              </p>
            </div>
            <p className={styles['donation-form__required-legend']}>
              <span className={styles['donation-form__required']}>*</span> Campo obligatorio
            </p>
          </div>

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
                    required: 'El nombre de la empresa es obligatorio.',
                    minLength: { value: 2, message: 'El nombre de la empresa debe tener al menos 2 caracteres.' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(nameCompany?.length ?? 0, 100)}>
                    {nameCompany?.length ?? 0}/100 caracteres
                  </span>
                </div>
                {errors.nameCompany && <span className={styles['donation-form__error-text']}>{errors.nameCompany.message}</span>}
              </div>
            )}
          </div>

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
                    required: 'El primer nombre es obligatorio.',
                    minLength: { value: 2, message: 'El primer nombre debe tener al menos 2 caracteres.' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(firstName?.length ?? 0, 50)}>
                    {firstName?.length ?? 0}/50 caracteres
                  </span>
                </div>
                {errors.firstName && <span className={styles['donation-form__error-text']}>{errors.firstName.message}</span>}
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
                    required: 'El primer apellido es obligatorio.',
                    minLength: { value: 2, message: 'El primer apellido debe tener al menos 2 caracteres.' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(firstLastName?.length ?? 0, 50)}>
                    {firstLastName?.length ?? 0}/50 caracteres
                  </span>
                </div>
                {errors.firstLastName && <span className={styles['donation-form__error-text']}>{errors.firstLastName.message}</span>}
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
                    required: 'El segundo apellido es obligatorio.',
                    minLength: { value: 2, message: 'El segundo apellido debe tener al menos 2 caracteres.' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 2 caracteres</span>
                  <span className={charCountClass(secondLastName?.length ?? 0, 50)}>
                    {secondLastName?.length ?? 0}/50 caracteres
                  </span>
                </div>
                {errors.secondLastName && <span className={styles['donation-form__error-text']}>{errors.secondLastName.message}</span>}
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
                  {...register('email', {
                    required: 'El email es obligatorio.',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingresa un correo electrónico válido.' },
                  })}
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
                <PhoneInputField
                  label="Teléfono"
                  required
                  value={phone}
                  onChange={(val) => { setPhone(val); if (phoneError) setPhoneError(''); }}
                  error={phoneError || (phone && !validatePhone(phone) ? 'El número no es válido. Debe incluir código de país (ej: +50688888888).' : undefined)}
                  variant="add"
                />
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
                  {...register('interest', {
                    required: 'El interés es obligatorio.',
                  })}
                >
                  <option value="" disabled hidden>Selecciona una opción</option>
                  {(Object.entries(INTEREST_LABELS) as [DonorInterest, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                {errors.interest && <span className={styles['donation-form__error-text']}>{errors.interest.message}</span>}
              </div>

            </div>
          </div>

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
                  {...register('donationType', {
                    required: 'El tipo de donación es obligatorio.',
                  })}
                >
                  <option value="" disabled hidden>Selecciona una opción</option>
                  {(Object.entries(DONATION_TYPE_LABELS) as [DonationType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                {errors.donationType && <span className={styles['donation-form__error-text']}>{errors.donationType.message}</span>}
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
                    required: 'Los detalles de la donación son obligatorios.',
                    minLength: { value: 10, message: 'Los detalles deben tener al menos 10 caracteres.' },
                  })}
                />
                <div className={styles['donation-form__field-info']}>
                  <span className={styles['donation-form__min-length']}>Mínimo: 10 caracteres</span>
                  <span className={charCountClass(donationDetails?.length ?? 0, 1000)}>
                    {donationDetails?.length ?? 0}/1000 caracteres
                  </span>
                </div>
                {errors.donationDetails && <span className={styles['donation-form__error-text']}>{errors.donationDetails.message}</span>}
              </div>

            </div>
          </div>

          <ConsentCheckbox
            {...register('consent', {
              required: 'Debes aceptar el Aviso de Privacidad para continuar.',
            })}
            error={errors.consent?.message}
          />

          {errorMessage && (
            <p className={styles['donation-form__error-text']} style={{ display: 'block' }}>
              {errorMessage}
            </p>
          )}

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
