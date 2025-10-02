import { ENTREPRENEURSHIP_CATEGORIES, ENTREPRENEURSHIP_APPROACHES } from '../Services/EntrepreneursServices';
import type { EntrepreneurFormData } from '../Services/EntrepreneursServices';
import '../Styles/AddEntrepreneurForm.css';
import { useState } from "react";
interface EntrepreneurshipDataStepProps {
  formValues: EntrepreneurFormData;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (name: keyof EntrepreneurFormData, config?: any) => React.ReactNode;
}

const EntrepreneurshipDataStep = ({ formValues, onPrevious, onSubmit, isLoading, renderField }: EntrepreneurshipDataStepProps) => {
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
          label: 'Nombre del Emprendimiento',
          required: true,
          placeholder: 'Nombre de tu emprendimiento',
          maxLength: 50,
          showCharacterCount: true
        })}

        {/* Description */}
        {renderField('description', {
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe tu emprendimiento: ¿qué haces, qué productos o servicios ofreces, a quién te diriges y qué te diferencia?',
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


        {/* Imágenes obligatorias */}
        <div className="add-entrepreneur-form__section">
          <h4 className="add-entrepreneur-form__section-title">Imágenes del Emprendimiento</h4>
          <p className="add-entrepreneur-form__section-description">
            Sube 3 imágenes que representen tu emprendimiento
          </p>

          <div className="add-entrepreneur-form__image-uploads">
            {(['url_1', 'url_2', 'url_3'] as (keyof EntrepreneurFormData)[]).map(
              (field, idx) => {
                const [previews, setPreviews] = useState<{ [key: string]: string | null }>({}); 
                const file = formValues[field] as File | undefined;
                const previewUrl = previews[field] || null ;
                return (
                  <div key={field} className="add-entrepreneur-form__image-upload">
                    <label className="add-entrepreneur-form__image-upload-box">
                      {previewUrl ? (
                        <div className="add-entrepreneur-form__image-preview">
                          <img src={previewUrl} alt={`Preview ${idx + 1}`} />
                          <button
                            type="button"
                            className="add-entrepreneur-form__image-remove"
                            onClick={(e) => {
                              e.preventDefault();

                              // limpiar formValues
                              // @ts-ignore
                              formValues[field] = undefined;

                              // limpiar preview
                              setPreviews((prev) => ({ ...prev, [field]: null }));

                              // limpiar input file asociado
                              const input = document.querySelector<HTMLInputElement>(
                                `input[name="${field}"]`
                              );
                              if (input) {
                                input.value = "";
                              }
                            }}

                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="add-entrepreneur-form__image-upload-label">
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span>Subir imagen {idx + 1}</span>
                        </div>
                      )}

                      <input
                        type="file"
                        name={field}
                        accept="image/*"
                        required  
                        className="add-entrepreneur-form__image-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // guardar en formValues (para el submit final)
                            // @ts-ignore
                            formValues[field] = file;

                            // guardar preview en estado local (para mostrar inmediatamente)
                            setPreviews((prev) => ({
                              ...prev,
                              [field]: URL.createObjectURL(file),
                            }));
                          }
                        }}
                      />
                    </label>
                  </div>

                );
              }
            )}
          </div>
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