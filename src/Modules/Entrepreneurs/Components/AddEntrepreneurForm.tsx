import { useState, useRef, useEffect } from 'react';
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
  const formContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAdmin =
    user?.roles?.some((r: string) =>
      ['super_admin', 'general_admin', 'fair_admin'].includes(r)
    ) ?? false;

  const addEntrepreneur = useAddEntrepreneur(isAdmin);

  useEffect(() => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

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
        if (!field.value || !(field.value instanceof File)) {
          isValid = false;
          setErrorMessage(`El campo "${field.label}" es obligatorio. Debes subir una imagen.`);
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
      onFileChange,
    } = config;

    return (
      <form.Field name={name as any}>
        {(field) => {
          const value: any = field.state.value;
          const currentLength =
            (typeof value === 'string' || Array.isArray(value)) ? value.length : 0;
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
                      const file = e.target.files[0];
                      field.handleChange(file as any);
                      if (onFileChange) {
                        onFileChange(file, name as string);
                      }
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
    <div className="add-entrepreneur-form" ref={formContainerRef}>
      {/* Progress Steps */}
      <div className="add-entrepreneur-form__progress">
        <div className="add-entrepreneur-form__progress-bar">
          <div
            className="add-entrepreneur-form__progress-fill"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          ></div>
        </div>
        <div className="add-entrepreneur-form__steps">
          <div className={`add-entrepreneur-form__step ${currentStep >= 1 ? 'add-entrepreneur-form__step--active' : ''}`}>
            <div className="add-entrepreneur-form__step-number">1</div>
            <div className="add-entrepreneur-form__step-label">Datos Personales</div>
          </div>
          <div className={`add-entrepreneur-form__step ${currentStep >= 2 ? 'add-entrepreneur-form__step--active' : ''}`}>
            <div className="add-entrepreneur-form__step-number">2</div>
            <div className="add-entrepreneur-form__step-label">Emprendimiento</div>
          </div>
        </div>
      </div>

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
            errorMessage={errorMessage}
          />
        ) : (
          <EntrepreneurshipDataStep
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

export default AddEntrepreneurForm;
