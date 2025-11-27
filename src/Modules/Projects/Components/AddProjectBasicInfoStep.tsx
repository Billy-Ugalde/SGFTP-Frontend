import type { ProjectFormData } from '../Services/ProjectsServices';
import '../Styles/AddProjectForm.css';

interface AddProjectBasicInfoStepProps {
  formValues: ProjectFormData;
  isPastProject: boolean;
  onIsPastProjectChange: (value: boolean) => void;
  onNext: () => void;
  onCancel: () => void;
  renderField: (name: keyof ProjectFormData, config?: any) => React.ReactNode;
  errorMessage?: string;
}

const AddProjectBasicInfoStep = ({ isPastProject, onIsPastProjectChange,  onNext, onCancel, renderField, errorMessage }: AddProjectBasicInfoStepProps) => {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="add-project-form__step-content">
      <div className="add-project-form__step-header">
        <div className="add-project-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h3 className="add-project-form__step-title">Información Básica del Proyecto</h3>
          <p className="add-project-form__step-description">
            Completa la información fundamental del proyecto
          </p>
        </div>
      </div>

      <div className="add-project-form__fields">
        {/* Project Name */}
        {renderField('Name', {
          label: 'Nombre del Proyecto',
          required: true,
          placeholder: 'Ingresa el nombre del proyecto',
          maxLength: 100,
          showCharacterCount: true
        })}

        {/* Description */}
        {renderField('Description', {
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe el propósito y objetivos del proyecto...',
          minLength: 50,
          maxLength: 255,
          showCharacterCount: true
        })}

        {/* Observations */}
        {renderField('Observations', {
          label: 'Observaciones',
          required: true,
          type: 'textarea',
          placeholder: 'Observaciones importantes sobre el proyecto...',
          minLength: 30,
          maxLength: 255,
          showCharacterCount: true
        })}

        {/* Aim */}
        {renderField('Aim', {
          label: 'Objetivo Principal',
          required: true,
          type: 'textarea',
          placeholder: 'Objetivo principal que se busca alcanzar con este proyecto...',
          minLength: 30,
          maxLength: 255,
          showCharacterCount: true
        })}

        {/* Checkbox para proyecto pasado */}
        <div className="add-project-form__checkbox-container">
          <div className="add-project-form__checkbox-wrapper">
            <input
              type="checkbox"
              checked={isPastProject}
              onChange={(e) => onIsPastProjectChange(e.target.checked)}
              className="add-project-form__checkbox-input"
            />
            <div>
              <div className="add-project-form__checkbox-label">
                ¿Es un proyecto pasado?
              </div>
              <div className="add-project-form__checkbox-description">
                Marca esta opción si el proyecto ya fue ejecutado en el pasado (te permitirá seleccionar fechas anteriores a la actual)
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="add-project-form__row">
          {renderField('Start_date', {
            label: 'Fecha de Inicio',
            required: true,
            type: 'date',
            placeholder: 'Fecha de inicio del proyecto',
            min: isPastProject ? undefined : today 
          })}

          {renderField('End_date', {
            label: 'Fecha de Finalización (Opcional)',
            required: false,
            type: 'date',
            placeholder: 'Fecha estimada de finalización',
            min: isPastProject ? undefined : today
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="add-project-form__error">
          <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
        </div>
      )}

      <div className="add-project-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="add-project-form__cancel-btn"
        >
          Cancelar
        </button>
        <div className="add-project-form__navigation-buttons">
          <button
            type="button"
            onClick={onNext}
            className="add-project-form__next-btn"
          >
            Siguiente: Detalles
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectBasicInfoStep;