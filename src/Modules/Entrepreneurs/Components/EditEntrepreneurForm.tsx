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
  } catch (error) {
    console.error('Error al actualizar emprendedor:', error);
    alert('Error al actualizar el emprendedor. Por favor intenta de nuevo.');
  } finally {
    setIsLoading(false);
  }
},
  });

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    form.handleSubmit();
  };

  const handleFileChange = (fieldName: 'url_1' | 'url_2' | 'url_3', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const simulatedUrl = `https://example.com/uploads/${file.name}`;
      form.setFieldValue(fieldName, simulatedUrl);
    }
  };

  // Función auxiliar para representar campos
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
      helpText
    } = config;

    return (
      <form.Field
        name={name as any}
        validators={validators}
      >
        {(field) => (
          <div className={config.type === 'url' ? 'edit-entrepreneur-form__file-field' : ''}>
            <label className="edit-entrepreneur-form__label">
              {label} {required && <span className="edit-entrepreneur-form__required">*</span>}
            </label>

            {type === 'textarea' ? (
              <textarea
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as any)}
                className="edit-entrepreneur-form__input edit-entrepreneur-form__input--textarea"
                placeholder={placeholder}
              />
            ) : type === 'select' ? (
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as any)}
                className="edit-entrepreneur-form__input edit-entrepreneur-form__input--select"
              >
                {options.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : type === 'radio' ? (
              <div className="edit-entrepreneur-form__radio-group">
                {options.map((option: { value: string; label: string }) => (
                  <div key={option.value} className="edit-entrepreneur-form__radio">
                    <input
                      type="radio"
                      id={option.value}
                      name={field.name}
                      value={option.value}
                      checked={field.state.value === option.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                      className="edit-entrepreneur-form__radio-input"
                    />
                    <label htmlFor={option.value} className="edit-entrepreneur-form__radio-label">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            ) : withIcon ? (
              <div className="edit-entrepreneur-form__input-wrapper">
                <div className="edit-entrepreneur-form__icon">
                  {icon}
                </div>
                <input
                  type={type}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value;
                    field.handleChange(value as any);
                  }}
                  className="edit-entrepreneur-form__input edit-entrepreneur-form__input--with-icon"
                  placeholder={placeholder}
                  min={min}
                  max={max}
                />
              </div>
            ) : (
              <input
                type={type}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const value = type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value;
                  field.handleChange(value as any);
                }}
                className="edit-entrepreneur-form__input"
                placeholder={placeholder}
                min={min}
                max={max}
              />
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
        )}
      </form.Field>
    );
  };

  return (
    <div className="edit-entrepreneur-form">
      {/* Progress indicator */}
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