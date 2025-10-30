import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useUpdateVolunteer, transformUpdateFormDataToDto } from '../Services/VolunteersServices';
import type { Volunteer, VolunteerUpdateData } from '../Types';
import ConfirmationModal from '../../Projects/Components/ConfirmationModal';
import '../Styles/EditVolunteerForm.css';

interface EditVolunteerFormProps {
  volunteer: Volunteer;
  onSuccess: () => void;
}

const EditVolunteerForm = ({ volunteer, onSuccess }: EditVolunteerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const updateVolunteer = useUpdateVolunteer(volunteer.id_volunteer!);

  
  const primaryPhone = volunteer.person?.phones && volunteer.person.phones.length > 0 
    ? volunteer.person.phones[0] 
    : { number: '', type: 'personal' as const, is_primary: true };

  const form = useForm({
    defaultValues: {
      first_name: volunteer.person?.first_name || '',
      second_name: volunteer.person?.second_name || '',
      first_lastname: volunteer.person?.first_lastname || '',
      second_lastname: volunteer.person?.second_lastname || '',
      email: volunteer.person?.email || '',
      phone: primaryPhone.number || '',
      is_active: volunteer.is_active
    } satisfies Omit<VolunteerUpdateData, 'phones'> & { phone: string },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        if (!volunteer.id_volunteer) {
          throw new Error('No se puede actualizar el voluntario: ID no válido.');
        }

        
        const dto = transformUpdateFormDataToDto({
          ...value,
          phones: value.phone
        });
        await updateVolunteer.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        if (error?.response?.status === 409) {
          setErrorMessage('Ya existe un voluntario con el mismo correo electrónico.');
        } else if (error?.response?.status === 400) {
          const messages = error?.response?.data?.message;
          if (Array.isArray(messages)) {
            setErrorMessage(`Errores de validación:\n${messages.join('\n')}`);
          } else {
            setErrorMessage('Los datos enviados son inválidos. Por favor revisa todos los campos.');
          }
        } else if (error?.response?.status === 500) {
          setErrorMessage('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setErrorMessage('Error al actualizar el voluntario. Por favor intenta de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const validateForm = (): boolean => {
    const values = form.state.values;
    let isValid = true;

   
    if (!values.first_name?.trim()) {
      setErrorMessage('El primer nombre es obligatorio.');
      focusField('first_name');
      return false;
    }

    if (!values.first_lastname?.trim()) {
      setErrorMessage('El primer apellido es obligatorio.');
      focusField('first_lastname');
      return false;
    }

    if (!values.second_lastname?.trim()) {
      setErrorMessage('El segundo apellido es obligatorio.');
      focusField('second_lastname');
      return false;
    }

    if (!values.email?.trim()) {
      setErrorMessage('El correo electrónico es obligatorio.');
      focusField('email');
      return false;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      setErrorMessage('El correo electrónico no tiene un formato válido.');
      focusField('email');
      return false;
    }

    
    if (!values.phone?.trim()) {
      setErrorMessage('El teléfono es obligatorio.');
      focusField('phone');
      return false;
    }

    return isValid;
  };

  const focusField = (name: string) => {
    setTimeout(() => {
      const element = document.querySelector(`[name="${name}"]`);
      if (element) {
        (element as HTMLElement).focus();
        (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    form.handleSubmit();
  };

  
  const renderField = (name: keyof (Omit<VolunteerUpdateData, 'phones'> & { phone: string }), config: any = {}) => {
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
                  <span className="edit-volunteer-form__required">campo obligatorio</span>
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
                    onChange={(e) => field.handleChange(e.target.value as any)}
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
                  onChange={(e) => field.handleChange(e.target.value as any)}
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
      </div>

      <form onSubmit={handleSubmit} className="edit-volunteer-form__form">
        {/* Error message */}
        {errorMessage && (
          <div className="edit-volunteer-form__error">
            <div className="edit-volunteer-form__error-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="edit-volunteer-form__error-text-global" style={{ whiteSpace: 'pre-line' }}>
              {errorMessage}
            </p>
          </div>
        )}

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

          {/* SOLO UN TELÉFONO - EL PRIMERO */}
          {renderField('phone', {
            validators: {
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'El teléfono es obligatorio';
                if (!/^[\+]?[\d\s\-\(\)]+$/.test(value)) return 'Solo números y el signo + son permitidos';
                if (value.length > 20) return 'Máximo 20 caracteres permitidos';
                return undefined;
              },
            },
            label: 'Teléfono',
            required: true,
            type: 'tel',
            placeholder: '+506 8888-8888',
            minLength: 8,
            maxLength: 20,
            showCharacterCount: true,
            withIcon: true,
            initialValue: primaryPhone.number,
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            )
          })}

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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSubmit}
          title="Confirmar actualización"
          message={`¿Está seguro de que desea actualizar la información del voluntario "${volunteer.person?.first_name} ${volunteer.person?.first_lastname}"?`}
          confirmText="Sí, actualizar"
          cancelText="Cancelar"
          type="info"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default EditVolunteerForm;