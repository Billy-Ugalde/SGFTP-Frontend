import { useState, useRef } from 'react';
import { useAddFair } from '../Services/FairsServices';
import StandsSelector from './StandsSelector';
import ConfirmationModal from './ConfirmationModal';
import FormDropdown, { type FormDropdownOption } from '../../Entrepreneurs/Components/FormDropdown';
import '../Styles/AddFairForm.css';

const STATUS_OPTIONS: FormDropdownOption[] = [
  {
    value: 'true',
    label: 'Activa',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 'false',
    label: 'Inactiva',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const FAIR_TYPE_OPTIONS: FormDropdownOption[] = [
  {
    value: 'interna',
    label: 'Interna',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    value: 'externa',
    label: 'Externa',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface FormData {
  name: string;
  description: string;
  conditions: string;
  location: string;
  typeFair: string;
  stand_capacity: number;
  status: boolean;
  date: string;
  hour: string;
  minute: string;
}

const getMinTimeRestriction = (selectedDate: string) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  if (selectedDate === today) {
    const bufferTime = new Date(now.getTime() + 5 * 60000);
    return {
      minHour: bufferTime.getHours(),
      minMinute: bufferTime.getMinutes()
    };
  }

  return null;
};

const generateHourOptions = (minHour?: number) => {
  const options = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const disabled = minHour !== undefined && hour < minHour;
    
    options.push({
      value: hourStr,
      label: hourStr,
      disabled
    });
  }
  
  return options;
};

const generateMinuteOptions = (selectedHour: string, minHour?: number, minMinute?: number) => {
  const options = [];
  const hourNum = parseInt(selectedHour);
  
  for (let minute = 0; minute < 60; minute++) {
    const minuteStr = minute.toString().padStart(2, '0');
    let disabled = false;
    
    if (minHour !== undefined && minMinute !== undefined) {
      if (hourNum === minHour && minute < minMinute) {
        disabled = true;
      }
    }
    
    options.push({
      value: minuteStr,
      label: minuteStr,
      disabled
    });
  }
  
  return options;
};

const getCharacterCountClass = (currentLength: number, maxLength: number) => {
  if (currentLength >= maxLength) {
    return 'add-fair-form__character-count--error';
  } else if (currentLength >= maxLength - 10) {
    return 'add-fair-form__character-count--warning';
  }
  return '';
};

const AddFairForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    conditions: '',
    location: '',
    typeFair: 'interna',
    stand_capacity: 10,
    status: true,
    date: '',
    hour: '09',
    minute: '00'
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touchedInitial, setTouchedInitial] = useState({ typeFair: false, status: false, stand_capacity: false });
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const conditionsRef = useRef<HTMLTextAreaElement>(null);
  const locationRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLSelectElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const addFair = useAddFair();

  const timeRestriction = getMinTimeRestriction(formData.date);
  const hourOptions = generateHourOptions(timeRestriction?.minHour);
  const minuteOptions = generateMinuteOptions(formData.hour, timeRestriction?.minHour, timeRestriction?.minMinute);
  const isToday = formData.date === new Date().toLocaleDateString('en-CA');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'typeFair' || name === 'status') setTouchedInitial(prev => ({ ...prev, [name]: true }));

    if (name === 'date') {
      const today = new Date().toLocaleDateString('en-CA');
      const restriction = getMinTimeRestriction(value);
      
      let newHour = '09';
      let newMinute = '00';
      
  
      if (value === today && restriction) {
        newHour = restriction.minHour.toString().padStart(2, '0');
        newMinute = restriction.minMinute.toString().padStart(2, '0');
      }
      
      setFormData(prev => ({
        ...prev,
        date: value,
        hour: newHour,
        minute: newMinute
      }));
      return;
    }
    
    if ((name === 'hour' || name === 'minute') && timeRestriction) {
      const selectedHour = name === 'hour' ? parseInt(value) : parseInt(formData.hour);
      const selectedMinute = name === 'minute' ? parseInt(value) : parseInt(formData.minute);
      
      if (selectedHour < timeRestriction.minHour ||
          (selectedHour === timeRestriction.minHour && selectedMinute < timeRestriction.minMinute)) {
        setFieldErrors(prev => ({ ...prev, time: 'No puedes seleccionar una hora que ya pasó para el día de hoy.' }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
              name === 'status' ? value === 'true' : 
              value
    }));
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim())
      errors.name = 'El nombre de la feria es obligatorio.';
    else if (formData.name.trim().length < 5)
      errors.name = 'El nombre de la feria debe tener al menos 5 caracteres.';

    if (!formData.description.trim())
      errors.description = 'La descripción es obligatoria.';
    else if (formData.description.trim().length < 10)
      errors.description = 'La descripción debe tener al menos 10 caracteres.';

    if (!formData.conditions.trim())
      errors.conditions = 'Las condiciones son obligatorias.';
    else if (formData.conditions.trim().length < 15)
      errors.conditions = 'Las condiciones deben tener al menos 15 caracteres.';

    if (!formData.location.trim())
      errors.location = 'La ubicación es obligatoria.';
    else if (formData.location.trim().length < 10)
      errors.location = 'La ubicación debe tener al menos 10 caracteres.';

    setFieldErrors(errors);
    if (errors.name) nameRef.current?.focus();
    else if (errors.description) descriptionRef.current?.focus();
    else if (errors.conditions) conditionsRef.current?.focus();
    else if (errors.location) locationRef.current?.focus();
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.date.trim())
      errors.date = 'La fecha es obligatoria.';
    if (!formData.hour.trim() || !formData.minute.trim())
      errors.time = 'Debe seleccionar una hora para la feria.';
    setFieldErrors(errors);
    if (errors.date) setTimeout(() => dateInputRef.current?.focus(), 0);
    else if (errors.time) setTimeout(() => hourRef.current?.focus(), 0);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setFieldErrors({});
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    setFieldErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setApiError('');

    try {
      const timeString = `${formData.hour}:${formData.minute}`;
      const dateTimeString = `${formData.date} ${timeString}`;

      const submitData = {
        name: formData.name,
        description: formData.description,
        conditions: formData.conditions,
        location: formData.location,
        typeFair: formData.typeFair,
        stand_capacity: formData.stand_capacity,
        status: formData.status,
        date: dateTimeString 
      };
      
      await addFair.mutateAsync(submitData);
      setShowConfirmModal(false);
      onSuccess();
    } catch (err: any) {
      let errorMessage = 'Error al agregar la feria. Por favor intenta de nuevo.';
      
      if (err?.response?.status === 409) {
        errorMessage = `Ya existe una feria con el nombre "${formData.name}" programada para la fecha ${formData.date}. Por favor elige un nombre diferente o cambia la fecha.`;
      } else if (err?.response?.status === 400) {
        errorMessage = err?.response?.data?.message || 'Los datos enviados no son válidos. Verifica la información e intenta nuevamente.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setApiError(errorMessage);
      setShowConfirmModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="add-fair-form__step-indicator">
      <div className="add-fair-form__steps">
        <div className={`add-fair-form__step ${currentStep >= 1 ? 'add-fair-form__step--active' : ''}`}>
          <div className="add-fair-form__step-number">1</div>
          <div className="add-fair-form__step-label">Información Básica</div>
        </div>
        <div className="add-fair-form__step-divider"></div>
        <div className={`add-fair-form__step ${currentStep >= 2 ? 'add-fair-form__step--active' : ''}`}>
          <div className="add-fair-form__step-number">2</div>
          <div className="add-fair-form__step-label">Configuración</div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="add-fair-form__section">
      <div className="add-fair-form__step-header">
        <div className="add-fair-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="add-fair-form__step-title">Información Básica</h3>
          <p className="add-fair-form__step-description">Completa los datos generales de la feria</p>
        </div>
        <p className="add-fair-form__required-legend"><span className="add-fair-form__required">*</span> Campo obligatorio</p>
      </div>

      {/* Nombre de la Feria */}
      <div>
        <label htmlFor="name" className="add-fair-form__label">
          Nombre de la Feria{' '}
          {formData.name.trim().length < 5 && <span className="add-fair-form__required">*</span>}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={50}
          ref={nameRef}
          value={formData.name}
          onChange={handleChange}
          placeholder="Ingresa el nombre de la feria"
          className="add-fair-form__input"
        />
        {fieldErrors.name && <span className="add-fair-form__error-text">{fieldErrors.name}</span>}
        <div className="add-fair-form__field-info">
          <div className="add-fair-form__min-length">Mínimo: 5 caracteres</div>
          <div className={`add-fair-form__character-count ${getCharacterCountClass(formData.name.length, 50)}`}>
            {formData.name.length}/50 caracteres
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="add-fair-form__label">
          Descripción{' '}
          {formData.description.trim().length < 10 && <span className="add-fair-form__required">*</span>}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={100}
          ref={descriptionRef}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe la feria, su propósito y características principales..."
          className="add-fair-form__input add-fair-form__textarea"
        />
        {fieldErrors.description && <span className="add-fair-form__error-text">{fieldErrors.description}</span>}
        <div className="add-fair-form__field-info">
          <div className="add-fair-form__min-length">Mínimo: 10 caracteres</div>
          <div className={`add-fair-form__character-count ${getCharacterCountClass(formData.description.length, 100)}`}>
            {formData.description.length}/100 caracteres
          </div>
        </div>
      </div>

      {/* Condiciones */}
      <div>
        <label htmlFor="conditions" className="add-fair-form__label">
          Condiciones{' '}
          {formData.conditions.trim().length < 15 && <span className="add-fair-form__required">*</span>}
        </label>
        <textarea
          id="conditions"
          name="conditions"
          rows={6}
          maxLength={450}
          ref={conditionsRef}
          value={formData.conditions}
          onChange={handleChange}
          placeholder="Especifica las condiciones y requisitos para participar en la feria..."
          className="add-fair-form__input add-fair-form__textarea"
        />
        {fieldErrors.conditions && <span className="add-fair-form__error-text">{fieldErrors.conditions}</span>}
        <div className="add-fair-form__field-info">
          <div className="add-fair-form__min-length">Mínimo: 15 caracteres</div>
          <div className={`add-fair-form__character-count ${getCharacterCountClass(formData.conditions.length, 450)}`}>
            {formData.conditions.length}/450 caracteres
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label htmlFor="location" className="add-fair-form__label">
          Ubicación{' '}
          {formData.location.trim().length < 10 && <span className="add-fair-form__required">*</span>}
        </label>
        <textarea
          id="location"
          name="location"
          rows={3}
          maxLength={150}
          ref={locationRef}
          value={formData.location}
          onChange={handleChange}
          placeholder="Ingresa la ubicación de la feria"
          className="add-fair-form__input add-fair-form__textarea"
        />
        {fieldErrors.location && <span className="add-fair-form__error-text">{fieldErrors.location}</span>}
        <div className="add-fair-form__field-info">
          <div className="add-fair-form__min-length">Mínimo: 10 caracteres</div>
          <div className={`add-fair-form__character-count ${getCharacterCountClass(formData.location.length, 150)}`}>
            {formData.location.length}/150 caracteres
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="add-fair-form__section">
      <div className="add-fair-form__step-header">
        <div className="add-fair-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="add-fair-form__step-title">Configuración</h3>
          <p className="add-fair-form__step-description">Establece la fecha, tipo y capacidad de la feria</p>
        </div>
        <p className="add-fair-form__required-legend"><span className="add-fair-form__required">*</span> Campo obligatorio</p>
      </div>

      {/* Fecha y Hora de la Feria */}
      <div>
        <label className="add-fair-form__label">
          Fecha y Hora de la Feria{' '}
          {!formData.date && <span className="add-fair-form__required">*</span>}
        </label>
        
        <div className="add-fair-form__datetime-container">
          {/* Fecha */}
          <div className="add-fair-form__date-section">
            <label className="add-fair-form__sublabel">Fecha</label>
            <div className="add-fair-form__input-wrapper">
              <div className="add-fair-form__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="date"
                name="date"
                type="date"
                ref={dateInputRef}
                value={formData.date}
                onChange={handleChange}
                className="add-fair-form__input add-fair-form__input--with-icon"
                min={new Date().toLocaleDateString('en-CA')}
              />
            </div>
            {fieldErrors.date && <span className="add-fair-form__error-text">{fieldErrors.date}</span>}
          </div>
          
          {/* Hora */}
          <div className="add-fair-form__time-section">
            <label className="add-fair-form__sublabel">
              Hora
              {isToday && (
                <span className="add-fair-form__time-badge">
                  Limitado
                </span>
              )}
            </label>
            
            <div className="add-fair-form__time-selectors">
              {/* Selector de Hora */}
              <div className="add-fair-form__time-selector-wrapper">
                <div className="add-fair-form__input-wrapper">
                  <div className="add-fair-form__icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    id="hour"
                    name="hour"
                    ref={hourRef}
                    value={formData.hour}
                    onChange={handleChange}
                    className={`add-fair-form__input add-fair-form__input--with-icon add-fair-form__select add-fair-form__time-select ${
                      isToday ? 'add-fair-form__time-select--restricted' : ''
                    }`}
                  >
                    {hourOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="add-fair-form__time-separator">:</span>
              </div>

              {/* Selector de Minuto */}
              <div className="add-fair-form__time-selector-wrapper">
                <div className="add-fair-form__input-wrapper">
                  <select
                    id="minute"
                    name="minute"
                    value={formData.minute}
                    onChange={handleChange}
                    className={`add-fair-form__input add-fair-form__select add-fair-form__time-select ${
                      isToday ? 'add-fair-form__time-select--restricted' : ''
                    }`}
                  >
                    {minuteOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {fieldErrors.time && <span className="add-fair-form__error-text">{fieldErrors.time}</span>}

        {isToday && timeRestriction && (
          <div className="add-fair-form__time-notice">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>
              Horas disponibles desde las {timeRestriction.minHour.toString().padStart(2, '0')}:{timeRestriction.minMinute.toString().padStart(2, '0')}
            </span>
          </div>
        )}
        
        <p className="add-fair-form__help-text">
          Selecciona la fecha y hora en que se realizará la feria
        </p>
      </div>

      {/* Tipo de Feria */}
      <div>
        <FormDropdown
          variant="add"
          label="Tipo de Feria"
          value={formData.typeFair}
          onChange={(value) => {
            if (fieldErrors.typeFair) setFieldErrors(prev => ({ ...prev, typeFair: '' }));
            setTouchedInitial(prev => ({ ...prev, typeFair: true }));
            setFormData(prev => ({ ...prev, typeFair: value }));
          }}
          options={FAIR_TYPE_OPTIONS}
          showInitialEditable={!touchedInitial.typeFair}
        />
        <p className="add-fair-form__help-text">
          <strong>Interna:</strong> Feria organizada dentro de las instalaciones de la fundación<br />
          <strong>Externa:</strong> Feria organizada en ubicaciones externas o eventos públicos
        </p>
      </div>

      {/* Selector de Stands*/}
      <StandsSelector
        capacity={formData.stand_capacity}
        onCapacityChange={(newCapacity) =>
          setFormData(prev => ({ ...prev, stand_capacity: newCapacity }))
        }
        typeFair={formData.typeFair}
        isEditing={touchedInitial.stand_capacity}
        onCapacityInteract={() => setTouchedInitial(prev => ({ ...prev, stand_capacity: true }))}
      />

      {/* Estado */}
      <div>
        <FormDropdown
          variant="add"
          label="Estado Inicial"
          value={formData.status.toString()}
          onChange={(value) => {
            setTouchedInitial(prev => ({ ...prev, status: true }));
            setFormData(prev => ({ ...prev, status: value === 'true' }));
          }}
          options={STATUS_OPTIONS}
          showInitialEditable={!touchedInitial.status}
        />
        <p className="add-fair-form__help-text">
          Establece el estado de disponibilidad de la feria
        </p>
      </div>

      {/* Información del Estado */}
      <div className="add-fair-form__info-box">
        <svg className="add-fair-form__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="add-fair-form__info-title">
            Acerca del Estado de la Feria
          </p>
          <p className="add-fair-form__info-text">
            <strong>Activa:</strong> La feria es visible y acepta inscripciones de emprendedores<br />
            <strong>Inactiva:</strong> La feria está oculta y no acepta nuevas inscripciones
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="add-fair-form">
      <div className="add-fair-form__progress">
        <div className="add-fair-form__progress-bar">
          <div className="add-fair-form__progress-fill" style={{ width: `${(currentStep / 2) * 100}%` }}></div>
        </div>
        {renderStepIndicator()}
      </div>
      
      <form onSubmit={handleSubmit} className="add-fair-form__form" noValidate>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {apiError && (
          <div className="add-fair-form__error">
            <svg className="add-fair-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="add-fair-form__error-message">{apiError}</p>
          </div>
        )}

        {/* Botones de Envío */}
        <div className="add-fair-form__actions">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={onSuccess}
                className="add-fair-form__cancel-btn"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="add-fair-form__next-btn"
              >
                Siguiente: Configuración
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onSuccess}
                className="add-fair-form__cancel-btn"
              >
                Cancelar
              </button>
              <div className="add-fair-form__navigation-buttons">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="add-fair-form__back-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior: Información Básica
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`add-fair-form__submit-btn ${isLoading ? 'add-fair-form__submit-btn--loading' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="add-fair-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando Feria...
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Terminar formulario
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </form>

      {/* Modal de confirmación */}
      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Creación de Feria"
        message={`¿Estás seguro de que deseas crear la feria "${formData.name}"? Esta acción no se puede deshacer.`}
        confirmText="Crear Feria"
        cancelText="Cancelar"
        type="info"
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddFairForm;