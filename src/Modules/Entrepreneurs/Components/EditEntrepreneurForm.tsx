import { useState, useRef, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useUpdateEntrepreneur, transformUpdateDataToDto } from '../Services/EntrepreneursServices';
import type { Entrepreneur, EntrepreneurUpdateData } from '../Types';
import { useSuccessAlert } from '../../Shared/components';
import EditPersonalDataStep from './EditPersonalDataStep';
import EditEntrepreneurshipDataStep from './EditEntrepreneurshipDataStep';
import '../Styles/EditEntrepreneurForm.css';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface EditEntrepreneurFormProps {
  entrepreneur: Entrepreneur;
  onSuccess: () => void;
}

const EditEntrepreneurForm = ({ entrepreneur, onSuccess }: EditEntrepreneurFormProps) => {
  const { showSuccess } = useSuccessAlert();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const formContainerRef = useRef<HTMLDivElement>(null);
  const updateEntrepreneur = useUpdateEntrepreneur(entrepreneur.id_entrepreneur!);

  useEffect(() => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);
  
  const form = useForm({
    defaultValues: {
      first_name: entrepreneur.person?.first_name || '',
      second_name: entrepreneur.person?.second_name || '',
      first_lastname: entrepreneur.person?.first_lastname || '',
      second_lastname: entrepreneur.person?.second_lastname || '',
      email: entrepreneur.person?.email || '',
      phone_primary: entrepreneur.person?.phone_primary || '',
      phone_secondary: entrepreneur.person?.phone_secondary || '',
      experience: entrepreneur.experience || 0,
      facebook_url: entrepreneur.facebook_url || '',
      instagram_url: entrepreneur.instagram_url || '',
      entrepreneurship_name: entrepreneur.entrepreneurship?.name || '',
      description: entrepreneur.entrepreneurship?.description || '',
      location: entrepreneur.entrepreneurship?.location || '',
      category: entrepreneur.entrepreneurship?.category || 'Comida' as const,
      approach: entrepreneur.entrepreneurship?.approach || 'social' as const,
      // Aquí dejamos las URLs existentes como string si hay
      url_1: entrepreneur.entrepreneurship?.url_1 || '',
      url_2: entrepreneur.entrepreneurship?.url_2 || '',
      url_3: entrepreneur.entrepreneurship?.url_3 || '',
    } satisfies Omit<EntrepreneurUpdateData, 'id_entrepreneur'>,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setApiError('');
      try {
        if (!entrepreneur.id_entrepreneur) {
          throw new Error('No se puede actualizar el emprendedor: ID no válido.');
        }

        const dto = transformUpdateDataToDto(value);
        await updateEntrepreneur.mutateAsync(dto);
        showSuccess('El emprendedor ha sido actualizado exitosamente.');
        onSuccess();
      } catch (error: any) {
        if (error?.response?.status === 409) {
          const conflictMessage = getConflictErrorMessage(error.response.data);
          setApiError(conflictMessage);
        } else if (error?.response?.status === 400) {
          setApiError('Los datos enviados son inválidos. Por favor revisa todos los campos.');
        } else if (error?.response?.status === 500) {
          setApiError('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setApiError('Error al actualizar el emprendedor. Por favor intenta de nuevo.');
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
      if (message.includes('entrepreneurship') || message.includes('emprendimiento')) {
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

    if (!values.first_name?.trim()) errors.first_name = 'El primer nombre es obligatorio.';
    if (!values.first_lastname?.trim()) errors.first_lastname = 'El primer apellido es obligatorio.';
    if (!values.second_lastname?.trim()) errors.second_lastname = 'El segundo apellido es obligatorio.';
    if (!values.email?.trim()) errors.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Debe ser un correo electrónico válido.';
    if (values.experience === null || values.experience === undefined) errors.experience = 'Los años de experiencia son obligatorios.';
    else if (typeof values.experience === 'number' && (values.experience < 0 || values.experience > 100)) errors.experience = 'Debe estar entre 0 y 100 años.';
    if (!values.phone_primary) errors.phone_primary = 'El teléfono principal es obligatorio.';
    else if (!validatePhone(values.phone_primary as string)) errors.phone_primary = 'El teléfono principal no es válido. Selecciona el código de país e ingresa el número.';

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

    if (!values.entrepreneurship_name?.trim()) errors.entrepreneurship_name = 'El nombre del emprendimiento es obligatorio.';
    if (!values.description?.trim()) errors.description = 'La descripción es obligatoria.';
    else if (values.description.trim().length < 80) errors.description = 'La descripción debe tener al menos 80 caracteres.';
    if (!values.location?.trim()) errors.location = 'La ubicación es obligatoria.';
    if (!values.category) errors.category = 'La categoría es obligatoria.';
    if (!values.approach) errors.approach = 'El enfoque es obligatorio.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors, [
        'entrepreneurship_name', 'description', 'location',
        'category', 'approach',
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
    if (validateStep2()) form.handleSubmit();
  };


  const renderField = (name: keyof EntrepreneurUpdateData, config: any = {}) => {
    const {
      label,
      required = false,
      type = 'text',
      placeholder = '',
      validators = {},
      withIcon = false,
      icon = null,
      options = [],
      min,
      max,
      maxLength,
      minLength,
      showCharacterCount = false,
      helpText,
      disabled = false,
      readOnly = false,
      initialValue = undefined, 
    } = config;

    return (
      <form.Field
        name={name}
        validators={validators}
      >
        {(field) => {
          const value = field.state.value;
          let currentLength = 0;

          if (typeof value === 'string') currentLength = value.length;
          else if (Array.isArray(value)) currentLength = value.length;
          else if (typeof value === 'number') currentLength = value.toString().length;
          else if (value === null || value === undefined) currentLength = 0;

          let showRequiredText = false;
          let showInitialEditable = false;

          if (required && initialValue !== undefined) {
            const hasInitialValue = initialValue &&
              (typeof initialValue === 'string' ? initialValue.trim() !== '' : true);

            if (hasInitialValue) {
              showInitialEditable = true;

              if (minLength) {
                showRequiredText = currentLength < minLength;
              } else {
                if (type === 'number') {
                  showRequiredText = value === null || value === undefined;
                } else {
                  showRequiredText = !value || (typeof value === 'string' && value.trim() === '');
                }
              }
            } else {
              if (minLength) {
                showRequiredText = currentLength < minLength;
              } else {
                if (type === 'number') {
                  showRequiredText = value === null || value === undefined;
                } else {
                  showRequiredText = !value || (typeof value === 'string' && value.trim() === '');
                }
              }
            }
          }

          return (
            <div data-field={name} className={config.type === 'url' ? 'edit-entrepreneur-form__file-field' : ''}>
              <label className="edit-entrepreneur-form__label">
                {label}{' '}
                {showInitialEditable && !showRequiredText && !touchedFields[name as string] && !disabled && !readOnly && (
                  <span className="edit-entrepreneur-form__initial-editable">valor inicial editable</span>
                )}
                {(showRequiredText || (required && initialValue === undefined)) && (
                  <span className="edit-entrepreneur-form__required">*</span>
                )}
              </label>

              {type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => { field.handleChange(e.target.value as any); setTouchedFields(prev => ({ ...prev, [name as string]: true })); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                  className="edit-entrepreneur-form__input edit-entrepreneur-form__input--textarea"
                  placeholder={placeholder}
                  required={required}
                  maxLength={maxLength}
                  minLength={minLength}
                  disabled={disabled}
                  readOnly={readOnly}
                />
              ) : type === 'select' ? (
                <select
                  name={field.name}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => { field.handleChange(e.target.value as any); setTouchedFields(prev => ({ ...prev, [name as string]: true })); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                  className="edit-entrepreneur-form__input edit-entrepreneur-form__input--select"
                  required={required}
                  disabled={disabled}
                >
                  {options.map((option: string) => {
                    const displayLabel = option.charAt(0).toUpperCase() + option.slice(1);
                    return (
                      <option key={option} value={option}>
                        {displayLabel}
                      </option>
                    );
                  })}
                </select>
              ) : type === 'file' ? (
                // NOTE: dejamos este file input simple por compatibilidad,
                // pero la UI para imágenes en el paso "Emprendimiento" usará controles específicos (preview + replace/delete).
                <input
                  type="file"
                  name={field.name}
                  accept={config.accept || 'image/*'}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.handleChange((file ?? '') as any);
                  }}
                  className="edit-entrepreneur-form__input"
                  required={required}
                  disabled={disabled}
                />
              ) : withIcon ? (
                <div className="edit-entrepreneur-form__input-wrapper">
                  <div className="edit-entrepreneur-form__icon">{icon}</div>
                  <input
                    type={type}
                    name={field.name}
                    value={(typeof value === 'string' || typeof value === 'number') ? value : ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      if (type === 'number') {
                        const val = e.target.value;
                        field.handleChange(val === '' ? null : parseInt(val) as any);
                      } else {
                        field.handleChange(e.target.value as any);
                      }
                      setTouchedFields(prev => ({ ...prev, [name as string]: true }));
                      if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' }));
                    }}
                    className="edit-entrepreneur-form__input edit-entrepreneur-form__input--with-icon"
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    required={required}
                    maxLength={maxLength}
                    minLength={minLength}
                    disabled={disabled}
                    readOnly={readOnly}
                  />
                </div>
              ) : (
                <input
                  type={type}
                  name={field.name}
                  value={(typeof value === 'string' || typeof value === 'number') ? value : ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    if (type === 'number') {
                      const val = e.target.value;
                      field.handleChange(val === '' ? null : parseInt(val) as any);
                    } else {
                      field.handleChange(e.target.value as any);
                    }
                    setTouchedFields(prev => ({ ...prev, [name as string]: true }));
                    if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' }));
                  }}
                  className="edit-entrepreneur-form__input"
                  placeholder={placeholder}
                  min={min}
                  max={max}
                  required={required}
                  maxLength={maxLength}
                  minLength={minLength}
                  disabled={disabled}
                  readOnly={readOnly}
                />
              )}

              {showCharacterCount && maxLength && (
                <div className="edit-entrepreneur-form__field-info">
                  {minLength && <div className="edit-entrepreneur-form__min-length">Mínimo: {minLength} caracteres</div>}
                  <div className={`edit-entrepreneur-form__character-count ${(currentLength > maxLength * 0.9) ? 'edit-entrepreneur-form__character-count--warning' : ''} ${(currentLength === maxLength) ? 'edit-entrepreneur-form__character-count--error' : ''}`}>
                    {currentLength}/{maxLength} caracteres
                  </div>
                </div>
              )}

              {helpText && <p className="edit-entrepreneur-form__help-text">{helpText}</p>}
              {field.state.meta.errors && <span className="edit-entrepreneur-form__error-text">{field.state.meta.errors[0]}</span>}
              {fieldErrors[name as string] && <span className="edit-entrepreneur-form__error-text">{fieldErrors[name as string]}</span>}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="edit-entrepreneur-form" ref={formContainerRef}>
      <div className="edit-entrepreneur-form__progress">
        <div className="edit-entrepreneur-form__progress-bar">
          <div className="edit-entrepreneur-form__progress-fill" style={{ width: `${(currentStep / 2) * 100}%` }}></div>
        </div>
        <div className="edit-entrepreneur-form__steps">
          <div className={`edit-entrepreneur-form__step ${currentStep >= 1 ? 'edit-entrepreneur-form__step--active' : ''}`}>
            <span className="edit-entrepreneur-form__step-number">1</span>
            <span className="edit-entrepreneur-form__step-label">Datos Personales</span>
          </div>
          <div className={`edit-entrepreneur-form__step ${currentStep >= 2 ? 'edit-entrepreneur-form__step--active' : ''}`}>
            <span className="edit-entrepreneur-form__step-number">2</span>
            <span className="edit-entrepreneur-form__step-label">Emprendimiento</span>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="edit-entrepreneur-form__form">
        {currentStep === 1 ? (
          <EditPersonalDataStep
            entrepreneur={entrepreneur}
            formValues={form.state.values}
            onNext={handleNextStep}
            onCancel={onSuccess}
            renderField={renderField}
            phonePrimary={form.state.values.phone_primary as string}
            onPhonePrimaryChange={(val) => { form.setFieldValue('phone_primary', val as any); if (fieldErrors.phone_primary) setFieldErrors(prev => ({ ...prev, phone_primary: '' })); }}
            phonePrimaryError={fieldErrors.phone_primary || (form.state.values.phone_primary && !validatePhone(form.state.values.phone_primary as string) ? 'El número de teléfono no es válido' : undefined)}
            phoneSecondary={form.state.values.phone_secondary as string}
            onPhoneSecondaryChange={(val) => form.setFieldValue('phone_secondary', val as any)}
            phoneSecondaryError={
              form.state.values.phone_secondary && !validatePhone(form.state.values.phone_secondary as string)
                ? 'El número de teléfono no es válido'
                : undefined
            }
          />
        ) : (
          <EditEntrepreneurshipDataStep
            entrepreneur={entrepreneur}
            formValues={form.state.values}
            onPrevious={handlePrevStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            renderField={renderField}
            form={form}
            errorMessage={apiError}
            onCancel={onSuccess}
            touchedFields={touchedFields}
            onTouchField={(name) => setTouchedFields(prev => ({ ...prev, [name]: true }))}
          />
        )}
      </form>
    </div>
  );
};

export default EditEntrepreneurForm;
