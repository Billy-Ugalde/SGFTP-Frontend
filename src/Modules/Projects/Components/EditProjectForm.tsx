import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useUpdateProject, transformUpdateFormDataToDto } from '../Services/ProjectsServices';
import type { Project, ProjectUpdateData } from '../Services/ProjectsServices';
import EditProjectBasicInfoStep from './EditProjectBasicInfoStep';
import EditProjectDetailsStep from './EditProjectDetailsStep';
import EditProjectImagesStep from './EditProjectImagesStep';
import ConfirmationModal from '../../Fairs/Components/ConfirmationModal';
import '../Styles/EditProjectForm.css'

interface EditProjectFormProps {
  project: Project;
  onSuccess: () => void;
}

type FileFieldName = 'url_1' | 'url_2' | 'url_3' | 'url_4' | 'url_5' | 'url_6';

const EditProjectForm = ({ project, onSuccess }: EditProjectFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [imageActions, setImageActions] = useState<{ [key in FileFieldName]?: 'keep' | 'replace' | 'delete' | 'add' }>({});
  const updateProject = useUpdateProject(project.Id_project!);
  
  const form = useForm({
    defaultValues: {
      Name: project.Name || '',
      Description: project.Description || '',
      Observations: project.Observations || '',
      Aim: project.Aim || '',
      Start_date: project.Start_date ? new Date(project.Start_date).toISOString().split('T')[0] : '',
      End_date: project.End_date ? new Date(project.End_date).toISOString().split('T')[0] : '',
      Target_population: project.Target_population || '',
      Location: project.Location || '',
      url_1: project.url_1 || '',
      url_2: project.url_2 || '',
      url_3: project.url_3 || '',
      url_4: project.url_4 || '',
      url_5: project.url_5 || '',
      url_6: project.url_6 || '',
    } satisfies Omit<ProjectUpdateData, 'Id_project' | 'Active'>,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        if (!project.Id_project) {
          throw new Error('No se puede actualizar el proyecto: ID no válido.');
        }

        const dto = transformUpdateFormDataToDto(value, imageActions);

        // Preparar archivos con sus NOMBRES DE CAMPO específicos
        const filesWithFieldName: { file: File; fieldName: string }[] = [];
        const imageFields: FileFieldName[] = ['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'];
        
        // Función helper para verificar si un valor es un File válido
        const isValidFile = (value: any): value is File => {
          return value instanceof File ||
            (value &&
              typeof value === 'object' &&
              'name' in value &&
              'size' in value &&
              'type' in value);
        };

        // Solo procesar archivos para campos con acción 'replace' o 'add'
        imageFields.forEach(field => {
          const fieldValue = value[field];
          const action = imageActions[field];
          
          if (isValidFile(fieldValue) && (action === 'replace' || action === 'add')) {
            filesWithFieldName.push({
              file: fieldValue,
              fieldName: field
            });
          }
        });
        
        await updateProject.mutateAsync({ 
          projectData: dto, 
          files: filesWithFieldName.length > 0 ? filesWithFieldName : undefined,
          imageActions: imageActions
        });
        
        onSuccess();
      } catch (error: any) {
        if (error?.response?.status === 409) {
          setErrorMessage('Ya existe un proyecto con el mismo nombre. Por favor verifica los datos.');
        } else if (error?.response?.status === 400) {
          const messages = error?.response?.data?.message;
          if (Array.isArray(messages)) {
            setErrorMessage(`Errores de validación:\n${messages.join('\n')}`);
          } else {
            setErrorMessage('Los datos enviados son inválidos. Por favor revisa todos los campos del formulario.');
          }
        } else if (error?.response?.status === 500) {
          setErrorMessage('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setErrorMessage('Error al actualizar el proyecto. Por favor intenta de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const validateStep1 = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate = [
      { name: 'Name', value: values.Name?.trim(), label: 'Nombre del Proyecto' },
      { name: 'Description', value: values.Description?.trim(), label: 'Descripción', minLength: 50 },
      { name: 'Observations', value: values.Observations?.trim(), label: 'Observaciones', minLength: 30 },
      { name: 'Aim', value: values.Aim?.trim(), label: 'Objetivo Principal', minLength: 30 },
      { name: 'Start_date', value: values.Start_date?.trim(), label: 'Fecha de Inicio' },
    ];

    for (const field of fieldsToValidate) {
      if (!field.value) {
        isValid = false;
        setErrorMessage(`El campo "${field.label}" es obligatorio.`);
        focusField(field.name);
        break;
      }
      
      if (field.minLength && field.value.length < field.minLength) {
        isValid = false;
        setErrorMessage(`El campo "${field.label}" debe tener al menos ${field.minLength} caracteres.`);
        focusField(field.name);
        break;
      }
    }

    if (isValid && values.Start_date && values.End_date) {
      const startDate = new Date(values.Start_date);
      const endDate = new Date(values.End_date);

      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 1);

      if (endDate <= startDate) {
        isValid = false;
        setErrorMessage('La fecha de finalización debe ser al menos un día después de la fecha de inicio.');
        focusField('End_date');
      } else if (endDate < minEndDate) {
        isValid = false;
        setErrorMessage(`La fecha de finalización debe ser como mínimo ${minEndDate.toLocaleDateString('es-ES')}.`);
        focusField('End_date');
      }
    }
    return isValid;
  };

  const validateStep2 = (): boolean => {
    const values = form.state.values;
    let isValid = true;

    const fieldsToValidate = [
      { 
        name: 'Target_population', 
        value: values.Target_population?.trim(), 
        label: 'Población Objetivo', 
        minLength: 30 
      },
      { 
        name: 'Location', 
        value: values.Location?.trim(), 
        label: 'Ubicación', 
        minLength: 1 
      },
    ];

    for (const field of fieldsToValidate) {
      if (!field.value) {
        isValid = false;
        setErrorMessage(`El campo "${field.label}" es obligatorio.`);
        focusField(field.name);
        break;
      }
      
      if (field.minLength && field.value.length < field.minLength) {
        isValid = false;
        setErrorMessage(`El campo "${field.label}" debe tener al menos ${field.minLength} caracteres.`);
        focusField(field.name);
        break;
      }
    }

    return isValid;
  };

  const focusField = (name: string) => {
    setTimeout(() => {
      const element = document.querySelector(`[name="${name}"]`);
      if (element) {
        (element as HTMLElement).focus();
        (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.reportValidity();
        }
      }
    }, 100);
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrorMessage('');
  };

  const handleSubmit = () => {
    setErrorMessage('');
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    form.handleSubmit();
  };

  const renderField = (
    name: keyof Omit<ProjectUpdateData, 'Id_project' | 'Active'>,
    config: any = {}
  ) => {
    const {
      label,
      required = false,
      type = 'text',
      placeholder = '',
      options = [],
      min,
      max,
      maxLength,
      minLength,
      showCharacterCount = false,
      accept,
    } = config;

    return (
      <form.Field name={name as any}>
        {(field) => {
          const value: any = field.state.value;
          const currentLength = (typeof value === 'string') ? value.length : 0;

          if (type === 'textarea') {
            return (
              <div>
                <label className="edit-project-form__label">
                  {label}{' '}
                  {required && (
                    <span className="edit-project-form__required">campo obligatorio</span>
                  )}
                </label>
                <textarea
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="edit-project-form__input edit-project-form__input--textarea"
                  placeholder={placeholder}
                  required={required}
                  maxLength={maxLength}
                  minLength={minLength}
                />
                {showCharacterCount && maxLength && (
                  <div className="edit-project-form__field-info">
                    {minLength && (
                      <div className="edit-project-form__min-length">
                        Mínimo: {minLength} caracteres
                      </div>
                    )}
                    <div
                      className={`edit-project-form__character-count ${
                        currentLength > maxLength * 0.9
                          ? 'edit-project-form__character-count--warning'
                          : ''
                      } ${
                        currentLength === maxLength
                          ? 'edit-project-form__character-count--error'
                          : ''
                      }`}
                    >
                      {currentLength}/{maxLength} caracteres
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (type === 'select') {
            return (
              <div>
                <label className="edit-project-form__label">
                  {label}{' '}
                  {required && (
                    <span className="edit-project-form__required">campo obligatorio</span>
                  )}
                </label>
                <select
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="edit-project-form__input edit-project-form__input--select"
                  required={required}
                >
                  {options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div>
              <label className="edit-project-form__label">
                {label}{' '}
                {required && (
                  <span className="edit-project-form__required">campo obligatorio</span>
                )}
              </label>
              <input
                type={type}
                name={name as string}
                value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  if (type === 'number') {
                    const val = e.target.value;
                    const numericValue = val === '' ? 0 : Math.max(0, Math.floor(Number(val)));
                    field.handleChange(numericValue as any);
                  } else if (type === 'checkbox') {
                    field.handleChange(e.target.checked as any);
                  } else {
                    field.handleChange(e.target.value as any);
                  }
                }}
                className="edit-project-form__input"
                placeholder={placeholder}
                min={name === 'End_date' && form.state.values.Start_date ?
                  new Date(new Date(form.state.values.Start_date).getTime() + 24 * 60 * 60 * 1000)
                    .toISOString().split('T')[0]
                  : min
                }
                max={max}
                required={required}
                maxLength={maxLength}
                minLength={minLength}
                checked={type === 'checkbox' ? value : undefined}
              />
              {showCharacterCount && maxLength && (
                <div className="edit-project-form__field-info">
                  {minLength && (
                    <div className="edit-project-form__min-length">
                      Mínimo: {minLength} caracteres
                    </div>
                  )}
                  <div
                    className={`edit-project-form__character-count ${
                      currentLength > maxLength * 0.9
                        ? 'edit-project-form__character-count--warning'
                        : ''
                    } ${
                      currentLength === maxLength
                        ? 'edit-project-form__character-count--error'
                        : ''
                    }`}
                  >
                    {currentLength}/{maxLength} caracteres
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="edit-project-form">
      {errorMessage && (
        <div className="edit-project-form__error">
          <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="edit-project-form__progress">
        <div className="edit-project-form__progress-bar">
          <div
            className="edit-project-form__progress-fill"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <div className="edit-project-form__steps">
          <div className={`edit-project-form__step ${currentStep >= 1 ? 'edit-project-form__step--active' : ''}`}>
            <div className="edit-project-form__step-number">1</div>
            <div className="edit-project-form__step-label">Información Básica</div>
          </div>
          <div className={`edit-project-form__step ${currentStep >= 2 ? 'edit-project-form__step--active' : ''}`}>
            <div className="edit-project-form__step-number">2</div>
            <div className="edit-project-form__step-label">Detalles</div>
          </div>
          <div className={`edit-project-form__step ${currentStep >= 3 ? 'edit-project-form__step--active' : ''}`}>
            <div className="edit-project-form__step-number">3</div>
            <div className="edit-project-form__step-label">Imágenes</div>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="edit-project-form__form"
      >
        {currentStep === 1 && (
          <EditProjectBasicInfoStep
            project={project}
            formValues={form.state.values}
            onNext={handleNextStep}
            onCancel={onSuccess}
            renderField={renderField}
          />
        )}
        {currentStep === 2 && (
          <EditProjectDetailsStep
            project={project}
            formValues={form.state.values}
            onNext={handleNextStep}
            onPrevious={handlePrevStep}
            renderField={renderField}
          />
        )}
        {currentStep === 3 && (
          <EditProjectImagesStep
            project={project}
            formValues={form.state.values}
            onPrevious={handlePrevStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            renderField={renderField}
            form={form}
            imageActions={imageActions}
            setImageActions={setImageActions}
          />
        )}
      </form>

      {/* Modal de Confirmación Global */}
      {showConfirmModal && (
        <ConfirmationModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSubmit}
          title="Confirmar actualización"
          message={`¿Está seguro de que desea actualizar el proyecto "${project.Name}"?\n\n${Object.values(form.state.values).some(val =>
            val && typeof val === 'object' && 'name' in val && 'size' in val && 'type' in val
          )
              ? 'Las imágenes reemplazadas se eliminarán permanentemente de Google Drive.'
              : ''
            }`}
          confirmText="Sí, actualizar"
          cancelText="Cancelar"
          type="info"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default EditProjectForm;