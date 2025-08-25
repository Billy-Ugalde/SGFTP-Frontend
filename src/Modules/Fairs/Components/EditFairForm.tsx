import { useState, useEffect } from 'react';
import { useUpdateFair, useAddFairDates, useDeleteFairDate } from '../Services/FairsServices';
import StandsSelector from './StandsSelector';
import '../Styles/EditFairForm.css';

interface FairDate {
  id_date: number;
  date: string;
}

interface Fair {
  id_fair: number;
  name: string;
  description: string;
  location: string;
  stand_capacity: number;
  status: boolean;
  datefairs?: FairDate[];
}

interface EditFairFormProps {
  fair: Fair;
  onSuccess: () => void;
}

const EditFairForm = ({ fair, onSuccess }: EditFairFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    stand_capacity: 0,
  });

  const [existingDates, setExistingDates] = useState<FairDate[]>([]);
  const [newDates, setNewDates] = useState<{ date: string; time: string }[]>([]);
  const [datesToDelete, setDatesToDelete] = useState<number[]>([]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const updateFair = useUpdateFair();
  const addFairDates = useAddFairDates();
  const deleteFairDate = useDeleteFairDate();

  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatTimeForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '09:00';
      }
      if (dateString.includes('T')) {
        return date.toTimeString().slice(0, 5);
      } else {
        return '09:00';
      }
    } catch {
      return '09:00';
    }
  };

  const validateDuplicateDates = (): boolean => {
    const existingDateStrings = existingDates.map(dateObj => {
      const date = formatDateForInput(dateObj.date);
      const time = formatTimeForInput(dateObj.date);
      return `${date} ${time}`;
    });

    const newDateStrings = newDates
      .filter(dateTime => dateTime.date.trim() !== '' && dateTime.time.trim() !== '')
      .map(dt => `${dt.date} ${dt.time}`);

    const allDateStrings = [...existingDateStrings, ...newDateStrings];

    const uniqueDateStrings = [...new Set(allDateStrings)];
    return uniqueDateStrings.length === allDateStrings.length;
  };

  useEffect(() => {
    if (fair) {
      setFormData({
        name: fair.name || '',
        description: fair.description || '',
        location: fair.location || '',
        stand_capacity: fair.stand_capacity || 0,
      });

      if (fair.datefairs && fair.datefairs.length > 0) {
        setExistingDates(fair.datefairs);
      }
    }
  }, [fair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stand_capacity' ? Number(value) : value
    }));
  };

  const handleExistingDateChange = (index: number, value: string) => {
    setExistingDates(prev => 
      prev.map((date, i) => 
        i === index ? { ...date, date: value } : date
      )
    );
  };

  const markDateForDeletion = (index: number, dateId: number) => {
    setDatesToDelete(prev => [...prev, dateId]);
    setExistingDates(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewDateChange = (index: number, field: 'date' | 'time', value: string) => {
    setNewDates(prev => 
      prev.map((dateTime, i) => 
        i === index ? { ...dateTime, [field]: value } : dateTime
      )
    );
  };

  const addNewDate = () => {
    setNewDates(prev => [...prev, { date: '', time: '09:00' }]);
  };

  const removeNewDate = (index: number) => {
    setNewDates(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateDuplicateDates()) {
      setError('No se pueden tener fechas y horas duplicadas.');
      setIsLoading(false);
      return;
    }

    const remainingExistingDates = existingDates.length;
    const validNewDates = newDates.filter(dateTime => 
      dateTime.date.trim() !== '' && dateTime.time.trim() !== ''
    );
    
    if (remainingExistingDates === 0 && validNewDates.length === 0) {
      setError('Debe mantener al menos una fecha y hora para la feria.');
      setIsLoading(false);
      return;
    }

    try {
      await updateFair.mutateAsync({
        id_fair: fair.id_fair,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        stand_capacity: formData.stand_capacity,
      });

      for (const dateId of datesToDelete) {
        await deleteFairDate.mutateAsync(dateId);
      }

      if (validNewDates.length > 0) {
        const formattedDates = validNewDates.map(dateTime => {
          const [year, month, day] = dateTime.date.split('-');
          const [hours, minutes] = dateTime.time.split(':');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
          return date.toISOString();
        });

        await addFairDates.mutateAsync({
          fairId: fair.id_fair,
          dates: formattedDates
        });
      }

      onSuccess();
    } catch (err) {
      console.error('Error al actualizar:', err);
      setError('Error al actualizar la feria. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-fair-form">
      <form onSubmit={handleSubmit} className="edit-fair-form__form">
        {/* Nombre de la Feria */}
        <div>
          <label htmlFor="edit-name" className="edit-fair-form__label">
            Nombre de la Feria <span className="edit-fair-form__required">*</span>
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingresa el nombre de la feria"
            className="edit-fair-form__input"
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="edit-description" className="edit-fair-form__label">
            Descripción <span className="edit-fair-form__required">*</span>
          </label>
          <textarea
            id="edit-description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe la feria, su propósito y características principales..."
            className="edit-fair-form__input edit-fair-form__textarea"
          />
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="edit-location" className="edit-fair-form__label">
            Ubicación <span className="edit-fair-form__required">*</span>
          </label>
          <div className="edit-fair-form__input-wrapper">
            <div className="edit-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              id="edit-location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Ingresa la ubicación de la feria"
              className="edit-fair-form__input edit-fair-form__input--with-icon"
            />
          </div>
        </div>

        {/* Fechas Existentes */}
        {existingDates.length > 0 && (
          <div>
            <label className="edit-fair-form__label">
              Fechas Actuales de la Feria
            </label>
            
            {existingDates.map((dateObj, index) => (
              <div key={`existing-${dateObj.id_date}`} className="edit-fair-form__date-row">
                {/* Fecha */}
                <div className="edit-fair-form__input-wrapper edit-fair-form__date-input-wrapper">
                  <div className="edit-fair-form__icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={formatDateForInput(dateObj.date)}
                    onChange={(e) => handleExistingDateChange(index, e.target.value)}
                    className="edit-fair-form__input edit-fair-form__input--with-icon"
                    disabled
                  />
                </div>
                
                {/* Hora */}
                <div className="edit-fair-form__input-wrapper edit-fair-form__time-input-wrapper">
                  <div className="edit-fair-form__icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="time"
                    value={formatTimeForInput(dateObj.date)}
                    className="edit-fair-form__input edit-fair-form__input--with-icon"
                    disabled
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => markDateForDeletion(index, dateObj.id_date)}
                  className="edit-fair-form__remove-date-btn"
                  title="Eliminar fecha"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Nuevas Fechas */}
        <div>
          <label className="edit-fair-form__label">
            Agregar Nuevas Fechas y Horas
          </label>
          
          {newDates.map((dateTime, index) => (
            <div key={`new-${index}`} className="edit-fair-form__date-row">
              {/* Fecha */}
              <div className="edit-fair-form__input-wrapper edit-fair-form__date-input-wrapper">
                <div className="edit-fair-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  value={dateTime.date}
                  onChange={(e) => handleNewDateChange(index, 'date', e.target.value)}
                  className="edit-fair-form__input edit-fair-form__input--with-icon"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {/* Hora */}
              <div className="edit-fair-form__input-wrapper edit-fair-form__time-input-wrapper">
                <div className="edit-fair-form__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="time"
                  value={dateTime.time}
                  onChange={(e) => handleNewDateChange(index, 'time', e.target.value)}
                  className="edit-fair-form__input edit-fair-form__input--with-icon"
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeNewDate(index)}
                className="edit-fair-form__remove-date-btn"
                title="Eliminar nueva fecha"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addNewDate}
            className="edit-fair-form__add-date-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar nueva fecha y hora
          </button>
          
          <p className="edit-fair-form__help-text">
            Puedes eliminar fechas existentes y agregar nuevas fechas con horas específicas
          </p>
        </div>

        {/*Selector de Stands*/}
        <StandsSelector
          capacity={formData.stand_capacity}
          onCapacityChange={(newCapacity) => 
            setFormData(prev => ({ ...prev, stand_capacity: newCapacity }))
          }
          fairId={fair.id_fair}
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