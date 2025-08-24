import { useState } from 'react';
import { useAddFair } from '../Services/FairsServices';
import '../Styles/AddFairForm.css';

interface DateTimeEntry {
  date: string;
  time: string;
}

interface FormData {
  name: string;
  description: string;
  location: string;
  stand_capacity: number;
  status: boolean;
  dateFairs: DateTimeEntry[];
}

const AddFairForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    stand_capacity: 0,
    status: true,
    dateFairs: [{ date: '', time: '09:00' }]
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addFair = useAddFair();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
              name === 'status' ? value === 'true' : 
              value
    }));
  };

  const handleDateChange = (index: number, field: 'date' | 'time', value: string) => {
    setFormData(prev => ({
      ...prev,
      dateFairs: prev.dateFairs.map((dateTime, i) => 
        i === index ? { ...dateTime, [field]: value } : dateTime
      )
    }));
  };

  const addDate = () => {
    setFormData(prev => ({
      ...prev,
      dateFairs: [...prev.dateFairs, { date: '', time: '09:00' }]
    }));
  };

  const removeDate = (index: number) => {
    if (formData.dateFairs.length > 1) {
      setFormData(prev => ({
        ...prev,
        dateFairs: prev.dateFairs.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const validDates = formData.dateFairs.filter(dateTime => 
      dateTime.date.trim() !== '' && dateTime.time.trim() !== ''
    );
    
    if (validDates.length === 0) {
      setError('Debe agregar al menos una fecha y hora para la feria.');
      setIsLoading(false);
      return;
    }

    
    const dateTimeStrings = validDates.map(dt => `${dt.date} ${dt.time}`);
    const uniqueDateTimes = [...new Set(dateTimeStrings)];
    if (uniqueDateTimes.length !== dateTimeStrings.length) {
      setError('No se pueden tener fechas y horas duplicadas.');
      setIsLoading(false);
      return;
    }

    try {
      const formattedDates = validDates.map(dateTime => {
        const [year, month, day] = dateTime.date.split('-');
        const [hours, minutes] = dateTime.time.split(':');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        return date.toISOString();
      });

      const submitData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        stand_capacity: formData.stand_capacity,
        status: formData.status,
        dateFairs: formattedDates
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
            Nombre de la Feria <span className="add-fair-form__required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingresa el nombre de la feria"
            className="add-fair-form__input"
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="add-fair-form__label">
            Descripción <span className="add-fair-form__required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe la feria, su propósito y características principales..."
            className="add-fair-form__input add-fair-form__textarea"
          />
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="location" className="add-fair-form__label">
            Ubicación <span className="add-fair-form__required">*</span>
          </label>
          <div className="add-fair-form__input-wrapper">
            <div className="add-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Ingresa la ubicación de la feria"
              className="add-fair-form__input add-fair-form__input--with-icon"
            />
          </div>
        </div>

        {/* Fechas y Horas de la Feria */}
        <div>
          <label className="add-fair-form__label">
            Fechas y Horas de la Feria <span className="add-fair-form__required">*</span>
          </label>
          
          {formData.dateFairs.map((dateTime, index) => (
            <div key={index} className="add-fair-form__date-row">
              {/* Fecha */}
              <div className="add-fair-form__input-wrapper add-fair-form__date-input-wrapper">
                <div className="add-fair-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  value={dateTime.date}
                  onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                  className="add-fair-form__input add-fair-form__input--with-icon"
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="Selecciona una fecha"
                />
              </div>
              
              {/* Hora */}
              <div className="add-fair-form__input-wrapper add-fair-form__time-input-wrapper">
                <div className="add-fair-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="time"
                  value={dateTime.time}
                  onChange={(e) => handleDateChange(index, 'time', e.target.value)}
                  className="add-fair-form__input add-fair-form__input--with-icon"
                />
              </div>
              
              {formData.dateFairs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(index)}
                  className="add-fair-form__remove-date-btn"
                  title="Eliminar fecha y hora"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addDate}
            className="add-fair-form__add-date-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar otra fecha y hora
          </button>
          
          <p className="add-fair-form__help-text">
            Puedes agregar múltiples fechas y horas si la feria se realizará en varios días u horarios
          </p>
        </div>

        {/* Capacidad de Stands y Estado */}
        <div className="add-fair-form__row">
          {/* Capacidad de Stands */}
          <div>
            <label htmlFor="stand_capacity" className="add-fair-form__label">
              Capacidad de Stands <span className="add-fair-form__required">*</span>
            </label>
            <div className="add-fair-form__input-wrapper">
              <div className="add-fair-form__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input
                id="stand_capacity"
                name="stand_capacity"
                type="number"
                min="1"
                required
                value={formData.stand_capacity}
                onChange={handleChange}
                placeholder="Número de stands"
                className="add-fair-form__input add-fair-form__input--with-icon"
              />
            </div>
            <p className="add-fair-form__help-text">
              Número máximo de stands para vendedores
            </p>
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="status" className="add-fair-form__label">
              Estado Inicial <span className="add-fair-form__required">*</span>
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