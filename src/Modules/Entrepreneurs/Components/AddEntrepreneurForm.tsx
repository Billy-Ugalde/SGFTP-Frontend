// AddEntrepreneurForm.tsx
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '../../Auth/context/AuthContext';
import { useAddEntrepreneur, transformFormDataToDto } from '../Services/EntrepreneursServices';
import type { EntrepreneurFormData } from '../Services/EntrepreneursServices';
import PersonalDataStep from './AddPersonalDataStep';
import EntrepreneurshipDataStep from './AddEntrepreneurshipDataStep';
import '../Styles/AddEntrepreneurForm.css';

interface AddEntrepreneurFormProps {
  onSuccess: () => void;
}

const AddEntrepreneurForm = ({ onSuccess }: AddEntrepreneurFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  

  const { user } = useAuth();
  const isAdmin = user?.roles?.some((r: string) =>
    ['super_admin', 'general_admin', 'fair_admin'].includes(r)
  ) ?? false;

  const addEntrepreneur = useAddEntrepreneur(isAdmin);

  const form = useForm({
    defaultValues: {
      first_name: '',
      second_name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      phones: [
        {
        number: '',
        type: 'personal',
        is_primary: true,
      },
      {
        number: '',
        type: 'business',
        is_primary: false,
      }
    ],
      experience: null as number | null,
      facebook_url: '',
      instagram_url: '',
      entrepreneurship_name: '',
      description: '',
      location: '',
      category: 'Comida' as const,
      approach: 'social' as const,
      url_1: '',
      url_2: '',
      url_3: '',
    } satisfies EntrepreneurFormData,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const dto = transformFormDataToDto(value);
        console.log('Datos a enviar:', dto);

        await addEntrepreneur.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        console.error('Error al registrar emprendedor:', error);

        if (error?.response?.status === 409) {
          const conflictMessage = getConflictErrorMessage(error.response.data);
          setErrorMessage(conflictMessage);
        } else if (error?.response?.status === 400) {
          setErrorMessage('Los datos enviados son inválidos. Por favor revisa todos los campos de ambos pasos del formulario.');
        } else if (error?.response?.status === 500) {
          setErrorMessage('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setErrorMessage('Error al registrar el emprendedor. Por favor intenta de nuevo.');
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

  // Crear una lista de campos a validar en el orden correcto
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

  // Validar cada campo en orden
  for (const field of fieldsToValidate) {
    let fieldInvalid = false;
    
    if (field.validate) {
      fieldInvalid = field.validate(field.value as any);
    } else {
      fieldInvalid = !field.value;
    }
    
    if (fieldInvalid) {
      isValid = false;
      
      // Enfocar el primer campo inválido encontrado
      setTimeout(() => {
        // Buscar el elemento por name
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
          
          // Disparar evento de validación nativa
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            element.reportValidity();
          }
        }
      }, 100);
      
      break; // Detener en el primer error
    }
  }

  return isValid;
};
  
  const handleNextStep = () => {
    setErrorMessage('');
    
    // Validar todos los campos del paso 1
    const isValid = validateStep1();
    
    if (!isValid) {
      // Mostrar mensaje general de error si hay campos inválidos
      setErrorMessage('Por favor completa todos los campos obligatorios correctamente.');
      return;
    }

    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrorMessage('');
  };

  const validateStep2 = (): boolean => {
  const values = form.state.values;
  let isValid = true;

  // Crear una lista de campos a validar en el orden correcto
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
      validate: (val: string) => !val || val.length < 80 // Mínimo 80 caracteres
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
  // Agregar validación para las URLs de imágenes
    { 
      name: 'url_1', 
      value: values.url_1?.trim(),
      elementName: 'url_1',
      validate: (val: string) => {
        if (!val) return true; // Campo vacío
        try {
          new URL(val); // Validar que sea una URL válida
          return false;
        } catch {
          return true; // URL inválida
        }
      }
    },
    { 
      name: 'url_2', 
      value: values.url_2?.trim(),
      elementName: 'url_2',
      validate: (val: string) => {
        if (!val) return true; // Campo vacío
        try {
          new URL(val); // Validar que sea una URL válida
          return false;
        } catch {
          return true; // URL inválida
        }
      }
    },
    { 
      name: 'url_3', 
      value: values.url_3?.trim(),
      elementName: 'url_3',
      validate: (val: string) => {
        if (!val) return true; // Campo vacío
        try {
          new URL(val); // Validar que sea una URL válida
          return false;
        } catch {
          return true; // URL inválida
        }
      }
    }
  ];

  // Validar cada campo en orden
  for (const field of fieldsToValidate) {
    let fieldInvalid = false;
    
    if (field.validate) {
      fieldInvalid = field.validate(field.value);
    } else {
      fieldInvalid = !field.value;
    }
    
    if (fieldInvalid) {
      isValid = false;
      
      // Enfocar el primer campo inválido encontrado
      setTimeout(() => {
        const element = document.querySelector(`[name="${field.elementName}"]`);
        
        if (element) {
          (element as HTMLElement).focus();
          (element as HTMLElement).scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Disparar evento de validación nativa
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
            element.reportValidity();
            
            // Establecer un mensaje personalizado para URLs inválidas
            if (field.elementName.startsWith('url_') && field.value && !isValidUrl(field.value)) {
              element.setCustomValidity('Por favor ingresa una URL válida');
              element.reportValidity();
              // Restaurar la validación normal después de mostrar el mensaje
              setTimeout(() => element.setCustomValidity(''), 3000);
            }
          }
        }
      }, 100);
      
      break; // Detener en el primer error
    }
  }

  return isValid;
};

