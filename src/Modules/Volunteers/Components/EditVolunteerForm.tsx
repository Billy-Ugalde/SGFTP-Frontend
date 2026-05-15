import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useUpdateVolunteer, transformUpdateFormDataToDto } from '../Services/VolunteersServices';
import type { Volunteer, VolunteerUpdateData } from '../Types';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { copyUpdate } from '../../Shared/utils/confirmationCopy';
import '../Styles/EditVolunteerForm.css';
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface EditVolunteerFormProps {
  volunteer: Volunteer;
  onSuccess: () => void;
}

const EditVolunteerForm = ({ volunteer, onSuccess }: EditVolunteerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const updateVolunteer = useUpdateVolunteer(volunteer.id_volunteer!);

  const form = useForm({
    defaultValues: {
      first_name: volunteer.person?.first_name || '',
      second_name: volunteer.person?.second_name || '',
      first_lastname: volunteer.person?.first_lastname || '',
      second_lastname: volunteer.person?.second_lastname || '',
      email: volunteer.person?.email || '',
      phone_primary: volunteer.person?.phone_primary || '',
      phone_secondary: volunteer.person?.phone_secondary || '',
      is_active: volunteer.is_active
    } satisfies VolunteerUpdateData,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setApiError('');
      try {
        if (!volunteer.id_volunteer) {
          throw new Error('No se puede actualizar el voluntario: ID no válido.');
        }

        const dto = transformUpdateFormDataToDto(value);
        await updateVolunteer.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        if (error?.response?.status === 409) {
          setApiError('Ya existe un voluntario con el mismo correo electrónico.');
        } else if (error?.response?.status === 400) {
          const messages = error?.response?.data?.message;
          setApiError(Array.isArray(messages) ? messages.join(', ') : 'Los datos enviados son inválidos. Por favor revisa todos los campos.');
        } else if (error?.response?.status === 500) {
          setApiError('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setApiError('Error al actualizar el voluntario. Por favor intenta de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const validateForm = (): boolean => {
    const values = form.state.values;
    const errors: Record<string, string> = {};

    if (!values.first_name?.trim()) errors.first_name = 'El primer nombre es obligatorio.';
    if (!values.first_lastname?.trim()) errors.first_lastname = 'El primer apellido es obligatorio.';
    if (!values.second_lastname?.trim()) errors.second_lastname = 'El segundo apellido es obligatorio.';
    if (!values.phone_primary) errors.phone_primary = 'El teléfono principal es obligatorio.';
    else if (!validatePhone(values.phone_primary as string)) errors.phone_primary = 'El teléfono principal no es válido.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    form.handleSubmit();
  };


  const renderField = (name: keyof VolunteerUpdateData, config: any = {}) => {
    const {
      label,
      required = false,
      type = 'text',
      placeholder = '',
      withIcon = false,
      icon = null,
      disabled = false,
      readOnly = false,
      initialValue = undefined,
      maxLength,
      minLength,
      showCharacterCount = false,
      validators = {},
    } = config;

    return (
      <form.Field
        name={name as any}
        validators={validators}
      >
        {(field) => {
          const value = field.state.value;
          let currentLength = 0;

          if (typeof value === 'string') currentLength = value.length;
          else if (Array.isArray(value)) currentLength = value.length;
          else if (typeof value === 'number') currentLength = value.toString().length;
          else if (value === null || value === undefined) currentLength = 0;

          const currentValue = typeof value === 'string' && value ? (value as string).trim() : '';

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
                showRequiredText = !currentValue;
              }
            } else {
              if (minLength) {
                showRequiredText = currentLength < minLength;
              } else {
                showRequiredText = !currentValue;
              }
            }
          }

          return (
            <div className="edit-volunteer-form__field">
              <label className="edit-volunteer-form__label">
                <span className="edit-volunteer-form__label-text">{label}</span>
                {showInitialEditable && !showRequiredText && (
                  <span className="edit-volunteer-form__initial-editable">valor inicial editable</span>
                )}
                {(showRequiredText || (required && initialValue === undefined)) && (
                  <span className="edit-volunteer-form__required">*</span>
                )}
              </label>

              {withIcon ? (
                <div className="edit-volunteer-form__input-wrapper">
                  <div className="edit-volunteer-form__icon">{icon}</div>
                  <input
                    type={type}
                    name={name as string}
                    value={typeof value === 'string' ? value : ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                    className="edit-volunteer-form__input edit-volunteer-form__input--with-icon"
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    minLength={minLength}
                  />
                </div>
              ) : (
                <input
                  type={type}
                  name={name as string}
                  value={typeof value === 'string' ? value : ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                  className="edit-volunteer-form__input"
                  placeholder={placeholder}
                  required={required}
                  disabled={disabled}
                  readOnly={readOnly}
                  maxLength={maxLength}
                  minLength={minLength}
                />
              )}

              {/* Contador de caracteres */}
              {showCharacterCount && maxLength && (
                <div className="edit-volunteer-form__field-info">
                  {minLength && <div className="edit-volunteer-form__min-length">Mínimo: {minLength} caracteres</div>}
                  <div className={`edit-volunteer-form__character-count ${(currentLength > maxLength * 0.9) ? 'edit-volunteer-form__character-count--warning' : ''} ${(currentLength === maxLength) ? 'edit-volunteer-form__character-count--error' : ''}`}>
                    {currentLength}/{maxLength} caracteres
                  </div>
                </div>
              )}

              {/* Mensajes de error del validador */}
              {field.state.meta.errors && (
                <span className="edit-volunteer-form__error-text">
                  {field.state.meta.errors[0]}
                </span>
              )}
              {fieldErrors[name as string] && (
                <span className="edit-volunteer-form__error-text">{fieldErrors[name as string]}</span>
              )}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="edit-volunteer-form">
      <div className="edit-volunteer-form__header">
        <div className="edit-volunteer-form__header-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-volunteer-form__header-title">Información del Voluntario</h3>
          <p className="edit-volunteer-form__header-description">
            Actualiza los datos personales del voluntario
          </p>
        </div>
        <p className="edit-volunteer-form__required-legend"><span className="edit-volunteer-form__required">*</span> Campo obligatorio</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-volunteer-form__form" noValidate>
        {apiError && <p className="edit-volunteer-form__error-text">{apiError}</p>}

        <div className="edit-volunteer-form__fields">
          {renderField('first_name', {
            label: 'Primer Nombre',
            required: true,
            placeholder: 'Ingrese el primer nombre',
            maxLength: 50,
            showCharacterCount: true,
            initialValue: volunteer.person?.first_name
          })}

          {renderField('second_name', {
            label: 'Segundo Nombre',
            placeholder: 'Ingrese el segundo nombre',
            maxLength: 50,
            showCharacterCount: true,
            initialValue: volunteer.person?.second_name
          })}

          {renderField('first_lastname', {
            label: 'Primer Apellido',
            required: true,
            placeholder: 'Ingrese el primer apellido',
            maxLength: 50,
            showCharacterCount: true,
            initialValue: volunteer.person?.first_lastname
          })}

          {renderField('second_lastname', {
            label: 'Segundo Apellido',
            required: true,
            placeholder: 'Ingrese el segundo apellido',
            maxLength: 50,
            showCharacterCount: true,
            initialValue: volunteer.person?.second_lastname
          })}

          {renderField('email', {
            validators: {
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'El email es obligatorio';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email inválido';
                if (value.length > 254) return 'Máximo 254 caracteres permitidos';
                return undefined;
              },
            },
            label: 'Correo Electrónico',
            required: true,
            type: 'email',
            placeholder: 'correo@ejemplo.com',
            minLength: 6,
            maxLength: 254,
            showCharacterCount: true,
            withIcon: true,
            readOnly: true,
            disabled: true,
            initialValue: volunteer.person?.email,
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )
          })}

          <div className="edit-volunteer-form__section">
            <h3 className="edit-volunteer-form__section-title">Teléfonos de Contacto</h3>
            <p className="edit-volunteer-form__section-description">
              El teléfono principal es obligatorio, el secundario es opcional
            </p>
          </div>

          <form.Field name="phone_primary">
            {(field) => (
              <PhoneInputField
                label="Teléfono Principal"
                required
                value={field.state.value as string}
                onChange={(val) => { field.handleChange(val as any); if (fieldErrors.phone_primary) setFieldErrors(prev => ({ ...prev, phone_primary: '' })); }}
                error={fieldErrors.phone_primary || (field.state.value && !validatePhone(field.state.value as string) ? 'El número de teléfono no es válido.' : undefined)}
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
              />
            )}
          </form.Field>

          {/* Status */}
          <form.Field name="is_active">
            {(field) => (
              <div className="edit-volunteer-form__field edit-volunteer-form__field--checkbox">
                <label className="edit-volunteer-form__checkbox-label">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="edit-volunteer-form__checkbox"
                  />
                  <span>Voluntario activo</span>
                </label>
              </div>
            )}
          </form.Field>
        </div>

        {/* Actions */}
        <div className="edit-volunteer-form__actions">
          <button
            type="button"
            onClick={onSuccess}
            className="edit-volunteer-form__cancel-btn"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="edit-volunteer-form__submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="edit-volunteer-form__loading-spinner"></div>
                Actualizando...
              </>
            ) : (
              'Actualizar Voluntario'
            )}
          </button>
        </div>
      </form>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        {...copyUpdate({
          resourcePhrase: 'el voluntario',
          name: `${volunteer.person?.first_name} ${volunteer.person?.first_lastname}`.trim(),
        })}
        cancelText="Cancelar"
        type="info"
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditVolunteerForm;