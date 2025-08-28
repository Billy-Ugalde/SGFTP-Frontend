import { useState } from 'react';
import { useAddFair } from '../Services/FairsServices';
import StandsSelector from './StandsSelector';
import '../Styles/AddFairForm.css';

interface FormData {
  name: string;
  description: string;
  location: string;
  typeFair: string;
  stand_capacity: number;
  status: boolean;
  date: string;
}

const AddFairForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    typeFair: 'interna',
    stand_capacity: 10,
    status: true,
    date: ''
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
      const submitData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        typeFair: formData.typeFair,
        stand_capacity: formData.stand_capacity,
        status: formData.status,
        date: formData.date
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

        {/* Tipo de Feria */}
        <div>
          <label htmlFor="typeFair" className="add-fair-form__label">
            Tipo de Feria <span className="add-fair-form__required">*</span>
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

        {/* Fecha de la Feria */}
        <div>
          <label htmlFor="date" className="add-fair-form__label">
            Fecha de la Feria <span className="add-fair-form__required">*</span>
          </label>
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
          <p className="add-fair-form__help-text">
            Selecciona la fecha en que se realizará la feria
          </p>
        </div>

        {/* Selector de Stands*/}
        <StandsSelector
          capacity={formData.stand_capacity}
          onCapacityChange={(newCapacity) => 
            setFormData(prev => ({ ...prev, stand_capacity: newCapacity }))
          }
        />

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