// Función auxiliar para validar URLs
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

  const handleSubmit = () => {
     setErrorMessage('');
  
  // Validar todos los campos del paso 2
  const isValid = validateStep2();
  
  if (!isValid) {
    // Mostrar mensaje general de error si hay campos inválidos
    setErrorMessage('Por favor completa todos los campos obligatorios correctamente.');
    return;
  }
    form.handleSubmit();
  };

  const renderField = (name: keyof EntrepreneurFormData | 'phones[0].number' | 'phones[1].number', config: any = {}) => {
    const {
      label,
      required = false,
      type = 'text',
      placeholder = '',
      withIcon = false,
      icon = null,
      options = [],
      min,
      max,
      maxLength,
      minLength,
      showCharacterCount = false
    } = config;

    return (
     <form.Field
        name={name}
      >
        {(field) => {
          const value = field.state.value;
          const currentLength = (typeof value === 'string' || Array.isArray(value)) ? value.length : 0;

          return (
            <div className={config.type === 'url' ? 'add-entrepreneur-form__file-field' : ''}>
              <label className="add-entrepreneur-form__label">
                {label} {required && <span className="add-entrepreneur-form__required">campo obligatorio</span>}
              </label>

              {type === 'textarea' ? (
                <textarea
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="add-entrepreneur-form__input add-entrepreneur-form__input--textarea"
                  placeholder={placeholder}
                  required={required}
                  maxLength={maxLength}
                  minLength={minLength}
                />
              ) : type === 'select' ? (
                 <select
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="add-entrepreneur-form__input add-entrepreneur-form__input--select"
                  required={required}
                >
                  {options.map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : withIcon ? (
                <div className="add-entrepreneur-form__input-wrapper">
                  <div className="add-entrepreneur-form__icon">
                    {icon}
                  </div>
                  <input
                    type={type}
                    name={name as string}
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
                    className="add-entrepreneur-form__input add-entrepreneur-form__input--with-icon"
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
                  name={name as string}
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
                  className="add-entrepreneur-form__input"
                  placeholder={placeholder}
                  min={min}
                  max={max}
                  required={required}
                  maxLength={maxLength}
                  minLength={minLength}
                />
              )}
            
              {showCharacterCount && maxLength && (
                <div className="add-entrepreneur-form__field-info">
                  {minLength && (
                    <div className="add-entrepreneur-form__min-length">Mínimo: {minLength} caracteres</div>
                  )}
                  <div className={`add-entrepreneur-form__character-count ${
                    (currentLength > maxLength * 0.9) ? 'add-entrepreneur-form__character-count--warning' : ''
                  } ${
                    (currentLength === maxLength) ? 'add-entrepreneur-form__character-count--error' : ''
                  }`}>
                    {currentLength}/{maxLength} caracteres
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="add-entrepreneur-form">
      <div className="add-entrepreneur-form__progress">
        <div className="add-entrepreneur-form__progress-bar">
          <div
            className="add-entrepreneur-form__progress-fill"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          ></div>
        </div>
        <div className="add-entrepreneur-form__steps">
          <div className={`add-entrepreneur-form__step ${currentStep >= 1 ? 'add-entrepreneur-form__step--active' : ''}`}>
            <span className="add-entrepreneur-form__step-number">1</span>
            <span className="add-entrepreneur-form__step-label">Datos Personales</span>
          </div>
          <div className={`add-entrepreneur-form__step ${currentStep >= 2 ? 'add-entrepreneur-form__step--active' : ''}`}>
            <span className="add-entrepreneur-form__step-number">2</span>
            <span className="add-entrepreneur-form__step-label">Emprendimiento</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="add-entrepreneur-form__error">
          <svg className="add-entrepreneur-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="add-entrepreneur-form__error-text">
            {errorMessage}
          </p>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }} className="add-entrepreneur-form__form">

        {currentStep === 1 ? (
          <PersonalDataStep
            formValues={form.state.values}
            onNext={handleNextStep}
            onCancel={onSuccess}
            renderField={renderField}
          />
        ) : (
          <EntrepreneurshipDataStep
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

export default AddEntrepreneurForm;