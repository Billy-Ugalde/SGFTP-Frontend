import { useState, useRef, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '../../Auth/context/AuthContext';
import { useAddEntrepreneur, transformFormDataToDto } from '../Services/EntrepreneursServices';
import type { EntrepreneurFormData } from '../Types';
import PersonalDataStep from './AddPersonalDataStep';
import EntrepreneurshipDataStep from './AddEntrepreneurshipDataStep';
import '../Styles/AddEntrepreneurForm.css';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface AddEntrepreneurFormProps {
  onSuccess: () => void;
}

const AddEntrepreneurForm = ({ onSuccess }: AddEntrepreneurFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const formContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAdmin =
    user?.roles?.some((r: string) =>
      ['super_admin', 'general_admin', 'fair_admin'].includes(r)
    ) ?? false;

  const addEntrepreneur = useAddEntrepreneur(isAdmin);

  useEffect(() => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  const getDefaultValues = (): EntrepreneurFormData => {
    const baseValues: EntrepreneurFormData = {
      first_name: '',
      second_name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      phone_primary: '',
      phone_secondary: '',
      experience: null as number | null,
      facebook_url: '',
      instagram_url: '',
      entrepreneurship_name: '',
      description: '',
      location: '',
      category: 'Comida' as const,
      approach: 'social' as const,
      url_1: undefined,
      url_2: undefined,
      url_3: undefined,
      consent: false,
    };

    if (user?.person && !isAdmin) {
      return {
        ...baseValues,
        first_name: user.person.firstName || '',
        second_name: user.person.secondName || '',
        first_lastname: user.person.firstLastname || '',
        second_lastname: user.person.secondLastname || '',
        email: user.person.email || '',
        phone_primary: user.person.phonePrimary || '',
        phone_secondary: user.person.phoneSecondary || '',
      };
    }

    return baseValues;
  };

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setApiError('');

      try {
        const dto = transformFormDataToDto(value);
        await addEntrepreneur.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        console.error('Error al registrar emprendedor:', error);
        if (error?.response?.status === 409) {
          const conflictMessage = getConflictErrorMessage(error.response.data);
          setApiError(conflictMessage);
        } else if (error?.response?.status === 400) {
          setApiError(
            'Los datos enviados son inválidos. Por favor revisa todos los campos de ambos pasos del formulario.'
          );
        } else if (error?.response?.status === 500) {
          setApiError(
            'Error interno del servidor. Por favor intenta más tarde.'
          );
        } else {
          setApiError(
            'No se pudo registrar el emprendedor. Por favor revisa cuidadosamente todos los campos de ambos pasos antes de intentarlo de nuevo.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const getConflictErrorMessage = (errorData: any): string => {
    if (errorData?.message) {
      const message = errorData.message.toLowerCase();
      if (message.includes('email')) {
        return 'Ya existe un emprendedor registrado con este email';
      }
      if (message.includes('phone') || message.includes('teléfono')) {
        return 'Ya existe un emprendedor registrado con este teléfono';
      }
      if (
        message.includes('entrepreneurship') ||
        message.includes('emprendimiento')
      ) {
        return 'Ya existe un emprendimiento registrado con este nombre';
      }
    }
    return 'Ya existe un registro con algunos de estos datos. Por favor verifica email, teléfono y nombre del emprendimiento.';
  };

  const scrollToFirstError = (
    errors: Record<string, string>,
    fieldOrder: string[]
  ) => {
    const firstErrorKey = fieldOrder.find((key) => errors[key]);
    if (!firstErrorKey || !formContainerRef.current) return;
    const el = formContainerRef.current.querySelector<HTMLElement>(
      `[data-field="${firstErrorKey}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = el.querySelector<HTMLElement>(
        'input:not([type="file"]):not([type="checkbox"]), textarea'
      );
      if (focusable) {
        setTimeout(() => focusable.focus(), 0);
      }
    }
  };

  const validateStep1 = (): boolean => {
    const values = form.state.values;
    const errors: Record<string, string> = {};

    if (!values.first_name?.trim())
      errors.first_name = 'El primer nombre es obligatorio.';
    if (!values.first_lastname?.trim())
      errors.first_lastname = 'El primer apellido es obligatorio.';
    if (!values.second_lastname?.trim())
      errors.second_lastname = 'El segundo apellido es obligatorio.';
    if (!values.email?.trim())
      errors.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      errors.email = 'Debe ser un correo electrónico válido.';
    if (values.experience === null || values.experience === undefined)
      errors.experience = 'Los años de experiencia son obligatorios.';
    else if (typeof values.experience === 'number' && (values.experience < 0 || values.experience > 100))
      errors.experience = 'Debe estar entre 0 y 100 años.';
    if (!values.phone_primary)
      errors.phone_primary = 'El teléfono principal es obligatorio.';
    else if (!validatePhone(values.phone_primary as string))
      errors.phone_primary = 'El teléfono principal no es válido. Selecciona el código de país e ingresa el número.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors, [
        'first_name', 'first_lastname', 'second_lastname',
        'email', 'phone_primary', 'experience',
      ]);
    }
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const values = form.state.values;
    const errors: Record<string, string> = {};

    if (!values.entrepreneurship_name?.trim())
      errors.entrepreneurship_name = 'El nombre del emprendimiento es obligatorio.';
    if (!values.description?.trim())
      errors.description = 'La descripción es obligatoria.';
    else if (values.description.trim().length < 80)
      errors.description = 'La descripción debe tener al menos 80 caracteres.';
    if (!values.location?.trim())
      errors.location = 'La ubicación es obligatoria.';
    if (!values.category)
      errors.category = 'La categoría es obligatoria.';
    if (!values.approach)
      errors.approach = 'El enfoque es obligatorio.';
    if (!values.url_1 || !((values.url_1 as any) instanceof File))
      errors.url_1 = 'Debes subir la imagen 1.';
    if (!values.url_2 || !((values.url_2 as any) instanceof File))
      errors.url_2 = 'Debes subir la imagen 2.';
    if (!values.url_3 || !((values.url_3 as any) instanceof File))
      errors.url_3 = 'Debes subir la imagen 3.';
    if (!values.consent)
      errors.consent = 'Debes aceptar el Aviso de Privacidad para continuar.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors, [
        'entrepreneurship_name', 'description', 'location',
        'category', 'approach', 'url_1', 'url_2', 'url_3', 'consent',
      ]);
    }
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setFieldErrors({});
    setApiError('');
    if (validateStep1()) setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setFieldErrors({});
    setApiError('');
  };

  const handleSubmit = () => {
    setApiError('');
    if (validateStep2()) {
      form.handleSubmit();
    }
  };

  const renderField = (
    name: keyof EntrepreneurFormData,
    config: any = {}
  ) => {
    const {
      label,
      required = false,
      type = 'text',
      placeholder = '',
      options = [],
      min,
      max,
      maxLength,
      minLength,
      showCharacterCount = false,
      accept,
      onFileChange,
    } = config;

    return (
      <form.Field name={name as any}>
        {(field) => {
          const value: any = field.state.value;
          const currentLength =
            (typeof value === 'string' || Array.isArray(value)) ? value.length : 0;
          const shouldShowRequired = required && (
            minLength
              ? currentLength < minLength
              : (type === 'number' ? (value === null || value === undefined) : !value || (typeof value === 'string' && value.trim() === ''))
          );

          if (type === 'file') {
            return (
              <div className="add-entrepreneur-form__file-field" data-field={name}>
                <label className="add-entrepreneur-form__label">
                  {label}{' '}
                  {required && (
                    <span className="add-entrepreneur-form__required">*</span>
                  )}
                </label>
                <input
                  type="file"
                  accept={accept || 'image/*'}
                  name={name as string}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      field.handleChange(file as any);
                      if (onFileChange) {
                        onFileChange(file, name as string);
                      }
                    }
                  }}
                  className="add-entrepreneur-form__input"
                />

                {value && (
                  <img
                    src={
                      (value as any) instanceof File
                        ? URL.createObjectURL(value as File)
                        : (value as string)
                    }
                    alt={label}
                    className="h-24 w-24 object-cover rounded mt-2"
                  />
                )}
              </div>
            );
          }
          if (type === 'textarea') {
            return (
              <div data-field={name}>
                <label className="add-entrepreneur-form__label">
                  {label}{' '}
                  {shouldShowRequired && (
                    <span className="add-entrepreneur-form__required">*</span>
                  )}
                </label>
                <textarea
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                  className="add-entrepreneur-form__input add-entrepreneur-form__input--textarea"
                  placeholder={placeholder}
                  maxLength={maxLength}
                />
                {showCharacterCount && maxLength && (
                  <div className="add-entrepreneur-form__field-info">
                    {minLength && (
                      <div className="add-entrepreneur-form__min-length">
                        Mínimo: {minLength} caracteres
                      </div>
                    )}
                    <div
                      className={`add-entrepreneur-form__character-count ${currentLength > maxLength * 0.9
                          ? 'add-entrepreneur-form__character-count--warning'
                          : ''
                        } ${currentLength === maxLength
                          ? 'add-entrepreneur-form__character-count--error'
                          : ''
                        }`}
                    >
                      {currentLength}/{maxLength} caracteres
                    </div>
                  </div>
                )}
                {fieldErrors[name as string] && (
                  <span className="add-entrepreneur-form__error-text">
                    {fieldErrors[name as string]}
                  </span>
                )}
              </div>
            );
          }
          if (type === 'select') {
            return (
              <div data-field={name}>
                <label className="add-entrepreneur-form__label">
                  {label}{' '}
                  {shouldShowRequired && (
                    <span className="add-entrepreneur-form__required">*</span>
                  )}
                </label>
                <select
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                  className="add-entrepreneur-form__input add-entrepreneur-form__input--select"
                >
                  {options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {fieldErrors[name as string] && (
                  <span className="add-entrepreneur-form__error-text">
                    {fieldErrors[name as string]}
                  </span>
                )}
              </div>
            );
          }
          const isEmailFieldDisabled = name === 'email' && user?.person && !isAdmin;

          return (
            <div data-field={name}>
              <label className="add-entrepreneur-form__label">
                {label}{' '}
                {shouldShowRequired && (
                  <span className="add-entrepreneur-form__required">*</span>
                )}
                {isEmailFieldDisabled && (
                  <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>
                    (no editable)
                  </span>
                )}
              </label>
              <input
                type={type}
                name={name as string}
                value={
                  typeof value === 'string' || typeof value === 'number'
                    ? value
                    : ''
                }
                onBlur={field.handleBlur}
                onChange={(e) => {
                  if (type === 'number') {
                    const val = e.target.value;
                    field.handleChange(val === '' ? null : parseInt(val) as any);
                  } else {
                    field.handleChange(e.target.value as any);
                  }
                  if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' }));
                }}
                className="add-entrepreneur-form__input"
                placeholder={placeholder}
                min={min}
                max={max}
                disabled={isEmailFieldDisabled}
                style={isEmailFieldDisabled ? {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                  opacity: 0.7
                } : {}}
                maxLength={maxLength}
                minLength={minLength}
              />
              {showCharacterCount && maxLength && (
                <div className="add-entrepreneur-form__field-info">
                  {minLength && (
                    <div className="add-entrepreneur-form__min-length">
                      Mínimo: {minLength} caracteres
                    </div>
                  )}
                  <div
                    className={`add-entrepreneur-form__character-count ${currentLength > maxLength * 0.9
                        ? 'add-entrepreneur-form__character-count--warning'
                        : ''
                      } ${currentLength === maxLength
                        ? 'add-entrepreneur-form__character-count--error'
                        : ''
                      }`}
                  >
                    {currentLength}/{maxLength} caracteres
                  </div>
                </div>
              )}
              {fieldErrors[name as string] && (
                <span className="add-entrepreneur-form__error-text">
                  {fieldErrors[name as string]}
                </span>
              )}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="add-entrepreneur-form" ref={formContainerRef}>
      {/* Progress Steps */}
      <div className="add-entrepreneur-form__progress">
        <div className="add-entrepreneur-form__progress-bar">
          <div
            className="add-entrepreneur-form__progress-fill"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          ></div>
        </div>
        <div className="add-entrepreneur-form__steps">
          <div className={`add-entrepreneur-form__step ${currentStep >= 1 ? 'add-entrepreneur-form__step--active' : ''}`}>
            <div className="add-entrepreneur-form__step-number">1</div>
            <div className="add-entrepreneur-form__step-label">Datos Personales</div>
          </div>
          <div className={`add-entrepreneur-form__step ${currentStep >= 2 ? 'add-entrepreneur-form__step--active' : ''}`}>
            <div className="add-entrepreneur-form__step-number">2</div>
            <div className="add-entrepreneur-form__step-label">Emprendimiento</div>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="add-entrepreneur-form__form"
      >
        {currentStep === 1 ? (
          <PersonalDataStep
            formValues={form.state.values}
            onNext={handleNextStep}
            onCancel={onSuccess}
            renderField={renderField}
            phonePrimary={form.state.values.phone_primary as string}
            onPhonePrimaryChange={(val) => { form.setFieldValue('phone_primary', val as any); if (fieldErrors.phone_primary) setFieldErrors(prev => ({ ...prev, phone_primary: '' })); }}
            phonePrimaryError={fieldErrors.phone_primary}
            phoneSecondary={form.state.values.phone_secondary as string}
            onPhoneSecondaryChange={(val) => form.setFieldValue('phone_secondary', val as any)}
            phoneSecondaryError={
              form.state.values.phone_secondary && !validatePhone(form.state.values.phone_secondary as string)
                ? 'El número de teléfono no es válido'
                : undefined
            }
          />
        ) : (
          <EntrepreneurshipDataStep
            formValues={form.state.values}
            onPrevious={handlePrevStep}
            onSubmit={handleSubmit}
            onValidate={validateStep2}
            isLoading={isLoading}
            renderField={renderField}
            form={form}
            fieldErrors={fieldErrors}
            onClearFieldError={(name) => setFieldErrors(prev => ({ ...prev, [name]: '' }))}
            apiError={apiError}
            onCancel={onSuccess}
          />
        )}
      </form>
    </div>
  );
};

export default AddEntrepreneurForm;
