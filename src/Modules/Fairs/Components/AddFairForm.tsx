import { useState } from 'react';
import { useAddFair } from '../Services/FairsServices';
import StandsSelector from './StandsSelector';
import '../Styles/AddFairForm.css';

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

const AddFairForm = ({ onSuccess }: { onSuccess: () => void }) => {
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

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addFair = useAddFair();

  const timeRestriction = getMinTimeRestriction(formData.date);
  const hourOptions = generateHourOptions(timeRestriction?.minHour);
  const minuteOptions = generateMinuteOptions(formData.hour, timeRestriction?.minHour, timeRestriction?.minMinute);
  const isToday = formData.date === new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    

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
      [name]: type === 'number' ? Number(value) : 
              name === 'status' ? value === 'true' : 
              value
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

    // Validaciones de longitud mínima actualizadas
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
      onSuccess();
    } catch (err) {
      setError('Error al agregar la feria. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-fair-form">
      <form onSubmit={handleSubmit} className="add-fair-form__form">
        {/* Nombre de la Feria */}
        <div>
          <label htmlFor="name" className="add-fair-form__label">
            Nombre de la Feria <span className="add-fair-form__required">campo obligatorio</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={50}
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingresa el nombre de la feria"
            className="add-fair-form__input"
          />
          <div className="add-fair-form__field-info">
            <div className="add-fair-form__min-length">Mínimo: 5 caracteres</div>
            <div className="add-fair-form__character-count">
              {formData.name.length}/50 caracteres
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="add-fair-form__label">
            Descripción <span className="add-fair-form__required">campo obligatorio</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            maxLength={50}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe la feria, su propósito y características principales..."
            className="add-fair-form__input add-fair-form__textarea"
          />
          <div className="add-fair-form__field-info">
            <div className="add-fair-form__min-length">Mínimo: 10 caracteres</div>
            <div className="add-fair-form__character-count">
              {formData.description.length}/50 caracteres
            </div>
          </div>
        </div>

        {/* Condiciones */}
        <div>
          <label htmlFor="conditions" className="add-fair-form__label">
            Condiciones <span className="add-fair-form__required">campo obligatorio</span>
          </label>
          <textarea
            id="conditions"
            name="conditions"
            required
            rows={4}
            maxLength={250}
            value={formData.conditions}
            onChange={handleChange}
            placeholder="Especifica las condiciones y requisitos para participar en la feria..."
            className="add-fair-form__input add-fair-form__textarea"
          />
          <div className="add-fair-form__field-info">
            <div className="add-fair-form__min-length">Mínimo: 15 caracteres</div>
            <div className="add-fair-form__character-count">
              {formData.conditions.length}/250 caracteres
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="location" className="add-fair-form__label">
            Ubicación <span className="add-fair-form__required">campo obligatorio</span>
          </label>
          <div className="add-fair-form__input-wrapper">
            <div className="add-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
              </svg>
            </div>
            <input
              id="location"
              name="location"
              type="text"
              required
              maxLength={100}
              value={formData.location}
              onChange={handleChange}
              placeholder="Ingresa la ubicación de la feria"
              className="add-fair-form__input add-fair-form__input--with-icon"
            />
          </div>
          <div className="add-fair-form__field-info">
            <div className="add-fair-form__min-length">Mínimo: 10 caracteres</div>
            <div className="add-fair-form__character-count">
              {formData.location.length}/100 caracteres
            </div>
          </div>
        </div>

        {/* Fecha y Hora de la Feria */}
        <div>
          <label className="add-fair-form__label">
            Fecha y Hora de la Feria <span className="add-fair-form__required">campo obligatorio</span>
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
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="add-fair-form__input add-fair-form__input--with-icon"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
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
                      required
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
                      required
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
          <label htmlFor="typeFair" className="add-fair-form__label">
            Tipo de Feria <span className="add-fair-form__initial-editable">valor inicial editable</span>
          </label>
          <div className="add-fair-form__input-wrapper">
            <div className="add-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <select
              id="typeFair"
              name="typeFair"
              value={formData.typeFair}
              onChange={handleChange}
              className="add-fair-form__input add-fair-form__input--with-icon add-fair-form__select"
            >
              <option value="interna">Interna</option>
              <option value="externa">Externa</option>
            </select>
          </div>
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
        />

        {/* Estado */}
        <div>
          <label htmlFor="status" className="add-fair-form__label">
            Estado Inicial <span className="add-fair-form__initial-editable">valor inicial editable</span>
          </label>
          <div className="add-fair-form__input-wrapper">
            <div className="add-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <select
              id="status"
              name="status"
              value={formData.status.toString()}
              onChange={handleChange}
              className="add-fair-form__input add-fair-form__input--with-icon add-fair-form__select"
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>
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
              <strong>Activa:</strong> La feria es visible y acepta inscripciones de vendedores<br />
              <strong>Inactiva:</strong> La feria está oculta y no acepta nuevas inscripciones
            </p>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="add-fair-form__error">
            <svg className="add-fair-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="add-fair-form__error-text">
              {error}
            </p>
          </div>
        )}

        {/* Botones de Envío */}
        <div className="add-fair-form__actions">
          <button
            type="button"
            onClick={onSuccess}
            className="add-fair-form__cancel-btn"
          >
            Cancelar
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Feria
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFairForm;