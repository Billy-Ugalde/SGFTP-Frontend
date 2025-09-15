import { ENTREPRENEURSHIP_CATEGORIES, ENTREPRENEURSHIP_APPROACHES } from '../Services/EntrepreneursServices';
import type { Entrepreneur, EntrepreneurUpdateData } from '../Services/EntrepreneursServices';
import '../Styles/EditEntrepreneurForm.css';

interface EditEntrepreneurshipDataStepProps {
  entrepreneur: Entrepreneur;
  formValues: Omit<EntrepreneurUpdateData, 'id_entrepreneur'>;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (name: keyof Omit<EntrepreneurUpdateData, 'id_entrepreneur'>, config?: any) => React.ReactNode;
}

const EditEntrepreneurshipDataStep = ({ 
  entrepreneur, 
  formValues, 
  onPrevious, 
  onSubmit, 
  isLoading, 
  renderField 
}: EditEntrepreneurshipDataStepProps) => {
  
  const handleFileChange = (fieldName: 'url_1' | 'url_2' | 'url_3', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const simulatedUrl = `https://example.com/uploads/${file.name}`;
      console.log(`Would set ${fieldName} to ${simulatedUrl}`);
    }
  };

  return (
    <div className="edit-entrepreneur-form__step-content">
      <div className="edit-entrepreneur-form__step-header">
        <div className="edit-entrepreneur-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h3 className="edit-entrepreneur-form__step-title">Información del Emprendimiento</h3>
          <p className="edit-entrepreneur-form__step-description">
            Actualiza los datos del emprendimiento y las imágenes
          </p>
        </div>
      </div>

      {/* Entrepreneurship Information Fields */}
      <div className="edit-entrepreneur-form__fields">
        {/* Entrepreneurship Name */}
        {renderField('entrepreneurship_name', {
          label: 'Nombre del Emprendimiento',
          required: true,
          placeholder: 'Nombre del emprendimiento',
          maxLength: 50,
          showCharacterCount: true
        })}

        {/* Description */}
        {renderField('description', {
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe tu emprendimiento en pocas palabras',
          minLength: 80,
          maxLength: 150,
          showCharacterCount: true
        })}

        {/* Location */}
        {renderField('location', {
          label: 'Ubicación',
          required: true,
          placeholder: 'Ej: San José, Costa Rica',
          maxLength: 150,
          showCharacterCount: true
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
          type: 'select',
          options: ENTREPRENEURSHIP_APPROACHES.map(approach => approach.value)
        })}

        {/* Image URLs */}
        <div className="edit-entrepreneur-form__section">
          <h4 className="edit-entrepreneur-form__section-title">URLs de Imágenes</h4>
          <p className="edit-entrepreneur-form__section-description">
            Actualiza los enlaces a las imágenes que representen tu emprendimiento
          </p>

          <div className="edit-entrepreneur-form__row edit-entrepreneur-form__row--urls">
            {renderField('url_1', {
              validators: {
                onChange: ({ value }: { value: string }) => {
                  if (value && !isValidUrl(value)) {
                    return 'Por favor ingresa una URL válida';
                  }
                  return undefined;
                },
              },
              label: 'URL Imagen 1',
              type: 'url',
              placeholder: 'https://ejemplo.com/imagen1.jpg'
            })}
            
            {renderField('url_2', {
              validators: {
                onChange: ({ value }: { value: string }) => {
                  if (value && !isValidUrl(value)) {
                    return 'Por favor ingresa una URL válida';
                  }
                  return undefined;
                },
              },
              label: 'URL Imagen 2',
              type: 'url',
              placeholder: 'https://ejemplo.com/imagen2.jpg'
            })}
            
            {renderField('url_3', {
              validators: {
                onChange: ({ value }: { value: string }) => {
                  if (value && !isValidUrl(value)) {
                    return 'Por favor ingresa una URL válida';
                  }
                  return undefined;
                },
              },
              label: 'URL Imagen 3',
              type: 'url',
              placeholder: 'https://ejemplo.com/imagen3.jpg'
            })}
          </div>
        </div>
      </div>

      <div className="edit-entrepreneur-form__step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="edit-entrepreneur-form__prev-btn"
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
          className={`edit-entrepreneur-form__submit-btn ${isLoading ? 'edit-entrepreneur-form__submit-btn--loading' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="edit-entrepreneur-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando Emprendedor...
            </>
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualizar Emprendedor
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Función auxiliar para validar URLs
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

export default EditEntrepreneurshipDataStep;