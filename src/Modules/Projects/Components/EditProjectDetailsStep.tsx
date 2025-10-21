import type { Project, ProjectUpdateData } from '../Services/ProjectsServices';
import '../Styles/EditProjectForm.css';

interface EditProjectDetailsStepProps {
  project: Project;
  formValues: Omit<ProjectUpdateData, 'Id_project' | 'Active'>;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  renderField: (name: keyof Omit<ProjectUpdateData, 'Id_project' | 'Active'>, config?: any) => React.ReactNode;
  errorMessage?: string;
}

const EditProjectDetailsStep = ({ project, formValues, onNext, onPrevious, onCancel, renderField, errorMessage }: EditProjectDetailsStepProps) => {
  return (
    <div className="edit-project-form__step-content">
      <div className="edit-project-form__step-header">
        <div className="edit-project-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-project-form__step-title">Detalles del Proyecto</h3>
          <p className="edit-project-form__step-description">
            Actualiza los detalles de implementación
          </p>
        </div>
      </div>

      <div className="edit-project-form__fields">
        {/* Target Population */}
        {renderField('Target_population', {
          label: 'Población Objetivo',
          required: true,
          type: 'textarea',
          placeholder: 'Describe la población que será impactada por este proyecto...',
          minLength: 30,
          maxLength: 255,
          showCharacterCount: true
        })}

        {/* Location */}
        {renderField('Location', {
          label: 'Ubicación',
          required: true,
          placeholder: 'Ubicación donde se ejecutará el proyecto',
          maxLength: 255,
          showCharacterCount: true
        })}

        {/* Nota sobre estado activo/inactivo */}
        <div className="edit-project-form__section">
          <div className="edit-project-form__section-title">Estado del Proyecto</div>
          <div className="edit-project-form__section-description">
            El estado activo/inactivo del proyecto se gestiona de forma independiente mediante el botón de toggle disponible en la lista de proyectos.
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="edit-project-form__error">
          <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
        </div>
      )}

      <div className="edit-project-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-project-form__cancel-btn"
        >
          Cancelar
        </button>
        <div className="edit-project-form__navigation-buttons">
          <button
            type="button"
            onClick={onPrevious}
            className="edit-project-form__back-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior: Información Básica
          </button>
          <button
            type="button"
            onClick={onNext}
            className="edit-project-form__next-btn"
          >
            Siguiente: Imágenes
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectDetailsStep;