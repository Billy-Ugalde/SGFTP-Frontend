import type { Project, ProjectUpdateData } from '../Services/ProjectsServices';
import '../Styles/EditProjectForm.css';

interface EditProjectBasicInfoStepProps {
  project: Project;
  formValues: Omit<ProjectUpdateData, 'Id_project' | 'Active'>;
  onNext: () => void;
  onCancel: () => void;
  renderField: (name: keyof Omit<ProjectUpdateData, 'Id_project' | 'Active'>, config?: any) => React.ReactNode;
}

const EditProjectBasicInfoStep = ({ project, formValues, onNext, onCancel, renderField }: EditProjectBasicInfoStepProps) => {
  return (
    <div className="edit-project-form__step-content">
      <div className="edit-project-form__step-header">
        <div className="edit-project-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h3 className="edit-project-form__step-title">Información Básica del Proyecto</h3>
          <p className="edit-project-form__step-description">
            Actualiza la información fundamental del proyecto
          </p>
        </div>
      </div>

      <div className="edit-project-form__fields">
        {/* Project Name */}
        {renderField('Name', {
          label: 'Nombre del Proyecto',
          required: true,
          placeholder: 'Ingresa el nombre del proyecto',
          maxLength: 50,
          showCharacterCount: true
        })}

        {/* Description */}
        {renderField('Description', {
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe el propósito y objetivos del proyecto...',
          minLength: 50,
          maxLength: 200,
          showCharacterCount: true
        })}

        {/* Observations */}
        {renderField('Observations', {
          label: 'Observaciones',
          required: true,
          type: 'textarea',
          placeholder: 'Observaciones importantes sobre el proyecto...',
          minLength: 30,
          maxLength: 150,
          showCharacterCount: true
        })}

        {/* Aim */}
        {renderField('Aim', {
          label: 'Objetivo Principal',
          required: true,
          type: 'textarea',
          placeholder: 'Objetivo principal que se busca alcanzar con este proyecto...',
          minLength: 30,
          maxLength: 150,
          showCharacterCount: true
        })}

        {/* Dates */}
        <div className="edit-project-form__row">
          {renderField('Start_date', {
            label: 'Fecha de Inicio',
            required: true,
            type: 'date',
            placeholder: 'Fecha de inicio del proyecto'
          })}

          {renderField('End_date', {
            label: 'Fecha de Finalización (Opcional)',
            required: false,
            type: 'date',
            placeholder: 'Fecha estimada de finalización'
          })}
        </div>
      </div>

      <div className="edit-project-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-project-form__cancel-btn"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="edit-project-form__next-btn"
        >
          Siguiente: Detalles
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EditProjectBasicInfoStep;