import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useUpdateEntrepreneur, transformUpdateDataToDto } from '../Services/EntrepreneursServices';
import type { Entrepreneur, EntrepreneurUpdateData, Phone } from '../Services/EntrepreneursServices';
import EditPersonalDataStep from './EditPersonalDataStep';
import EditEntrepreneurshipDataStep from './EditEntrepreneurshipDataStep';
import '../Styles/EditEntrepreneurForm.css'

interface EditEntrepreneurFormProps {
  entrepreneur: Entrepreneur;
  onSuccess: () => void;
}

const EditEntrepreneurForm = ({ entrepreneur, onSuccess }: EditEntrepreneurFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const updateEntrepreneur = useUpdateEntrepreneur(entrepreneur.id_entrepreneur!);
  
  const form = useForm({
    defaultValues: {
      first_name: entrepreneur.person?.first_name || '',
      second_name: entrepreneur.person?.second_name || '',
      first_lastname: entrepreneur.person?.first_lastname || '',
      second_lastname: entrepreneur.person?.second_lastname || '',
      email: entrepreneur.person?.email || '',
      phones: entrepreneur.person?.phones && entrepreneur.person.phones.length > 0
        ? entrepreneur.person.phones
        : [{ number: '', type: 'personal', is_primary: true }, { number: '', type: 'business', is_primary: false }],
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
      setErrorMessage('');
      try {
        if (!entrepreneur.id_entrepreneur) {
          throw new Error('No se puede actualizar el emprendedor: ID no válido.');
        }

        const dto = transformUpdateDataToDto(value);
        await updateEntrepreneur.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        if (error?.response?.status === 409) {
          const conflictMessage = getConflictErrorMessage(error.response.data);
          setErrorMessage(conflictMessage);
        } else if (error?.response?.status === 400) {
          setErrorMessage('Los datos enviados son inválidos. Por favor revisa todos los campos.');
        } else if (error?.response?.status === 500) {
          setErrorMessage('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setErrorMessage('Error al actualizar el emprendedor. Por favor intenta de nuevo.');
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

  const validateStep1 = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate = [
      { name: 'first_name', value: values.first_name?.trim(), elementName: 'first_name', label: 'Primer Nombre' },
      { name: 'first_lastname', value: values.first_lastname?.trim(), elementName: 'first_lastname', label: 'Primer Apellido' },
      { name: 'second_lastname', value: values.second_lastname?.trim(), elementName: 'second_lastname', label: 'Segundo Apellido' },
      { name: 'email', value: values.email?.trim(), elementName: 'email', label: 'Email' },
      { name: 'phones[0].number', value: values.phones[0]?.number?.trim(), elementName: 'phones.0.number', label: 'Teléfono Principal' },
      { name: 'experience', value: values.experience, elementName: 'experience', label: 'Años de Experiencia' },
    ];

    for (const field of fieldsToValidate) {
      if (field.name === 'email') {
        if (!field.value) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" es obligatorio.`);
          focusField(field.elementName);
          break;
        }
        if (typeof field.value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" debe ser un correo electrónico válido.`);
          focusField(field.elementName);
          break;
        }
      }
      else if (field.name === 'experience') {
        if (field.value === null || field.value === undefined) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" es obligatorio.`);
          focusField(field.elementName);
          break;
        }
        if (typeof field.value === 'number' && (field.value < 0 || field.value > 100)) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" debe estar entre 0 y 100 años.`);
          focusField(field.elementName);
          break;
        }
      }
      else {
        if (!field.value) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" es obligatorio.`);
          focusField(field.elementName);
          break;
        }
      }
    }

    return isValid;
  };

  const focusField = (name: string) => {
    setTimeout(() => {
      let element;
      if (name === 'phones.0.number') {
        element = document.querySelector(`[name="phones[0].number"]`);
      } else {
        element = document.querySelector(`[name="${name}"]`);
      }
      if (element) {
        (element as HTMLElement).focus();
        (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.reportValidity();
        }
      }
    }, 100);
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const validateStep2 = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate: Array<{
      name: string;
      value: string | number | File | undefined;
      elementName: string;
      label: string;
      minLength?: number;
      isFile?: boolean;
    }> = [
      { name: 'entrepreneurship_name', value: values.entrepreneurship_name?.trim(), elementName: 'entrepreneurship_name', label: 'Nombre del Emprendimiento' },
      { name: 'description', value: values.description?.trim(), elementName: 'description', label: 'Descripción', minLength: 80 },
      { name: 'location', value: values.location?.trim(), elementName: 'location', label: 'Ubicación' },
      { name: 'category', value: values.category, elementName: 'category', label: 'Categoría' },
      { name: 'approach', value: values.approach, elementName: 'approach', label: 'Enfoque' },
      { name: 'url_1', value: values.url_1, elementName: 'url_1', label: 'Imagen 1', isFile: true },
      { name: 'url_2', value: values.url_2, elementName: 'url_2', label: 'Imagen 2', isFile: true },
      { name: 'url_3', value: values.url_3, elementName: 'url_3', label: 'Imagen 3', isFile: true },
    ];

    for (const field of fieldsToValidate) {
      if (field.isFile) {
        if (!field.value) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" es obligatorio. Debes tener una imagen.`);
          focusField(field.elementName);
          break;
        }
        if (!(field.value instanceof File) && typeof field.value !== 'string') {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" debe ser una imagen válida.`);
          focusField(field.elementName);
          break;
        }
      }
      else if (field.minLength) {
        if (!field.value) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" es obligatorio.`);
          focusField(field.elementName);
          break;
        }
        if (typeof field.value === 'string' && field.value.length < field.minLength) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" debe tener al menos ${field.minLength} caracteres.`);
          focusField(field.elementName);
          break;
        }
      }
      else {
        if (!field.value) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" es obligatorio.`);
          focusField(field.elementName);
          break;
        }
      }
    }

    return isValid;
  };

  const handleNextStep = () => {
    setErrorMessage('');
    const isValid = validateStep1();
    if (!isValid) {
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrorMessage('');
  };

  const handleSubmit = () => {
    setErrorMessage('');
    const isValid = validateStep2();
    if (!isValid) {
      return;
    }
    form.handleSubmit();
  };


  const renderField = (name: keyof EntrepreneurUpdateData | 'phones[0].number' | 'phones[1].number', config: any = {}) => {
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
            <div className={config.type === 'url' ? 'edit-entrepreneur-form__file-field' : ''}>
              <label className="edit-entrepreneur-form__label">
                {label}{' '}
                {showInitialEditable && !showRequiredText && (
                  <span className="edit-entrepreneur-form__initial-editable">valor inicial editable</span>
                )}
                {(showRequiredText || (required && initialValue === undefined)) && (
                  <span className="edit-entrepreneur-form__required">campo obligatorio</span>
                )}
              </label>

              {type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
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
                  onChange={(e) => field.handleChange(e.target.value as any)}
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
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="edit-entrepreneur-form">
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
            errorMessage={errorMessage}
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
            errorMessage={errorMessage}
            onCancel={onSuccess}
          />
        )}
      </form>
    </div>
  );
};

export default EditEntrepreneurForm;
