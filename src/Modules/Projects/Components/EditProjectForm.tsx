import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useUpdateProject, transformUpdateFormDataToDto } from '../Services/ProjectsServices';
import type { Project, ProjectUpdateData } from '../Services/ProjectsServices';
import EditProjectBasicInfoStep from './EditProjectBasicInfoStep';
import EditProjectDetailsStep from './EditProjectDetailsStep';
import EditProjectImagesStep from './EditProjectImagesStep';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { useSuccessAlert } from '../../Shared/components';
import { copyUpdate } from '../../Shared/utils/confirmationCopy';
import '../Styles/EditProjectForm.css'

interface EditProjectFormProps {
  project: Project;
  onSuccess: () => void;
}

type FileFieldName = 'url_1' | 'url_2' | 'url_3' | 'url_4' | 'url_5' | 'url_6';

const EditProjectForm = ({ project, onSuccess }: EditProjectFormProps) => {
  const { showSuccess } = useSuccessAlert();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
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
      setApiError('');
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

        showSuccess('El proyecto ha sido actualizado exitosamente.');
        onSuccess();
      } catch (error: any) {
        if (error?.response?.status === 409) {
          setApiError('Ya existe un proyecto con el mismo nombre. Por favor verifica los datos.');
        } else if (error?.response?.status === 400) {
          const messages = error?.response?.data?.message;
          if (Array.isArray(messages)) {
            setApiError(`Errores de validación:\n${messages.join('\n')}`);
          } else {
            setApiError('Los datos enviados son inválidos. Por favor revisa todos los campos del formulario.');
          }
        } else if (error?.response?.status === 500) {
          setApiError('Error interno del servidor. Por favor intenta más tarde.');
        } else {
          setApiError('Error al actualizar el proyecto. Por favor intenta de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const validateStep1 = (): boolean => {
    const values = form.state.values;
    const errors: Record<string, string> = {};

    if (!values.Name?.trim()) errors.Name = 'El campo "Nombre del Proyecto" es obligatorio.';
    if (!values.Description?.trim()) errors.Description = 'El campo "Descripción" es obligatorio.';
    else if (values.Description.trim().length < 50) errors.Description = 'El campo "Descripción" debe tener al menos 50 caracteres.';
    if (!values.Observations?.trim()) errors.Observations = 'El campo "Observaciones" es obligatorio.';
    else if (values.Observations.trim().length < 30) errors.Observations = 'El campo "Observaciones" debe tener al menos 30 caracteres.';
    if (!values.Aim?.trim()) errors.Aim = 'El campo "Objetivo Principal" es obligatorio.';
    else if (values.Aim.trim().length < 30) errors.Aim = 'El campo "Objetivo Principal" debe tener al menos 30 caracteres.';
    if (!values.Start_date?.trim()) errors.Start_date = 'El campo "Fecha de Inicio" es obligatorio.';

    if (!errors.Start_date && values.Start_date && values.End_date) {
      const startDate = new Date(values.Start_date);
      const endDate = new Date(values.End_date);
      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 1);
      if (endDate <= startDate) {
        errors.End_date = 'La fecha de finalización debe ser al menos un día después de la fecha de inicio.';
      } else if (endDate < minEndDate) {
        errors.End_date = `La fecha de finalización debe ser como mínimo ${minEndDate.toLocaleDateString('es-ES')}.`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const values = form.state.values;
    const errors: Record<string, string> = {};

    if (!values.Target_population?.trim()) errors.Target_population = 'El campo "Población Objetivo" es obligatorio.';
    else if (values.Target_population.trim().length < 30) errors.Target_population = 'El campo "Población Objetivo" debe tener al menos 30 caracteres.';
    if (!values.Location?.trim()) errors.Location = 'El campo "Ubicación" es obligatorio.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setFieldErrors({});
    setApiError('');
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setFieldErrors({});
    setApiError('');
  };

  const handleSubmit = () => {
    setApiError('');
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
    } = config;

    return (
      <form.Field name={name as any}>
        {(field) => {
          const value: any = field.state.value;
          const currentLength = (typeof value === 'string') ? value.length : 0;

          const initialValue = project[name as keyof Project];

          let showRequiredText = false;
          let showInitialEditable = false;

          if (required) {
            const hasInitialValue = initialValue &&
              typeof initialValue === 'string' &&
              initialValue.trim() !== '';

            if (hasInitialValue) {
              showInitialEditable = true;

              if (minLength) {
                showRequiredText = currentLength < minLength;
              } else {
                showRequiredText = !value || value.toString().trim() === '';
              }
            } else {
              if (minLength) {
                showRequiredText = currentLength < minLength;
              } else {
                showRequiredText = !value || value.toString().trim() === '';
              }
            }
          }

          if (type === 'textarea') {
            return (
              <div>
                <label className="edit-project-form__label">
                  {label}{' '}
                  {showInitialEditable && !showRequiredText && (
                    <span className="edit-project-form__initial-editable">valor inicial editable</span>
                  )}
                  {showRequiredText && (
                    <span className="edit-project-form__required">*</span>
                  )}
                </label>
                <textarea
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                  className="edit-project-form__input edit-project-form__input--textarea"
                  placeholder={placeholder}
                  required={required}
                  maxLength={maxLength}
                  minLength={minLength}
                />
                {fieldErrors[name as string] && <span className="edit-project-form__error-text">{fieldErrors[name as string]}</span>}
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
                    <span className="edit-project-form__initial-editable">valor inicial editable</span>
                  )}
                </label>
                <select
                  name={name as string}
                  value={(typeof value === 'string' ? value : '') || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                  className="edit-project-form__input edit-project-form__input--select"
                  required={required}
                >
                  {options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors[name as string] && <span className="edit-project-form__error-text">{fieldErrors[name as string]}</span>}
              </div>
            );
          }

          return (
            <div>
              <label className="edit-project-form__label">
                {label}{' '}
                {showInitialEditable && !showRequiredText && (
                  <span className="edit-project-form__initial-editable">valor inicial editable</span>
                )}
                {showRequiredText && (
                  <span className="edit-project-form__required">*</span>
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
                  if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' }));
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
              {fieldErrors[name as string] && <span className="edit-project-form__error-text">{fieldErrors[name as string]}</span>}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <div className="edit-project-form">
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
            errorMessage={apiError}
          />
        )}
        {currentStep === 2 && (
          <EditProjectDetailsStep
            project={project}
            formValues={form.state.values}
            onNext={handleNextStep}
            onPrevious={handlePrevStep}
             onCancel={onSuccess}
            renderField={renderField}
            errorMessage={apiError}
          />
        )}
        {currentStep === 3 && (
          <EditProjectImagesStep
            project={project}
            formValues={form.state.values}
            onPrevious={handlePrevStep}
            onSubmit={handleSubmit}
             onCancel={onSuccess}
            isLoading={isLoading}
            renderField={renderField}
            form={form}
            imageActions={imageActions}
            setImageActions={setImageActions}
            errorMessage={apiError}
          />
        )}
      </form>

      {/* Modal de Confirmación Global */}
      {showConfirmModal && (
        <ConfirmationModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSubmit}
          {...copyUpdate({
            resourcePhrase: 'el proyecto',
            name: project.Name,
            note: Object.values(form.state.values).some(
              (val) => val && typeof val === 'object' && 'name' in val && 'size' in val && 'type' in val
            )
              ? 'Las imágenes reemplazadas se eliminarán permanentemente de Google Drive.'
              : undefined,
          })}
          cancelText="Cancelar"
          type="info"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default EditProjectForm;