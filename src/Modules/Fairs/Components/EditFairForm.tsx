import { useState, useEffect } from 'react';
import { useUpdateFair } from '../Services/FairsServices';
import StandsSelector from './StandsSelector';
import '../Styles/EditFairForm.css';

interface Fair {
  id_fair: number;
  name: string;
  description: string;
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

const EditFairForm = ({ fair, onSuccess }: EditFairFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    typeFair: '',
    stand_capacity: 0,
    date: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const updateFair = useUpdateFair();

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

  useEffect(() => {
    if (fair) {
      setFormData({
        name: fair.name || '',
        description: fair.description || '',
        location: fair.location || '',
        typeFair: fair.typeFair || 'interna',
        stand_capacity: fair.stand_capacity || 0,
        date: fair.date ? formatDateForInput(fair.date) : '',
      });
    }
  }, [fair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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

    try {
      await updateFair.mutateAsync({
        id_fair: fair.id_fair,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        typeFair: formData.typeFair,
        stand_capacity: formData.stand_capacity,
        date: formData.date,
      });

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

        {/* Tipo de Feria */}
        <div>
          <label htmlFor="edit-typeFair" className="edit-fair-form__label">
            Tipo de Feria <span className="edit-fair-form__required">*</span>
          </label>
          <div className="edit-fair-form__input-wrapper">
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
              className="edit-fair-form__input edit-fair-form__input--with-icon edit-fair-form__select"
            >
              <option value="interna">Interna</option>
              <option value="externa">Externa</option>
            </select>
          </div>
          <p className="edit-fair-form__help-text">
            <strong>Interna:</strong> Feria organizada dentro de las instalaciones de la fundación<br />
            <strong>Externa:</strong> Feria organizada en ubicaciones externas o eventos públicos
          </p>
        </div>

        {/* Fecha de la Feria */}
        <div>
          <label htmlFor="edit-date" className="edit-fair-form__label">
            Fecha de la Feria <span className="edit-fair-form__required">*</span>
          </label>
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
          <p className="edit-fair-form__help-text">
            Selecciona la fecha en que se realizará la feria
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