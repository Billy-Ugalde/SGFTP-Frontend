import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useUpdateEntrepreneur, transformUpdateDataToDto } from '../Services/EntrepreneursServices';
import type { Entrepreneur, EntrepreneurUpdateData } from '../Services/EntrepreneursServices';
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
  const updateEntrepreneur = useUpdateEntrepreneur();

  const form = useForm({
    defaultValues: {
      first_name: entrepreneur.person?.first_name || '',
      second_name: entrepreneur.person?.second_name || '',
      first_lastname: entrepreneur.person?.first_lastname || '',
      second_lastname: entrepreneur.person?.second_lastname || '',
      email: entrepreneur.person?.email || '',
      phones: entrepreneur.person?.phones && entrepreneur.person.phones.length > 0
        ? entrepreneur.person.phones
        : [{ number: '', type: 'personal', is_primary: true }],
      experience: entrepreneur.experience || 0,
      facebook_url: entrepreneur.facebook_url || '',
      instagram_url: entrepreneur.instagram_url || '',
      entrepreneurship_name: entrepreneur.entrepreneurship?.name || '',
      description: entrepreneur.entrepreneurship?.description || '',
      location: entrepreneur.entrepreneurship?.location || '',
      category: entrepreneur.entrepreneurship?.category || 'Comida' as const,
      approach: entrepreneur.entrepreneurship?.approach || 'social' as const,
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
        await updateEntrepreneur.mutateAsync({
          id_entrepreneur: entrepreneur.id_entrepreneur,
          ...dto
        });
        onSuccess();
      } catch (error: any) {
        console.error('Error al actualizar emprendedor:', error);
        
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
      { 
        name: 'first_name', 
        value: values.first_name?.trim(),
        elementName: 'first_name'
      },
      { 
        name: 'first_lastname', 
        value: values.first_lastname?.trim(),
        elementName: 'first_lastname'
      },
      { 
        name: 'second_lastname', 
        value: values.second_lastname?.trim(),
        elementName: 'second_lastname'
      },
      { 
        name: 'email', 
        value: values.email?.trim(),
        elementName: 'email',
        validate: (val: string) => !val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      },
      { 
        name: 'phones[0].number', 
        value: values.phones[0]?.number?.trim(),
        elementName: 'phones.0.number'
      },
      { 
        name: 'experience', 
        value: values.experience,
        elementName: 'experience',
        validate: (val: any) => val === null || val === undefined || val < 0 || val > 100
      }
    ];

    for (const field of fieldsToValidate) {
      let fieldInvalid = false;
      
      if (field.validate) {
        fieldInvalid = field.validate(field.value as any);
      } else {
        fieldInvalid = !field.value;
      }
      
      if (fieldInvalid) {
        isValid = false;
        
        setTimeout(() => {
          let element;
          if (field.elementName === 'phones.0.number') {
            element = document.querySelector(`[name="phones[0].number"]`);
          } else {
            element = document.querySelector(`[name="${field.elementName}"]`);
          }
          
          if (element) {
            (element as HTMLElement).focus();
            (element as HTMLElement).scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
              element.reportValidity();
            }
          }
        }, 100);
        
        break;
      }
    }

    return isValid;
  };

  const validateStep2 = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate = [
      { 
        name: 'entrepreneurship_name', 
        value: values.entrepreneurship_name?.trim(),
        elementName: 'entrepreneurship_name'
      },
      { 
        name: 'description', 
        value: values.description?.trim(),
        elementName: 'description',
        validate: (val: string) => !val || val.length < 80
      },
      { 
        name: 'location', 
        value: values.location?.trim(),
        elementName: 'location'
      },
      { 
        name: 'category', 
        value: values.category,
        elementName: 'category'
      },
      { 
        name: 'approach', 
        value: values.approach,
        elementName: 'approach'
      },
      { 
        name: 'url_1', 
        value: values.url_1?.trim(),
        elementName: 'url_1',
        validate: (val: string) => {
          if (!val) return true;
          try {
            new URL(val);
            return false;
          } catch {
            return true;
          }
        }
      },
      { 
        name: 'url_2', 
        value: values.url_2?.trim(),
        elementName: 'url_2',
        validate: (val: string) => {
          if (!val) return true;
          try {
            new URL(val);
            return false;
          } catch {
            return true;
          }
        }
      },
      { 
        name: 'url_3', 
        value: values.url_3?.trim(),
        elementName: 'url_3',
        validate: (val: string) => {
          if (!val) return true;
          try {
            new URL(val);
            return false;
          } catch {
            return true;
          }
        }
      }
    ];

    for (const field of fieldsToValidate) {
      let fieldInvalid = false;
      
      if (field.validate) {
        fieldInvalid = field.validate(field.value);
      } else {
        fieldInvalid = !field.value;
      }
      
      if (fieldInvalid) {
        isValid = false;
        
        setTimeout(() => {
          const element = document.querySelector(`[name="${field.elementName}"]`);
          
          if (element) {
            (element as HTMLElement).focus();
            (element as HTMLElement).scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
              element.reportValidity();
              
              if (field.elementName.startsWith('url_') && field.value && !isValidUrl(field.value)) {
                element.setCustomValidity('Por favor ingresa una URL válida');
                element.reportValidity();
                setTimeout(() => element.setCustomValidity(''), 3000);
              }
            }
          }
        }, 100);
        
        break;
      }
    }

    return isValid;
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleNextStep = () => {
    setErrorMessage('');
    
    const isValid = validateStep1();
    
    if (!isValid) {
      setErrorMessage('Por favor completa todos los campos obligatorios correctamente.');
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
      setErrorMessage('Por favor completa todos los campos obligatorios correctamente.');
      return;
    }
    
    form.handleSubmit();
  };

  const renderField = (name: keyof Omit<EntrepreneurUpdateData, 'id_entrepreneur'> | 'phones[0].number', config: any = {}) => {
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
      helpText
    } = config;

    return (
      <form.Field
        name={name}
        validators={validators}
      >
        {(field) => {
          const value = field.state.value;
          let currentLength = 0;
          
          if (typeof value === 'string') {
            currentLength = value.length;
          } else if (Array.isArray(value)) {
            currentLength = value.length;
          } else if (typeof value === 'number') {
            currentLength = value.toString().length;
          } else if (value === null || value === undefined) {
            currentLength = 0;
          }

          return (
            <div className={config.type === 'url' ? 'edit-entrepreneur-form__file-field' : ''}>
              <label className="edit-entrepreneur-form__label">
                {label} {required && <span className="edit-entrepreneur-form__required">campo obligatorio</span>}
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
                />
              ) : type === 'select' ? (
                <select
                  name={field.name}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="edit-entrepreneur-form__input edit-entrepreneur-form__input--select"
                  required={required}
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
              ) : withIcon ? (
                <div className="edit-entrepreneur-form__input-wrapper">
                  <div className="edit-entrepreneur-form__icon">
                    {icon}
                  </div>
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
                />
              )}

              {showCharacterCount && maxLength && (
                <div className="edit-entrepreneur-form__field-info">
                  {minLength && (
                    <div className="edit-entrepreneur-form__min-length">Mínimo: {minLength} caracteres</div>
                  )}
                  <div className={`edit-entrepreneur-form__character-count ${
                    (currentLength > maxLength * 0.9) ? 'edit-entrepreneur-form__character-count--warning' : ''
                  } ${
                    (currentLength === maxLength) ? 'edit-entrepreneur-form__character-count--error' : ''
                  }`}>
                    {currentLength}/{maxLength} caracteres
                  </div>
                </div>
              )}

              {helpText && (
                <p className="edit-entrepreneur-form__help-text">
                  {helpText}
                </p>
              )}

              {field.state.meta.errors && (
                <span className="edit-entrepreneur-form__error-text">
                  {field.state.meta.errors[0]}
                </span>
              )}
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
          <div 
            className="edit-entrepreneur-form__progress-fill" 
            style={{ width: `${(currentStep / 2) * 100}%` }}
          ></div>
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

      {errorMessage && (
        <div className="edit-entrepreneur-form__error">
          <svg className="edit-entrepreneur-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="edit-entrepreneur-form__error-text-global">
            {errorMessage}
          </p>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }} className="edit-entrepreneur-form__form">
        
        {currentStep === 1 ? (
          <EditPersonalDataStep
            entrepreneur={entrepreneur}
            formValues={form.state.values}
            onNext={handleNextStep}
            onCancel={onSuccess}
            renderField={renderField}
          />
        ) : (
          <EditEntrepreneurshipDataStep
            entrepreneur={entrepreneur}
            formValues={form.state.values}
            onPrevious={handlePrevStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            renderField={renderField}
          />
        )}
      </form>
    </div>
  );
};

export default EditEntrepreneurForm;