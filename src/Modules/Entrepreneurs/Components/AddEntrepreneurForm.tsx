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
  const isAdmin =
    user?.roles?.some((r: string) =>
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
        { number: '', type: 'personal', is_primary: true },
        { number: '', type: 'business', is_primary: false },
      ],
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
    } satisfies EntrepreneurFormData,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage('');

      // Validar imágenes obligatorias
      if (
        !((value.url_1 as any) instanceof File) ||
        !((value.url_2 as any) instanceof File) ||
        !((value.url_3 as any) instanceof File)
      ) {
        alert('Debes subir las 3 imágenes obligatoriamente.');
        setIsLoading(false);
        return;
      }

      try {
        const dto = transformFormDataToDto(value);
        await addEntrepreneur.mutateAsync(dto);
        onSuccess();
      } catch (error: any) {
        console.error('Error al registrar emprendedor:', error);
        if (error?.response?.status === 409) {
          const conflictMessage = getConflictErrorMessage(error.response.data);
          setErrorMessage(conflictMessage);
        } else if (error?.response?.status === 400) {
          setErrorMessage(
            'Los datos enviados son inválidos. Por favor revisa todos los campos de ambos pasos del formulario.'
          );
        } else if (error?.response?.status === 500) {
          setErrorMessage(
            'Error interno del servidor. Por favor intenta más tarde.'
          );
        } else {
          setErrorMessage(
            'Error al registrar el emprendedor. Por favor intenta de nuevo.'
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

  const validateStep1 = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate = [
      { name: 'first_name', value: values.first_name?.trim(), elementName: 'first_name' },
      { name: 'first_lastname', value: values.first_lastname?.trim(), elementName: 'first_lastname' },
      { name: 'second_lastname', value: values.second_lastname?.trim(), elementName: 'second_lastname' },
      {
        name: 'email', value: values.email?.trim(), elementName: 'email',
        validate: (val: string) => !val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      },
      { name: 'phones[0].number', value: values.phones[0]?.number?.trim(), elementName: 'phones.0.number' },
      {
        name: 'experience', value: values.experience, elementName: 'experience',
        validate: (val: any) => val === null || val < 0 || val > 100
      },
    ];

    for (const field of fieldsToValidate) {
      const invalid = field.validate ? field.validate(field.value as any) : !field.value;
      if (invalid) {
        isValid = false;
        setErrorMessage('Por favor completa todos los campos obligatorios correctamente.');
        focusField(field.elementName);
        break;
      }
    }

    return isValid;
  };

  // -----------------------
  // Validar Step 2 (Emprendimiento)
  // -----------------------
  const validateStep2 = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate = [
      { name: 'entrepreneurship_name', value: values.entrepreneurship_name?.trim(), elementName: 'entrepreneurship_name' },
      {
        name: 'description', value: values.description?.trim(), elementName: 'description',
        validate: (val: string) => !val || val.length < 80
      },
      { name: 'location', value: values.location?.trim(), elementName: 'location' },
      { name: 'category', value: values.category, elementName: 'category' },
      { name: 'approach', value: values.approach, elementName: 'approach' },
      // Imágenes obligatorias
      {
        name: 'url_1', value: values.url_1, elementName: 'url_1',
        validate: (val: File | undefined) => !(val instanceof File)
      },
      {
        name: 'url_2', value: values.url_2, elementName: 'url_2',
        validate: (val: File | undefined) => !(val instanceof File)
      },
      {
        name: 'url_3', value: values.url_3, elementName: 'url_3',
        validate: (val: File | undefined) => !(val instanceof File)
      },
    ];

    for (const field of fieldsToValidate) {
      const invalid = field.validate ? field.validate(field.value as any) : !field.value;
      if (invalid) {
        isValid = false;
        setErrorMessage('Por favor completa todos los campos obligatorios correctamente.');
        focusField(field.elementName);
        break;
      }
    }

    return isValid;
  };

  // -----------------------
  // Helper para enfocar campo
  // -----------------------
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

  const handleNextStep = () => {
    setErrorMessage('');
     if (validateStep1()) setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrorMessage('');
  };

  const handleSubmit = () => {
    setErrorMessage('');
     if (validateStep2()) {
    form.handleSubmit();
  }
  };

  // -----------------------
  // renderField corregido
  // -----------------------
  const renderField = (
    name: keyof EntrepreneurFormData | 'phones[0].number' | 'phones[1].number',
    config: any = {}
  ) => {
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
      showCharacterCount = false,
      accept,
    } = config;

    return (
      <form.Field name={name as any}>
        {(field) => {
          const value: any = field.state.value;
          const currentLength =
            (typeof value === 'string' || Array.isArray(value)) ? value.length : 0;

          // ---------------------------
          // ARCHIVOS (imágenes)
          // ---------------------------
          if (type === 'file') {
            return (
              <div className="add-entrepreneur-form__file-field">
                <label className="add-entrepreneur-form__label">
                  {label}{' '}
                  {required && (
                    <span className="add-entrepreneur-form__required">
                      campo obligatorio
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  accept={accept || 'image/*'}
                  name={name as string}
                  required={required}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      field.handleChange(e.target.files[0] as any);
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

          // ---------------------------
          // TEXTAREA
          // ---------------------------
          if (type === 'textarea') {
            return (
              <div>
                <label className="add-entrepreneur-form__label">
                  {label}{' '}
                  {required && (
                    <span className="add-entrepreneur-form__required">
                      campo obligatorio
                    </span>
                  )}
                </label>
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
              </div>
            );
          }

          // ---------------------------
          // SELECT
          // ---------------------------
          if (type === 'select') {
            return (
              <div>
                <label className="add-entrepreneur-form__label">
                  {label}{' '}
                  {required && (
                    <span className="add-entrepreneur-form__required">
                      campo obligatorio
                    </span>
                  )}
                </label>
                <select
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="add-entrepreneur-form__input add-entrepreneur-form__input--select"
                  required={required}
                >
                  {options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // ---------------------------
          // INPUT GENÉRICO
          // ---------------------------
          return (
            <div>
              <label className="add-entrepreneur-form__label">
                {label}{' '}
                {required && (
                  <span className="add-entrepreneur-form__required">
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
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="add-entrepreneur-form">
      {errorMessage && (
        <div className="add-entrepreneur-form__error">
          <p>{errorMessage}</p>
        </div>
      )}

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
