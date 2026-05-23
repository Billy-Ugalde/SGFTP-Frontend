import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAddVolunteer, transformFormDataToDto } from '../Services/VolunteersServices';
import type { VolunteerFormData } from '../Types';
import { useSuccessAlert } from '../../Shared/components';
import '../Styles/AddVolunteerForm.css';
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface AddVolunteerFormProps {
  onSuccess: () => void;
}

const AddVolunteerForm = ({ onSuccess }: AddVolunteerFormProps) => {
  const { showSuccess } = useSuccessAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const addVolunteer = useAddVolunteer();

  const form = useForm({
    defaultValues: {
      first_name: '',
      second_name: '',
      first_lastname: '',
      second_lastname: '',
      email: '',
      phone_primary: '',
      phone_secondary: '',
      is_active: true,
    } satisfies VolunteerFormData,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setApiError('');

      try {
        const dto = transformFormDataToDto(value);
        await addVolunteer.mutateAsync(dto);
        showSuccess('El voluntario ha sido registrado exitosamente.');
        onSuccess();
      } catch (error: any) {
        console.error('Error al registrar voluntario:', error);
        if (error?.response?.status === 409) {
          setApiError(getConflictErrorMessage(error.response.data));
        } else if (error?.response?.status === 400) {
          setApiError('Los datos enviados son inválidos. Por favor revisa todos los campos del formulario.');
        } else if (error?.response?.status === 500) {
          setApiError('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setApiError('Error al registrar el voluntario. Por favor intenta de nuevo.');
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
    const errors: Record<string, string> = {};

    if (!values.first_name?.trim()) errors.first_name = 'El primer nombre es obligatorio.';
    if (!values.first_lastname?.trim()) errors.first_lastname = 'El primer apellido es obligatorio.';
    if (!values.second_lastname?.trim()) errors.second_lastname = 'El segundo apellido es obligatorio.';
    if (!values.email?.trim()) {
      errors.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = 'El email debe ser un correo electrónico válido.';
    }
    if (!values.phone_primary) errors.phone_primary = 'El teléfono principal es obligatorio.';
    else if (!validatePhone(values.phone_primary as string)) errors.phone_primary = 'El teléfono principal no es válido.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    setApiError('');
    if (validateForm()) {
      form.handleSubmit();
    }
  };

  const renderField = (
    name: keyof VolunteerFormData,
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
          const shouldShowOptional = !required && (
            !value || (typeof value === 'string' && value.trim() === '')
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
                  <span className="add-volunteer-form__required">*</span>
                )}
                {shouldShowOptional && (
                  <span className="add-volunteer-form__optional">(opcional)</span>
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
                  if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' }));
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
              {fieldErrors[name as string] && (
                <span className="add-volunteer-form__error-text">{fieldErrors[name as string]}</span>
              )}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="add-volunteer-form">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
        className="add-volunteer-form__form"
        noValidate
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
            <p className="add-volunteer-form__required-legend"><span className="add-volunteer-form__required">*</span> Campo obligatorio</p>
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
              <h3 className="add-volunteer-form__section-title">Teléfonos de Contacto</h3>
              <p className="add-volunteer-form__section-description">
                El teléfono principal es obligatorio, el secundario es opcional
              </p>
            </div>

            <div className="add-volunteer-form__row">
              <form.Field name="phone_primary">
                {(field) => (
                  <PhoneInputField
                    label="Teléfono Principal"
                    required
                    value={field.state.value as string}
                    onChange={(val) => { field.handleChange(val as any); if (fieldErrors.phone_primary) setFieldErrors(prev => ({ ...prev, phone_primary: '' })); }}
                    error={fieldErrors.phone_primary || (field.state.value && !validatePhone(field.state.value as string) ? 'El número de teléfono no es válido.' : undefined)}
                    variant="add"
                  />
                )}
              </form.Field>

              <form.Field name="phone_secondary">
                {(field) => (
                  <PhoneInputField
                    label="Teléfono Secundario"
                    value={field.state.value as string}
                    onChange={(val) => field.handleChange(val as any)}
                    error={
                      field.state.value && !validatePhone(field.state.value as string)
                        ? 'El número de teléfono no es válido'
                        : undefined
                    }
                    variant="add"
                  />
                )}
              </form.Field>
            </div>
          </div>

          {apiError && <p className="add-volunteer-form__error-text">{apiError}</p>}

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