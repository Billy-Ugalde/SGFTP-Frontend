import type { ProjectFormData } from '../Services/ProjectsServices';
import '../Styles/AddProjectForm.css';
import { useState } from "react";

interface AddProjectImagesStepProps {
  formValues: ProjectFormData;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (name: keyof ProjectFormData, config?: any) => React.ReactNode;
}

const AddProjectImagesStep = ({ formValues, onPrevious, onSubmit, isLoading }: AddProjectImagesStepProps) => {
  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});

  // Type guard para campos de imagen
  const isImageField = (field: keyof ProjectFormData): field is 'url_1' | 'url_2' | 'url_3'| 'url_4' | 'url_5' | 'url_6' => {
    return ['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'].includes(field);
  };

  const handleImageChange = (field: keyof ProjectFormData, file: File) => {
    if (!isImageField(field)) return;
    
    // Update form values 
    (formValues[field] as File | undefined) = file;
    
    // Update preview
    setPreviews(prev => ({
      ...prev,
      [field]: URL.createObjectURL(file)
    }));
  };

  const handleImageRemove = (field: keyof ProjectFormData) => {
    if (!isImageField(field)) return;
    
    // Clear form value 
    (formValues[field] as File | undefined) = undefined;
    
    // Clear preview
    setPreviews(prev => ({
      ...prev,
      [field]: null
    }));

    // Clear file input
    const input = document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
    if (input) {
      input.value = "";
    }
  };

   const imageFields: (keyof ProjectFormData)[] = ['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'];

  return (
    <div className="add-project-form__step-content">
      <div className="add-project-form__step-header">
        <div className="add-project-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="add-project-form__step-title">Imágenes del Proyecto</h3>
          <p className="add-project-form__step-description">
            Sube imágenes que representen el proyecto (opcional)
          </p>
        </div>
      </div>

      <div className="add-project-form__fields">
        <div className="add-project-form__section">
          <h4 className="add-project-form__section-title">Imágenes del Proyecto</h4>
          <p className="add-project-form__section-description">
            Puedes subir hasta 6 imágenes que representen el proyecto. Estas imágenes son opcionales pero recomendadas.
          </p>

          <div className="add-project-form__image-uploads">
             {imageFields.map((field, idx) => {
                const previewUrl = previews[field] || null;
                
                return (
                  <div key={field} className="add-project-form__image-upload">
                    <label className="add-project-form__image-upload-box">
                      {previewUrl ? (
                        <div className="add-project-form__image-preview">
                          <img src={previewUrl} alt={`Preview ${idx + 1}`} />
                          <button
                            type="button"
                            className="add-project-form__image-remove"
                            onClick={(e) => {
                              e.preventDefault();
                              handleImageRemove(field);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="add-project-form__image-upload-label">
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
                          <span>Imagen {idx + 1}</span>
                        </div>
                      )}

                      <input
                        type="file"
                        name={field}
                        accept="image/*"
                        className="add-project-form__image-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageChange(field, file);
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

      <div className="add-project-form__step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="add-project-form__back-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior: Detalles
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          onClick={onSubmit}
          className={`add-project-form__submit-btn ${isLoading ? 'add-project-form__submit-btn--loading' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="add-project-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando Proyecto...
            </>
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Crear Proyecto
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddProjectImagesStep;