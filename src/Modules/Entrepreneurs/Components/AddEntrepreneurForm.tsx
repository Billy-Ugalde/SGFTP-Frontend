// AddEntrepreneurForm.tsx 
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
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
  const addEntrepreneur = useAddEntrepreneur();

  const form = useForm({
    defaultValues: {
      first_name: '',
      second_name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      phones: [{
        number: '',
        type: 'personal',
        is_primary: true,
      }],
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

        const validationError = validateFormData(value);
        if (validationError) {
          setErrorMessage(validationError);
          setIsLoading(false);
          return;
        }

        const dto = transformFormDataToDto(value);
        console.log('Datos a enviar:', dto); // Para debugging

        await addEntrepreneur.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        console.error('Error al registrar emprendedor:', error);


        if (error?.response?.status === 409) {
          const conflictMessage = getConflictErrorMessage(error.response.data);
          setErrorMessage(conflictMessage);
        } else if (error?.response?.status === 400) {
          setErrorMessage('Los datos enviados son inválidos. Por favor revisa todos los campos.');
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


  const validateFormData = (data: EntrepreneurFormData): string | null => {
    if (!data.first_name?.trim()) return 'El primer nombre es obligatorio';
    if (!data.first_lastname?.trim()) return 'El primer apellido es obligatorio';
    if (!data.second_lastname?.trim()) return 'El segundo apellido es obligatorio';
    if (!data.email?.trim()) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Formato de email inválido';
    if (!data.phones[0]?.number?.trim()) return 'El teléfono es obligatorio';

    if (data.experience === null || data.experience === undefined) {
      return 'La experiencia es obligatoria';
    }
    if (data.experience < 0 || data.experience > 100) {
      return 'La experiencia debe estar entre 0 y 100 años';
    }
    
    if (data.facebook_url && !/^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/i.test(data.facebook_url)) {
      return 'La URL de Facebook debe ser válida (ejemplo: https://facebook.com/tupagina)';
    }
    if (data.instagram_url && !/^https?:\/\/(www\.)?instagram\.com\/.+/i.test(data.instagram_url)) {
      return 'La URL de Instagram debe ser válida (ejemplo: https://instagram.com/tuusuario)';
    }


    if (!data.entrepreneurship_name?.trim()) return 'El nombre del emprendimiento es obligatorio';
    if (!data.description?.trim()) return 'La descripción es obligatoria';
    if (!data.location?.trim()) return 'La ubicación es obligatoria';

    return null;
  };


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

  const handleNextStep = () => {
    const step1Data = {
      first_name: form.state.values.first_name,
      first_lastname: form.state.values.first_lastname,
      second_lastname: form.state.values.second_lastname,
      email: form.state.values.email,
      phones: form.state.values.phones,
      experience: form.state.values.experience,
      facebook_url: form.state.values.facebook_url,
      instagram_url: form.state.values.instagram_url
    };

    const validationError = validateStep1(step1Data);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setCurrentStep(2);
  };

  const validateStep1 = (data: any): string | null => {
    if (!data.first_name?.trim()) return 'El primer nombre es obligatorio';
    if (!data.first_lastname?.trim()) return 'El primer apellido es obligatorio';
    if (!data.second_lastname?.trim()) return 'El segundo apellido es obligatorio';
    if (!data.email?.trim()) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Formato de email inválido';
    if (!data.phones[0]?.number?.trim()) return 'El teléfono es obligatorio';
    
    if (data.experience === null || data.experience === undefined) {
      return 'La experiencia es obligatoria';
    }
    if (data.experience < 0 || data.experience > 100) {
      return 'La experiencia debe estar entre 0 y 100 años';
    }

    if (data.facebook_url && !/^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/i.test(data.facebook_url)) {
      return 'La URL de Facebook debe ser válida';
    }
    if (data.instagram_url && !/^https?:\/\/(www\.)?instagram\.com\/.+/i.test(data.instagram_url)) {
      return 'La URL de Instagram debe ser válida';
    }

    return null;
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrorMessage('');
  };

  const handleSubmit = () => {
    form.handleSubmit();
  };

  // Función helper para renderizar campos
  const renderField = (name: keyof EntrepreneurFormData | 'phones[0].number', config: any = {}) => {
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
      max
    } = config;

    return (
      <form.Field
        name={name as any}
        validators={validators}
      >
        {(field) => (
          <div className={config.type === 'url' ? 'add-entrepreneur-form__file-field' : ''}>
            <label className="add-entrepreneur-form__label">
              {label} {required && <span className="add-entrepreneur-form__required">*</span>}
            </label>

            {type === 'textarea' ? (
              <textarea
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as any)}
                className="add-entrepreneur-form__input add-entrepreneur-form__input--textarea"
                placeholder={placeholder}
              />
            ) : type === 'select' ? (
              <select
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as any)}
                className="add-entrepreneur-form__input add-entrepreneur-form__input--select"
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
                  name={field.name}
                  value={field.state.value === null ? '' : field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                     if (type === 'number') {
                      const value = e.target.value;
                      if (value === '') {
                        field.handleChange(null as any);
                      } else {
                        const numValue = parseInt(value);
                        field.handleChange(isNaN(numValue) ? null : numValue as any);
                      }
                    } else {
                      field.handleChange(e.target.value as any);
                    }
                  }}
                  className="add-entrepreneur-form__input add-entrepreneur-form__input--with-icon"
                  placeholder={placeholder}
                  min={min}
                  max={max}
                />
              </div>
            ) : (
              <input
                type={type}
                name={field.name}
                value={field.state.value === null ? '' : field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => {
                   if (type === 'number') {
                      const value = e.target.value;
                      if (value === '') {
                        field.handleChange(null as any);
                      } else {
                        const numValue = parseInt(value);
                        field.handleChange(isNaN(numValue) ? null : numValue as any);
                      }
                    } else {
                      field.handleChange(e.target.value as any);
                    }
                }}
                className="add-entrepreneur-form__input"
                placeholder={placeholder}
                min={min}
                max={max}
              />
            )}

            {field.state.meta.errors && (
              <span className="add-entrepreneur-form__error-text">
                {field.state.meta.errors[0]}
              </span>
            )}
          </div>
        )}
      </form.Field>
    );
  };

  return (
    <div className="add-entrepreneur-form">
      {/* Progress indicator */}
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

      {/* Error Message */}
      {errorMessage && (
        <div className="add-entrepreneur-form__error-banner">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{errorMessage}</span>
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