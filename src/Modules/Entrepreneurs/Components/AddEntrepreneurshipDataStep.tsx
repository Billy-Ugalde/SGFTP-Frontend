import { ENTREPRENEURSHIP_CATEGORIES, ENTREPRENEURSHIP_APPROACHES } from '../Services/EntrepreneursServices';
import type { EntrepreneurFormData } from '../Services/EntrepreneursServices';
import '../Styles/AddEntrepreneurForm.css';

interface EntrepreneurshipDataStepProps {
  formValues: EntrepreneurFormData;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (name: keyof EntrepreneurFormData, config?: any) => React.ReactNode;
}

const EntrepreneurshipDataStep = ({ formValues, onPrevious, onSubmit, isLoading, renderField }: EntrepreneurshipDataStepProps) => {
  const handleFileChange = (fieldName: 'url_1' | 'url_2' | 'url_3', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const simulatedUrl = `https://example.com/uploads/${file.name}`;
      console.log(`Would set ${fieldName} to ${simulatedUrl}`);
    }
  };

  return (
    <div className="add-entrepreneur-form__step-content">
      <div className="add-entrepreneur-form__step-header">
        <div className="add-entrepreneur-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h3 className="add-entrepreneur-form__step-title">Información del Emprendimiento</h3>
          <p className="add-entrepreneur-form__step-description">
            Completa los datos del emprendimiento y sube las imágenes
          </p>
        </div>
      </div>

      {/* Entrepreneurship Information Fields */}
      <div className="add-entrepreneur-form__fields">
        {/* Entrepreneurship Name */}
        {renderField('entrepreneurship_name', {
          validators: {
            onChange: ({ value }: { value: string }) => !value ? 'El nombre del emprendimiento es obligatorio' : undefined,
          },
          label: 'Nombre del Emprendimiento',
          required: true,
          placeholder: 'Nombre de tu emprendimiento'
        })}

        {/* Description */}
        {renderField('description', {
          validators: {
            onChange: ({ value }: { value: string }) => !value ? 'La descripción es obligatoria' : undefined,
          },
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe tu emprendimiento en pocas palabras'
        })}

        {/* Location */}
        {renderField('location', {
          validators: {
            onChange: ({ value }: { value: string }) => !value ? 'La ubicación es obligatoria' : undefined,
          },
          label: 'Ubicación',
          required: true,
          placeholder: 'Ej: San José, Costa Rica'
        })}

        {/* Category */}
        {renderField('category', {
          label: 'Categoría',
          required: true,
          type: 'select',
          options: ENTREPRENEURSHIP_CATEGORIES
        })}

        {/* Approach */}
        {renderField('approach', {
          label: 'Enfoque',
          required: true,
          type: 'radio',
          options: ENTREPRENEURSHIP_APPROACHES
        })}

        {/* Image URLs */}
        <div className="add-entrepreneur-form__row add-entrepreneur-form__row--urls">
          {renderField('url_1', {
            label: 'URL Imagen 1',
            type: 'url',
            placeholder: 'https://ejemplo.com/imagen1.jpg'
          })}
          
          {renderField('url_2', {
            label: 'URL Imagen 2',
            type: 'url',
            placeholder: 'https://ejemplo.com/imagen2.jpg'
          })}
          
          {renderField('url_3', {
            label: 'URL Imagen 3',
            type: 'url',
            placeholder: 'https://ejemplo.com/imagen3.jpg'
          })}
        </div>
      </div>

      <div className="add-entrepreneur-form__step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="add-entrepreneur-form__prev-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior: Datos Personales
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          onClick={onSubmit}
          className={`add-entrepreneur-form__submit-btn ${isLoading ? 'add-entrepreneur-form__submit-btn--loading' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="add-entrepreneur-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando Emprendedor...
            </>
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Registrar Emprendedor
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EntrepreneurshipDataStep;