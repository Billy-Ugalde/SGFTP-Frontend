import { useState, useRef, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAddVolunteer, transformFormDataToDto } from '../Services/VolunteersServices';
import type { VolunteerFormData } from '../Types';
import '../Styles/AddVolunteerForm.css';

interface AddVolunteerFormProps {
  onSuccess: () => void;
}

const AddVolunteerForm = ({ onSuccess }: AddVolunteerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const formContainerRef = useRef<HTMLDivElement>(null);

  const addVolunteer = useAddVolunteer();

  useEffect(() => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  const form = useForm({
    defaultValues: {
      first_name: '',
      second_name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      phone: '', 
      is_active: true,
    } satisfies Omit<VolunteerFormData, 'phones'> & { phone: string },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const dto = transformFormDataToDto({
          ...value,
          phones: [{ number: value.phone }]
        });
        await addVolunteer.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        console.error('Error al registrar voluntario:', error);
        if (error?.response?.status === 409) {
          const conflictMessage = getConflictErrorMessage(error.response.data);
          setErrorMessage(conflictMessage);
        } else if (error?.response?.status === 400) {
          setErrorMessage(
            'Los datos enviados son inválidos. Por favor revisa todos los campos del formulario.'
          );
        } else if (error?.response?.status === 500) {
          setErrorMessage(
            'Error interno del servidor. Por favor intenta más tarde.'
          );
        } else {
          setErrorMessage(
            'Error al registrar el voluntario. Por favor intenta de nuevo.'
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
        return 'Ya existe un voluntario registrado con este email';
      }
      if (message.includes('phone') || message.includes('teléfono')) {
        return 'Ya existe un voluntario registrado con este teléfono';
      }
    }
    return 'Ya existe un registro con algunos de estos datos. Por favor verifica email y teléfono.';
  };

  const validateForm = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate = [
      { name: 'first_name', value: values.first_name?.trim(), elementName: 'first_name', label: 'Primer Nombre' },
      { name: 'first_lastname', value: values.first_lastname?.trim(), elementName: 'first_lastname', label: 'Primer Apellido' },
      { name: 'second_lastname', value: values.second_lastname?.trim(), elementName: 'second_lastname', label: 'Segundo Apellido' },
      { name: 'email', value: values.email?.trim(), elementName: 'email', label: 'Email' },
      { name: 'phone', value: values.phone?.trim(), elementName: 'phone', label: 'Teléfono' },
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
      } else {
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
      const element = document.querySelector(`[name="${name}"]`);
      if (element) {
        (element as HTMLElement).focus();
        (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.reportValidity();
        }
      }
    }, 100);
  };

  const handleSubmit = () => {
    setErrorMessage('');
    if (validateForm()) {
      form.handleSubmit();
    }
  };

  const renderField = (
    name: keyof (Omit<VolunteerFormData, 'phones'> & { phone: string }),
    config: any = {}
  ) => {
    const {
      label,
      required = false,
      type = 'text',
      placeholder = '',
      maxLength,
      minLength,
      showCharacterCount = false,
    } = config;

    return (
      <form.Field name={name as any}>
        {(field) => {
          const value: any = field.state.value;
          const shouldShowRequired = required && (
            type === 'number' ? (value === null || value === undefined) : !value || (typeof value === 'string' && value.trim() === '')
          );

  
          let currentLength = 0;
          if (typeof value === 'string') currentLength = value.length;
          else if (Array.isArray(value)) currentLength = value.length;
          else if (typeof value === 'number') currentLength = value.toString().length;
          else if (value === null || value === undefined) currentLength = 0;

          return (
            <div className="add-volunteer-form__field">
              <label className="add-volunteer-form__label">
                {label}{' '}
                {shouldShowRequired && (
                  <span className="add-volunteer-form__required">
                    campo obligatorio
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
                  field.handleChange(e.target.value as any);
                }}
                className="add-volunteer-form__input"
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                minLength={minLength}
              />
              
              {/* Contador de caracteres */}
              {showCharacterCount && maxLength && (
                <div className="add-volunteer-form__field-info">
                  {minLength && <div className="add-volunteer-form__min-length">Mínimo: {minLength} caracteres</div>}
                  <div className={`add-volunteer-form__character-count ${(currentLength > maxLength * 0.9) ? 'add-volunteer-form__character-count--warning' : ''} ${(currentLength === maxLength) ? 'add-volunteer-form__character-count--error' : ''}`}>
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
    <div className="add-volunteer-form" ref={formContainerRef}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
        className="add-volunteer-form__form"
      >
        <div className="add-volunteer-form__step-content">
          <div className="add-volunteer-form__step-header">
            <div className="add-volunteer-form__step-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="add-volunteer-form__step-title">Información del Voluntario</h3>
              <p className="add-volunteer-form__step-description">
                Completa los datos personales del voluntario
              </p>
            </div>
          </div>

          <div className="add-volunteer-form__fields">
            <div className="add-volunteer-form__row">
              {renderField('first_name', {
                label: 'Primer Nombre',
                required: true,
                placeholder: 'Ingresa el primer nombre',
                maxLength: 50,
                showCharacterCount: true,
                minLength: 2
              })}

              {renderField('second_name', {
                label: 'Segundo Nombre',
                placeholder: 'Segundo nombre (opcional)',
                maxLength: 50,
                showCharacterCount: true
              })}
            </div>

            <div className="add-volunteer-form__row">
              {renderField('first_lastname', {
                label: 'Primer Apellido',
                required: true,
                placeholder: 'Primer apellido',
                maxLength: 50,
                showCharacterCount: true,
                minLength: 2
              })}

              {renderField('second_lastname', {
                label: 'Segundo Apellido',
                required: true,
                placeholder: 'Segundo apellido',
                maxLength: 50,
                showCharacterCount: true,
                minLength: 2
              })}
            </div>

            {renderField('email', {
              label: 'Email',
              required: true,
              type: 'email',
              placeholder: 'correo@ejemplo.com',
              maxLength: 254,
              showCharacterCount: true,
              minLength: 6
            })}

            <div className="add-volunteer-form__section">
              <h3 className="add-volunteer-form__section-title">Teléfono de Contacto</h3>
              <p className="add-volunteer-form__section-description">
                Agrega un número de teléfono de contacto
              </p>
            </div>

            {/* SOLO UN TELÉFONO */}
            {renderField('phone', {
              label: 'Teléfono',
              required: true,
              type: 'tel',
              placeholder: '+506 1234-5678',
              maxLength: 20,
              showCharacterCount: true,
              minLength: 8
            })}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="add-volunteer-form__error">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="add-volunteer-form__error-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="add-volunteer-form__error-text">{errorMessage}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="add-volunteer-form__step-actions">
            <button
              type="button"
              onClick={onSuccess}
              className="add-volunteer-form__cancel-btn"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="add-volunteer-form__submit-btn"
            >
              {isLoading ? (
                <>
                  <svg className="add-volunteer-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Voluntario'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddVolunteerForm;