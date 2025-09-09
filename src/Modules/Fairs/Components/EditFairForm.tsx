import { useState, useEffect } from 'react';
import { useUpdateFair, useFairEnrollmentsByFair } from '../Services/FairsServices';
import StandsSelector from './StandsSelector';
import '../Styles/EditFairForm.css';

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
  const today = new Date().toISOString().split('T')[0];
  
  if (selectedDate === today) {
    const now = new Date();
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

const EditFairForm = ({ fair, onSuccess }: EditFairFormProps) => {
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

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const updateFair = useUpdateFair();

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
        if (isNaN(date.getTime())) {
          return '';
        }
        return date.toISOString().split('T')[0];
      }
      if (dateString.includes(' ')) {
        const datePart = dateString.split(' ')[0];
        return datePart || '';
      }
      
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      return '';
    } catch {
      return '';
    }
  };

  const formatTimeForInput = (dateString: string): { hour: string, minute: string } => {
    try {
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return { hour: '09', minute: '00' };
        }
        const timeString = date.toTimeString().slice(0, 5);
        const [hour, minute] = timeString.split(':');
        return { hour, minute };
      }
      
      if (dateString.includes(' ')) {
        const timePart = dateString.split(' ')[1];
        if (timePart) {
          const [hour, minute] = timePart.slice(0, 5).split(':');
          return { 
            hour: hour?.padStart(2, '0') || '09', 
            minute: minute?.padStart(2, '0') || '00' 
          };
        }
      }
      
      return { hour: '09', minute: '00' };
    } catch {
      return { hour: '09', minute: '00' };
    }
  };

  const timeRestriction = getMinTimeRestriction(formData.date);
  const hourOptions = generateHourOptions(timeRestriction?.minHour);
  const minuteOptions = generateMinuteOptions(formData.hour, timeRestriction?.minHour, timeRestriction?.minMinute);
  const isToday = formData.date === new Date().toISOString().split('T')[0];

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
    
    if (hasActiveEnrollments && (name === 'typeFair' || name === 'stand_capacity')) {
      return;
    }
    
    if (error) {
      setError('');
    }
    
    if (name === 'date') {
      const today = new Date().toISOString().split('T')[0];
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
        setError('No puedes seleccionar una hora que ya pasó para el día de hoy.');
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stand_capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.date.trim()) {
      setError('Debe seleccionar una fecha para la feria.');
      setIsLoading(false);
      return;
    }

    if (!formData.hour.trim() || !formData.minute.trim()) {
      setError('Debe seleccionar una hora para la feria.');
      setIsLoading(false);
      return;
    }

    if (formData.name.trim().length < 5) {
      setError('El nombre de la feria debe tener al menos 5 caracteres.');
      setIsLoading(false);
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres.');
      setIsLoading(false);
      return;
    }

    if (formData.conditions.trim().length < 15) {
      setError('Las condiciones deben tener al menos 15 caracteres.');
      setIsLoading(false);
      return;
    }

    if (formData.location.trim().length < 10) {
      setError('La ubicación debe tener al menos 10 caracteres.');
      setIsLoading(false);
      return;
    }

    if (hasActiveEnrollments) {
      if (formData.typeFair !== fair.typeFair) {
        setError('No se puede cambiar el tipo de feria porque ya hay emprendedores con solicitudes activas.');
        setIsLoading(false);
        return;
      }
      
      if (formData.stand_capacity !== fair.stand_capacity) {
        setError('No se puede cambiar la cantidad de stands porque ya hay emprendedores con solicitudes activas.');
        setIsLoading(false);
        return;
      }
    }

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

      onSuccess();
    } catch (err) {
      console.error('Error al actualizar:', err);
      setError('Error al actualizar la feria. Por favor intenta de nuevo.');
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

  return (
    <div className="edit-fair-form">
      {/* Alerta de inscripciones existentes */}
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

      <form onSubmit={handleSubmit} className="edit-fair-form__form">
        {/* Nombre de la Feria */}
        <div>
          <label htmlFor="edit-name" className="edit-fair-form__label">
            Nombre de la Feria <span className="edit-fair-form__required-editable">editable - no puede estar vacío</span>
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            required
            maxLength={50}
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingresa el nombre de la feria"
            className="edit-fair-form__input"
          />
          <div className="edit-fair-form__field-info">
            <div className="edit-fair-form__min-length">Mínimo: 5 caracteres</div>
            <div className="edit-fair-form__character-count">
              {formData.name.length}/50 caracteres
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="edit-description" className="edit-fair-form__label">
            Descripción <span className="edit-fair-form__required-editable">editable - no puede estar vacío</span>
          </label>
          <textarea
            id="edit-description"
            name="description"
            required
            rows={4}
            maxLength={100}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe la feria, su propósito y características principales..."
            className="edit-fair-form__input edit-fair-form__textarea"
          />
          <div className="edit-fair-form__field-info">
            <div className="edit-fair-form__min-length">Mínimo: 10 caracteres</div>
            <div className="edit-fair-form__character-count">
              {formData.description.length}/100 caracteres
            </div>
          </div>
        </div>

        {/* Condiciones */}
        <div>
          <label htmlFor="edit-conditions" className="edit-fair-form__label">
            Condiciones <span className="edit-fair-form__required-editable">editable - no puede estar vacío</span>
          </label>
          <textarea
            id="edit-conditions"
            name="conditions"
            required
            rows={6}
            maxLength={450}
            value={formData.conditions}
            onChange={handleChange}
            placeholder="Especifica las condiciones y requisitos para participar en la feria..."
            className="edit-fair-form__input edit-fair-form__textarea"
          />
          <div className="edit-fair-form__field-info">
            <div className="edit-fair-form__min-length">Mínimo: 15 caracteres</div>
            <div className="edit-fair-form__character-count">
              {formData.conditions.length}/450 caracteres
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="edit-location" className="edit-fair-form__label">
            Ubicación <span className="edit-fair-form__required-editable">editable - no puede estar vacío</span>
          </label>
          <div className="edit-fair-form__input-wrapper">
            <div className="edit-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
              </svg>
            </div>
            <input
              id="edit-location"
              name="location"
              type="text"
              required
              maxLength={150}
              value={formData.location}
              onChange={handleChange}
              placeholder="Ingresa la ubicación de la feria"
              className="edit-fair-form__input edit-fair-form__input--with-icon"
            />
          </div>
          <div className="edit-fair-form__field-info">
            <div className="edit-fair-form__min-length">Mínimo: 10 caracteres</div>
            <div className="edit-fair-form__character-count">
              {formData.location.length}/150 caracteres
            </div>
          </div>
        </div>

        {/* Fecha y Hora de la Feria */}
        <div>
          <label className="edit-fair-form__label">
            Fecha y Hora de la Feria <span className="edit-fair-form__editable">editable</span>
          </label>
          
          <div className="edit-fair-form__datetime-container">
            {/* Fecha */}
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
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="edit-fair-form__input edit-fair-form__input--with-icon"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {/* Hora */}
            <div className="edit-fair-form__time-section">
              <label className="edit-fair-form__sublabel">
                Hora
                {isToday && (
                  <span className="edit-fair-form__time-badge">
                    Limitado
                  </span>
                )}
              </label>
              
              <div className="edit-fair-form__time-selectors">
                {/* Selector de Hora */}
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
                      required
                      value={formData.hour}
                      onChange={handleChange}
                      className={`edit-fair-form__input edit-fair-form__input--with-icon edit-fair-form__select edit-fair-form__time-select ${
                        isToday ? 'edit-fair-form__time-select--restricted' : ''
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
                  <span className="edit-fair-form__time-separator">:</span>
                </div>

                {/* Selector de Minuto */}
                <div className="edit-fair-form__time-selector-wrapper">
                  <div className="edit-fair-form__input-wrapper">
                    <select
                      id="edit-minute"
                      name="minute"
                      required
                      value={formData.minute}
                      onChange={handleChange}
                      className={`edit-fair-form__input edit-fair-form__select edit-fair-form__time-select ${
                        isToday ? 'edit-fair-form__time-select--restricted' : ''
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
          
          <p className="edit-fair-form__help-text">
            Selecciona la fecha y hora en que se realizará la feria
          </p>
        </div>

        {/* Tipo de Feria */}
        <div>
          <label htmlFor="edit-typeFair" className="edit-fair-form__label">
            Tipo de Feria {!hasActiveEnrollments && (
              <span className="edit-fair-form__editable">editable</span>
            )}
            {hasActiveEnrollments && (
              <span className="edit-fair-form__label-locked"> (No editable - Hay inscripciones asignadas)</span>
            )}
          </label>
          <div className={`edit-fair-form__input-wrapper ${hasActiveEnrollments ? 'edit-fair-form__input-wrapper--disabled' : ''}`}>
            <div className="edit-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <select
              id="edit-typeFair"
              name="typeFair"
              value={formData.typeFair}
              onChange={handleChange}
              disabled={hasActiveEnrollments}
              className={`edit-fair-form__input edit-fair-form__input--with-icon edit-fair-form__select ${
                hasActiveEnrollments ? 'edit-fair-form__input--disabled' : ''
              }`}
            >
              <option value="interna">Interna</option>
              <option value="externa">Externa</option>
            </select>
            {hasActiveEnrollments && (
              <div className="edit-fair-form__lock-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
          </div>
          <p className="edit-fair-form__help-text">
            <strong>Interna:</strong> Feria organizada dentro de las instalaciones de la fundación<br />
            <strong>Externa:</strong> Feria organizada en ubicaciones externas o eventos públicos
          </p>
        </div>

        {/* Selector de Stands */}
        <StandsSelector
          capacity={formData.stand_capacity}
          onCapacityChange={(newCapacity) => 
            setFormData(prev => ({ ...prev, stand_capacity: newCapacity }))
          }
          fairId={fair.id_fair}
          typeFair={formData.typeFair}
          disabled={hasActiveEnrollments}
          isEditing={true}
        />

        {/* Mensaje de Error */}
        {error && (
          <div className="edit-fair-form__error">
            <svg className="edit-fair-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="edit-fair-form__error-text">
              {error}
            </p>
          </div>
        )}

        {/* Información del Estado de la Feria */}
        <div className="edit-fair-form__status-info">
          <svg className="edit-fair-form__status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="edit-fair-form__status-title">
              <span className="edit-fair-form__status-label">Estado Actual:</span>
              <span className={`edit-fair-form__status-badge ${fair?.status ? 'edit-fair-form__status-badge--active' : 'edit-fair-form__status-badge--inactive'}`}>
                {fair?.status ? 'Activa' : 'Inactiva'}
              </span>
            </p>
            <p className="edit-fair-form__status-description">
              Usa el botón de alternancia en la lista de ferias para cambiar el estado
            </p>
          </div>
        </div>

        {/* Botones de Envío */}
        <div className="edit-fair-form__actions">
          <button
            type="button"
            onClick={onSuccess}
            className="edit-fair-form__cancel-btn"
          >
            Cancelar
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar Feria
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFairForm;