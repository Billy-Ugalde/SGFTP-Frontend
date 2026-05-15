import { useState, useEffect, useRef } from 'react';
import { useUpdateFair, useFairEnrollmentsByFair } from '../Services/FairsServices';
import StandsSelector from './StandsSelector';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { copyUpdate } from '../../Shared/utils/confirmationCopy';
import FormDropdown, { type FormDropdownOption } from '../../Entrepreneurs/Components/FormDropdown';
import '../Styles/EditFairForm.css';

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

interface Fair {
  id_fair: number;
  name: string;
  description: string;
  conditions: string;
  location: string;
  typeFair: string;
  stand_capacity: number;
  status: boolean;
  date: string;
}

interface EditFairFormProps {
  fair: Fair;
  onSuccess: () => void;
}

const getMinTimeRestriction = (selectedDate: string) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  if (selectedDate === today) {
    const bufferTime = new Date(now.getTime() + 5 * 60000);
    return { minHour: bufferTime.getHours(), minMinute: bufferTime.getMinutes() };
  }
  return null;
};

const generateHourOptions = (minHour?: number) => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const disabled = minHour !== undefined && hour < minHour;
    options.push({ value: hourStr, label: hourStr, disabled });
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
      if (hourNum === minHour && minute < minMinute) disabled = true;
    }
    options.push({ value: minuteStr, label: minuteStr, disabled });
  }
  return options;
};

const getCharacterCountClass = (currentLength: number, maxLength: number) => {
  if (currentLength >= maxLength) return 'edit-fair-form__character-count--error';
  if (currentLength >= maxLength - 10) return 'edit-fair-form__character-count--warning';
  return '';
};

const EditFairForm = ({ fair, onSuccess }: EditFairFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditions: '',
    location: '',
    typeFair: '',
    stand_capacity: 0,
    date: '',
    hour: '',
    minute: '',
  });

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const updateFair = useUpdateFair();

  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const conditionsRef = useRef<HTMLTextAreaElement>(null);
  const locationRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLSelectElement>(null);

  const { data: fairEnrollments, isLoading: isLoadingEnrollments } = useFairEnrollmentsByFair(fair.id_fair);

  const activeEnrollments = fairEnrollments?.filter(enrollment =>
    enrollment.status === 'pending' || enrollment.status === 'approved'
  ) || [];
  const hasActiveEnrollments = activeEnrollments.length > 0;

  const enrollmentStats = fairEnrollments?.reduce((stats, enrollment) => {
    stats[enrollment.status]++;
    return stats;
  }, { pending: 0, approved: 0, rejected: 0 }) || { pending: 0, approved: 0, rejected: 0 };

  const formatDateForInput = (dateString: string): string => {
    try {
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-CA');
      }
      if (dateString.includes(' ')) {
        const datePart = dateString.split(' ')[0];
        return datePart || '';
      }
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
      return '';
    } catch { return ''; }
  };

  const formatTimeForInput = (dateString: string): { hour: string; minute: string } => {
    try {
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { hour: '09', minute: '00' };
        const timeString = date.toTimeString().slice(0, 5);
        const [hour, minute] = timeString.split(':');
        return { hour, minute };
      }
      if (dateString.includes(' ')) {
        const timePart = dateString.split(' ')[1];
        if (timePart) {
          const [hour, minute] = timePart.slice(0, 5).split(':');
          return { hour: hour?.padStart(2, '0') || '09', minute: minute?.padStart(2, '0') || '00' };
        }
      }
      return { hour: '09', minute: '00' };
    } catch { return { hour: '09', minute: '00' }; }
  };

  const timeRestriction = getMinTimeRestriction(formData.date);
  const hourOptions = generateHourOptions(timeRestriction?.minHour);
  const minuteOptions = generateMinuteOptions(formData.hour, timeRestriction?.minHour, timeRestriction?.minMinute);
  const isToday = formData.date === new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (fair) {
      const timeInfo = fair.date ? formatTimeForInput(fair.date) : { hour: '09', minute: '00' };
      setFormData({
        name: fair.name || '',
        description: fair.description || '',
        conditions: fair.conditions || '',
        location: fair.location || '',
        typeFair: fair.typeFair || 'interna',
        stand_capacity: fair.stand_capacity || 0,
        date: fair.date ? formatDateForInput(fair.date) : '',
        hour: timeInfo.hour,
        minute: timeInfo.minute,
      });
    }
  }, [fair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (hasActiveEnrollments && (name === 'typeFair' || name === 'stand_capacity')) return;
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'date') {
      setTouchedFields(prev => new Set([...prev, 'date', 'hour', 'minute']));
      const today = new Date().toLocaleDateString('en-CA');
      const restriction = getMinTimeRestriction(value);
      let newHour = '09', newMinute = '00';
      if (value === today && restriction) {
        newHour = restriction.minHour.toString().padStart(2, '0');
        newMinute = restriction.minMinute.toString().padStart(2, '0');
      }
      setFormData(prev => ({ ...prev, date: value, hour: newHour, minute: newMinute }));
      return;
    }
    setTouchedFields(prev => new Set([...prev, name]));
    if ((name === 'hour' || name === 'minute') && timeRestriction) {
      const selectedHour = name === 'hour' ? parseInt(value) : parseInt(formData.hour);
      const selectedMinute = name === 'minute' ? parseInt(value) : parseInt(formData.minute);
      if (selectedHour < timeRestriction.minHour ||
          (selectedHour === timeRestriction.minHour && selectedMinute < timeRestriction.minMinute)) {
        setFieldErrors(prev => ({ ...prev, time: 'No puedes seleccionar una hora que ya pasó para el día de hoy.' }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: name === 'stand_capacity' ? Number(value) : value }));
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
    if (!formData.date.trim()) errors.date = 'La fecha es obligatoria.';
    if (!formData.hour.trim() || !formData.minute.trim())
      errors.time = 'Debe seleccionar una hora para la feria.';
    if (hasActiveEnrollments) {
      if (formData.typeFair !== fair.typeFair)
        errors.typeFair = 'No se puede cambiar el tipo de feria porque ya hay emprendedores con solicitudes activas.';
      if (formData.stand_capacity !== fair.stand_capacity)
        errors.stand_capacity = 'No se puede cambiar la cantidad de stands porque ya hay emprendedores con solicitudes activas.';
    }
    setFieldErrors(errors);
    if (errors.date) setTimeout(() => dateInputRef.current?.focus(), 0);
    else if (errors.time) setTimeout(() => hourRef.current?.focus(), 0);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setFieldErrors({});
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setFieldErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) { handleNextStep(); return; }
    if (!validateStep2()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const timeString = `${formData.hour}:${formData.minute}`;
      const dateTimeString = `${formData.date} ${timeString}`;
      await updateFair.mutateAsync({
        id_fair: fair.id_fair,
        name: formData.name,
        description: formData.description,
        conditions: formData.conditions,
        location: formData.location,
        typeFair: formData.typeFair,
        stand_capacity: formData.stand_capacity,
        date: dateTimeString,
      });
      setShowConfirmModal(false);
      onSuccess();
    } catch (err: any) {
      let errorMessage = 'Error al actualizar la feria. Por favor intenta de nuevo.';
      if (err?.response?.status === 409 || err?.response?.status === 500)
        errorMessage = `Ya existe una feria con el nombre "${formData.name}" programada para la fecha ${formData.date}. Por favor elige un nombre diferente o cambia la fecha.`;
      else if (err?.response?.status === 400)
        errorMessage = err?.response?.data?.message || 'Los datos enviados no son válidos. Verifica la información e intenta nuevamente.';
      else if (err?.response?.data?.message)
        errorMessage = err.response.data.message;
      else if (err?.message)
        errorMessage = `Error: ${err.message}`;
      setApiError(errorMessage);
      setShowConfirmModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingEnrollments) {
    return (
      <div className="edit-fair-form">
        <div className="edit-fair-form__loading">
          <svg className="edit-fair-form__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verificando inscripciones existentes...
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="edit-fair-form__step-indicator">
      <div className="edit-fair-form__steps">
        <div className={`edit-fair-form__step ${currentStep >= 1 ? 'edit-fair-form__step--active' : ''}`}>
          <div className="edit-fair-form__step-number">1</div>
          <div className="edit-fair-form__step-label">Información Básica</div>
        </div>
        <div className="edit-fair-form__step-divider"></div>
        <div className={`edit-fair-form__step ${currentStep >= 2 ? 'edit-fair-form__step--active' : ''}`}>
          <div className="edit-fair-form__step-number">2</div>
          <div className="edit-fair-form__step-label">Configuración</div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="edit-fair-form__section">
      <div className="edit-fair-form__step-header">
        <div className="edit-fair-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-fair-form__step-title">Información Básica</h3>
          <p className="edit-fair-form__step-description">Modifica los datos generales de la feria</p>
        </div>
        <p className="edit-fair-form__required-legend">
          <span className="edit-fair-form__required">*</span> Campo obligatorio
        </p>
      </div>

      <div>
        <label htmlFor="edit-name" className="edit-fair-form__label">
          Nombre de la Feria
          {formData.name.trim().length < 5 && <span className="edit-fair-form__required">*</span>}
          {!touchedFields.has('name') && <span className="edit-fair-form__initial-editable">valor inicial editable</span>}
        </label>
        <input
          id="edit-name"
          name="name"
          type="text"
          maxLength={50}
          ref={nameRef}
          value={formData.name}
          onChange={handleChange}
          placeholder="Ingresa el nombre de la feria"
          className="edit-fair-form__input"
        />
        {fieldErrors.name && <span className="edit-fair-form__error-text">{fieldErrors.name}</span>}
        <div className="edit-fair-form__field-info">
          <div className="edit-fair-form__min-length">Mínimo: 5 caracteres</div>
          <div className={`edit-fair-form__character-count ${getCharacterCountClass(formData.name.length, 50)}`}>
            {formData.name.length}/50 caracteres
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="edit-description" className="edit-fair-form__label">
          Descripción
          {formData.description.trim().length < 10 && <span className="edit-fair-form__required">*</span>}
          {!touchedFields.has('description') && <span className="edit-fair-form__initial-editable">valor inicial editable</span>}
        </label>
        <textarea
          id="edit-description"
          name="description"
          rows={4}
          maxLength={100}
          ref={descriptionRef}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe la feria, su propósito y características principales..."
          className="edit-fair-form__input edit-fair-form__textarea"
        />
        {fieldErrors.description && <span className="edit-fair-form__error-text">{fieldErrors.description}</span>}
        <div className="edit-fair-form__field-info">
          <div className="edit-fair-form__min-length">Mínimo: 10 caracteres</div>
          <div className={`edit-fair-form__character-count ${getCharacterCountClass(formData.description.length, 100)}`}>
            {formData.description.length}/100 caracteres
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="edit-conditions" className="edit-fair-form__label">
          Condiciones
          {formData.conditions.trim().length < 15 && <span className="edit-fair-form__required">*</span>}
          {!touchedFields.has('conditions') && <span className="edit-fair-form__initial-editable">valor inicial editable</span>}
        </label>
        <textarea
          id="edit-conditions"
          name="conditions"
          rows={6}
          maxLength={450}
          ref={conditionsRef}
          value={formData.conditions}
          onChange={handleChange}
          placeholder="Especifica las condiciones y requisitos para participar en la feria..."
          className="edit-fair-form__input edit-fair-form__textarea"
        />
        {fieldErrors.conditions && <span className="edit-fair-form__error-text">{fieldErrors.conditions}</span>}
        <div className="edit-fair-form__field-info">
          <div className="edit-fair-form__min-length">Mínimo: 15 caracteres</div>
          <div className={`edit-fair-form__character-count ${getCharacterCountClass(formData.conditions.length, 450)}`}>
            {formData.conditions.length}/450 caracteres
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="edit-location" className="edit-fair-form__label">
          Ubicación
          {formData.location.trim().length < 10 && <span className="edit-fair-form__required">*</span>}
          {!touchedFields.has('location') && <span className="edit-fair-form__initial-editable">valor inicial editable</span>}
        </label>
        <textarea
          id="edit-location"
          name="location"
          rows={3}
          maxLength={150}
          ref={locationRef}
          value={formData.location}
          onChange={handleChange}
          placeholder="Ingresa la ubicación de la feria"
          className="edit-fair-form__input edit-fair-form__textarea"
        />
        {fieldErrors.location && <span className="edit-fair-form__error-text">{fieldErrors.location}</span>}
        <div className="edit-fair-form__field-info">
          <div className="edit-fair-form__min-length">Mínimo: 10 caracteres</div>
          <div className={`edit-fair-form__character-count ${getCharacterCountClass(formData.location.length, 150)}`}>
            {formData.location.length}/150 caracteres
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="edit-fair-form__section">
      <div className="edit-fair-form__step-header">
        <div className="edit-fair-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-fair-form__step-title">Configuración</h3>
          <p className="edit-fair-form__step-description">Modifica la fecha, tipo y capacidad de la feria</p>
        </div>
        <p className="edit-fair-form__required-legend">
          <span className="edit-fair-form__required">*</span> Campo obligatorio
        </p>
      </div>

      {hasActiveEnrollments && (
        <div className="edit-fair-form__enrollments-warning">
          <div className="edit-fair-form__enrollments-warning-header">
            <svg className="edit-fair-form__enrollments-warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="edit-fair-form__enrollments-warning-title">Feria con Inscripciones Asignadas</h3>
          </div>
          <div className="edit-fair-form__enrollments-info">
            <p className="edit-fair-form__enrollments-description">
              Esta feria tiene solicitudes activas de emprendedores. Por este motivo, no puedes modificar el tipo de feria ni la cantidad de stands.
            </p>
            <div className="edit-fair-form__enrollments-stats">
              {enrollmentStats.pending > 0 && (
                <span className="edit-fair-form__enrollment-stat edit-fair-form__enrollment-stat--pending">
                  {enrollmentStats.pending} Pendiente{enrollmentStats.pending !== 1 ? 's' : ''}
                </span>
              )}
              {enrollmentStats.approved > 0 && (
                <span className="edit-fair-form__enrollment-stat edit-fair-form__enrollment-stat--approved">
                  {enrollmentStats.approved} Aprobada{enrollmentStats.approved !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="edit-fair-form__label">
          Fecha y Hora de la Feria
          {!formData.date && <span className="edit-fair-form__required">*</span>}
          {!touchedFields.has('date') && !touchedFields.has('hour') && !touchedFields.has('minute') && (
            <span className="edit-fair-form__initial-editable">valor inicial editable</span>
          )}
        </label>
        <div className="edit-fair-form__datetime-container">
          <div className="edit-fair-form__date-section">
            <label className="edit-fair-form__sublabel">Fecha</label>
            <div className="edit-fair-form__input-wrapper">
              <div className="edit-fair-form__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="edit-date"
                name="date"
                type="date"
                ref={dateInputRef}
                value={formData.date}
                onChange={handleChange}
                className="edit-fair-form__input edit-fair-form__input--with-icon"
                min={new Date().toLocaleDateString('en-CA')}
              />
            </div>
            {fieldErrors.date && <span className="edit-fair-form__error-text">{fieldErrors.date}</span>}
          </div>

          <div className="edit-fair-form__time-section">
            <label className="edit-fair-form__sublabel">
              Hora
              {isToday && <span className="edit-fair-form__time-badge">Limitado</span>}
            </label>
            <div className="edit-fair-form__time-selectors">
              <div className="edit-fair-form__time-selector-wrapper">
                <div className="edit-fair-form__input-wrapper">
                  <div className="edit-fair-form__icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    id="edit-hour"
                    name="hour"
                    ref={hourRef}
                    value={formData.hour}
                    onChange={handleChange}
                    className={`edit-fair-form__input edit-fair-form__input--with-icon edit-fair-form__select edit-fair-form__time-select ${isToday ? 'edit-fair-form__time-select--restricted' : ''}`}
                  >
                    {hourOptions.map(option => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <span className="edit-fair-form__time-separator">:</span>
              </div>
              <div className="edit-fair-form__time-selector-wrapper">
                <div className="edit-fair-form__input-wrapper">
                  <select
                    id="edit-minute"
                    name="minute"
                    value={formData.minute}
                    onChange={handleChange}
                    className={`edit-fair-form__input edit-fair-form__select edit-fair-form__time-select ${isToday ? 'edit-fair-form__time-select--restricted' : ''}`}
                  >
                    {minuteOptions.map(option => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {fieldErrors.time && <span className="edit-fair-form__error-text">{fieldErrors.time}</span>}
        {isToday && timeRestriction && (
          <div className="edit-fair-form__time-notice">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>
              Horas disponibles desde las {timeRestriction.minHour.toString().padStart(2, '0')}:{timeRestriction.minMinute.toString().padStart(2, '0')}
            </span>
          </div>
        )}
        <p className="edit-fair-form__help-text">Selecciona la fecha y hora en que se realizará la feria</p>
      </div>

      <div>
        <FormDropdown
          variant="edit"
          label="Tipo de Feria"
          value={formData.typeFair}
          onChange={(value) => {
            if (!hasActiveEnrollments) {
              if (fieldErrors.typeFair) setFieldErrors(prev => ({ ...prev, typeFair: '' }));
              setFormData(prev => ({ ...prev, typeFair: value }));
              setTouchedFields(prev => new Set([...prev, 'typeFair']));
            }
          }}
          options={FAIR_TYPE_OPTIONS}
          disabled={hasActiveEnrollments}
          showInitialEditable={!touchedFields.has('typeFair') && !hasActiveEnrollments}
        />
        {hasActiveEnrollments && (
          <p className="edit-fair-form__error-text">No editable — hay inscripciones asignadas</p>
        )}
        {fieldErrors.typeFair && <span className="edit-fair-form__error-text">{fieldErrors.typeFair}</span>}
        <p className="edit-fair-form__help-text">
          <strong>Interna:</strong> Feria organizada dentro de las instalaciones de la fundación<br />
          <strong>Externa:</strong> Feria organizada en ubicaciones externas o eventos públicos
        </p>
      </div>

      <StandsSelector
        capacity={formData.stand_capacity}
        onCapacityChange={(newCapacity) => {
          setFormData(prev => ({ ...prev, stand_capacity: newCapacity }));
          setTouchedFields(prev => new Set([...prev, 'stand_capacity']));
        }}
        fairId={fair.id_fair}
        typeFair={formData.typeFair}
        disabled={hasActiveEnrollments}
        isEditing={true}
        showInitialEditable={!touchedFields.has('stand_capacity') && !hasActiveEnrollments}
        variant="edit"
      />

      <div className="edit-fair-form__info-box">
        <svg className="edit-fair-form__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="edit-fair-form__info-title">
            Estado Actual de la Feria:{' '}
            <span className={`edit-fair-form__status-badge ${fair?.status ? 'edit-fair-form__status-badge--active' : 'edit-fair-form__status-badge--inactive'}`}>
              {fair?.status ? 'Activa' : 'Inactiva'}
            </span>
          </p>
          <p className="edit-fair-form__info-text">
            Usa el botón de alternancia en la lista de ferias para cambiar el estado de la feria
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="edit-fair-form">
      <div className="edit-fair-form__progress">
        <div className="edit-fair-form__progress-bar">
          <div className="edit-fair-form__progress-fill" style={{ width: `${(currentStep / 2) * 100}%` }}></div>
        </div>
        {renderStepIndicator()}
      </div>

      <form onSubmit={handleSubmit} className="edit-fair-form__form" noValidate>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {apiError && (
          <div className="edit-fair-form__error">
            <svg className="edit-fair-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="edit-fair-form__error-message">{apiError}</p>
          </div>
        )}

        <div className="edit-fair-form__actions">
          {currentStep === 1 ? (
            <>
              <button type="button" onClick={onSuccess} className="edit-fair-form__cancel-btn">
                Cancelar
              </button>
              <button type="submit" className="edit-fair-form__next-btn">
                Siguiente: Configuración
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onSuccess} className="edit-fair-form__cancel-btn">
                Cancelar
              </button>
              <div className="edit-fair-form__navigation-buttons">
                <button type="button" onClick={handlePrevStep} className="edit-fair-form__back-btn">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior: Información Básica
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`edit-fair-form__submit-btn ${isLoading ? 'edit-fair-form__submit-btn--loading' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="edit-fair-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando Feria...
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

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        {...copyUpdate({
          resourcePhrase: 'la feria',
          name: formData.name,
          note: 'Los cambios se aplicarán al guardar.',
        })}
        cancelText="Cancelar"
        type="info"
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditFairForm;
