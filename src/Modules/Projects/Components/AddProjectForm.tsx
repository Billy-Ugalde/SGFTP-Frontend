import { useState, useRef, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAddProject, transformFormDataToDto } from '../Services/ProjectsServices';
import type { ProjectFormData } from '../Services/ProjectsServices';
import AddProjectBasicInfoStep from './AddProjectBasicInfoStep';
import AddProjectDetailsStep from './AddProjectDetailsStep';
import AddProjectImagesStep from './AddProjectImagesStep';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { useSuccessAlert } from '../../Shared/components';
import { copyCreate } from '../../Shared/utils/confirmationCopy';
import '../Styles/AddProjectForm.css';
import { validateSafeText } from '../../../shared/utils/validation.utils';

interface AddProjectFormProps {
    onSuccess: () => void;
}

const AddProjectForm = ({ onSuccess }: AddProjectFormProps) => {
    const { showSuccess } = useSuccessAlert();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isPastProject, setIsPastProject] = useState(false);
    const formContainerRef = useRef<HTMLDivElement>(null);
    const addProject = useAddProject();

    useEffect(() => {
        if (formContainerRef.current) {
            formContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [currentStep])
    const form = useForm({
        defaultValues: {
            Name: '',
            Description: '',
            Observations: '',
            Aim: '',
            Start_date: '',
            End_date: '',
            Target_population: '',
            Location: '',
            url_1: undefined,
            url_2: undefined,
            url_3: undefined,
            url_4: undefined,
            url_5: undefined,
            url_6: undefined,
        } satisfies ProjectFormData,
        onSubmit: async () => {
            setShowConfirmModal(true);
        },
    });

    const handleConfirmSubmit = async () => {
        setIsLoading(true);
        setApiError('');

        try {
            const value = form.state.values;
            const dto = transformFormDataToDto(value);

            // Preparar archivos
            const files: File[] = [];
            const imageFields = ['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'] as const;

            imageFields.forEach(field => {
                const file = value[field] as File | undefined;
                if (file instanceof File) files.push(file);
            });

            await addProject.mutateAsync({ projectData: dto, files });
            setShowConfirmModal(false);
            showSuccess('El proyecto ha sido creado exitosamente.');
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
                setApiError('Error al crear el proyecto. Por favor intenta de nuevo.');
            }
            setShowConfirmModal(false);
        } finally {
            setIsLoading(false);
        }
    };

    const focusFirstError = (errors: Record<string, string>) => {
        const fieldOrder = ['Name', 'Description', 'Observations', 'Aim', 'Start_date', 'End_date', 'Target_population', 'Location'];
        for (const field of fieldOrder) {
            if (!errors[field]) continue;
            const el = (document.getElementById(field) ?? document.querySelector(`[name="${field}"]`)) as HTMLElement | null;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus({ preventScroll: true });
                return;
            }
        }
    };

    const validateStep1 = (): Record<string, string> => {
        const values = form.state.values;
        const errors: Record<string, string> = {};

        if (!values.Name?.trim()) {
            errors.Name = 'El campo "Nombre del Proyecto" es obligatorio.';
        } else {
            const nameSafe = validateSafeText(values.Name, '"Nombre del Proyecto"', true);
            if (nameSafe) errors.Name = nameSafe;
        }

        if (!values.Description?.trim()) {
            errors.Description = 'El campo "Descripción" es obligatorio.';
        } else if (values.Description.trim().length < 50) {
            errors.Description = 'El campo "Descripción" debe tener al menos 50 caracteres.';
        } else {
            const descSafe = validateSafeText(values.Description, '"Descripción"', true);
            if (descSafe) errors.Description = descSafe;
        }

        if (!values.Observations?.trim()) {
            errors.Observations = 'El campo "Observaciones" es obligatorio.';
        } else if (values.Observations.trim().length < 30) {
            errors.Observations = 'El campo "Observaciones" debe tener al menos 30 caracteres.';
        } else {
            const obsSafe = validateSafeText(values.Observations, '"Observaciones"', true);
            if (obsSafe) errors.Observations = obsSafe;
        }

        if (!values.Aim?.trim()) {
            errors.Aim = 'El campo "Objetivo Principal" es obligatorio.';
        } else if (values.Aim.trim().length < 30) {
            errors.Aim = 'El campo "Objetivo Principal" debe tener al menos 30 caracteres.';
        } else {
            const aimSafe = validateSafeText(values.Aim, '"Objetivo Principal"', true);
            if (aimSafe) errors.Aim = aimSafe;
        }

        if (!values.Start_date?.trim()) {
            errors.Start_date = 'El campo "Fecha de Inicio" es obligatorio.';
        } else if (!isPastProject) {
            const startDate = new Date(values.Start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startDate < today) errors.Start_date = 'No puedes seleccionar una fecha anterior a la actual para proyectos en curso o futuros.';
        }

        if (!errors.Start_date && values.Start_date && values.End_date) {
            const startDate = new Date(values.Start_date);
            const endDate = new Date(values.End_date);
            const minEndDate = new Date(startDate);
            minEndDate.setDate(minEndDate.getDate() + 1);
            if (endDate <= startDate) {
                errors.End_date = 'La fecha de finalización debe ser al menos un día después de la fecha de inicio.';
            } else if (!isPastProject && endDate < minEndDate) {
                errors.End_date = `La fecha de finalización debe ser como mínimo ${minEndDate.toLocaleDateString('es-ES')}.`;
            }
        }

        setFieldErrors(errors);
        return errors;
    };

    const validateStep2 = (): Record<string, string> => {
        const values = form.state.values;
        const errors: Record<string, string> = {};

        if (!values.Target_population?.trim()) {
            errors.Target_population = 'El campo "Población Objetivo" es obligatorio.';
        } else if (values.Target_population.trim().length < 30) {
            errors.Target_population = 'El campo "Población Objetivo" debe tener al menos 30 caracteres.';
        } else {
            const targetSafe = validateSafeText(values.Target_population, '"Población Objetivo"', true);
            if (targetSafe) errors.Target_population = targetSafe;
        }

        if (!values.Location?.trim()) {
            errors.Location = 'El campo "Ubicación" es obligatorio.';
        } else {
            const locationSafe = validateSafeText(values.Location, '"Ubicación"', true);
            if (locationSafe) errors.Location = locationSafe;
        }

        setFieldErrors(errors);
        return errors;
    };

    const handleNextStep = () => {
        setFieldErrors({});
        setApiError('');
        if (currentStep === 1) {
            const errors = validateStep1();
            if (Object.keys(errors).length === 0) setCurrentStep(2);
            else focusFirstError(errors);
        } else if (currentStep === 2) {
            const errors = validateStep2();
            if (Object.keys(errors).length === 0) setCurrentStep(3);
            else focusFirstError(errors);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
        setFieldErrors({});
        setApiError('');
    };

    const handleSubmit = () => {
        setApiError('');
        form.handleSubmit();
    };

    const renderField = (
        name: keyof ProjectFormData,
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
                    const shouldShowRequired = required && (
                        minLength
                            ? currentLength < minLength  
                            : !value.trim()              
                    );

                    if (type === 'file') {
                        return (
                            <div className="add-project-form__file-field">
                                <label className="add-project-form__label">
                                    {label}{' '}
                                    {required && (
                                        <span className="add-project-form__required">*</span>
                                    )}
                                </label>
                                <input
                                    type="file"
                                    accept={accept || 'image/*'}
                                    name={name as string}
                                    required={required}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            field.handleChange(e.target.files[0] as any);
                                        }
                                    }}
                                    className="add-project-form__input"
                                />
                                {value && (
                                    <img
                                        src={(value instanceof File) ? URL.createObjectURL(value) : (value as string)}
                                        alt={label}
                                        className="h-24 w-24 object-cover rounded mt-2"
                                    />
                                )}
                            </div>
                        );
                    }

                    if (type === 'textarea') {
                        return (
                            <div>
                                <label className="add-project-form__label">
                                    {label}{' '}
                                    {shouldShowRequired  && (
                                        <span className="add-project-form__required">*</span>
                                    )}
                                </label>
                                <textarea
                                    id={name as string}
                                    name={name as string}
                                    value={(typeof value === 'string' ? value : '') || ''}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                                    className="add-project-form__input add-project-form__input--textarea"
                                    placeholder={placeholder}
                                    required={required}
                                    maxLength={maxLength}
                                    minLength={minLength}
                                />
                                {fieldErrors[name as string] && <span className="add-project-form__error-text">{fieldErrors[name as string]}</span>}
                                {showCharacterCount && maxLength && (
                                    <div className="add-project-form__field-info">
                                        {minLength && (
                                            <div className="add-project-form__min-length">
                                                Mínimo: {minLength} caracteres
                                            </div>
                                        )}
                                        <div
                                            className={`add-project-form__character-count ${
                                                currentLength > maxLength * 0.9
                                                    ? 'add-project-form__character-count--warning'
                                                    : ''
                                            } ${
                                                currentLength === maxLength
                                                    ? 'add-project-form__character-count--error'
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
                                <label className="add-project-form__label">
                                    {label}{' '}
                                    {required && (
                                        <span className="add-project-form__required">*</span>
                                    )}
                                </label>
                                <select
                                    id={name as string}
                                    name={name as string}
                                    value={(typeof value === 'string' ? value : '') || ''}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => { field.handleChange(e.target.value as any); if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' })); }}
                                    className="add-project-form__input add-project-form__input--select"
                                    required={required}
                                >
                                    {options.map((option: any) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors[name as string] && <span className="add-project-form__error-text">{fieldErrors[name as string]}</span>}
                            </div>
                        );
                    }

                    return (
                        <div>
                            <label className="add-project-form__label">
                                {label}{' '}
                                {shouldShowRequired && (
                                    <span className="add-project-form__required">*</span>
                                )}
                            </label>
                            <input
                                id={name as string}
                                type={type}
                                name={name as string}
                                value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                                onBlur={field.handleBlur}
                                onChange={(e) => {
                                    if (type === 'number') {
                                        const val = e.target.value;
                                        const numericValue = val === '' ? 0 : Math.max(0, Math.floor(Number(val)));
                                        field.handleChange(numericValue as any);
                                    } else {
                                        field.handleChange(e.target.value as any);
                                    }
                                    if (fieldErrors[name as string]) setFieldErrors(prev => ({ ...prev, [name as string]: '' }));
                                }}
                                className="add-project-form__input"
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
                            />
                            {showCharacterCount && maxLength && (
                                <div className="add-project-form__field-info">
                                    {minLength && (
                                        <div className="add-project-form__min-length">
                                            Mínimo: {minLength} caracteres
                                        </div>
                                    )}
                                    <div
                                        className={`add-project-form__character-count ${
                                            currentLength > maxLength * 0.9
                                                ? 'add-project-form__character-count--warning'
                                                : ''
                                        } ${
                                            currentLength === maxLength
                                                ? 'add-project-form__character-count--error'
                                                : ''
                                        }`}
                                    >
                                        {currentLength}/{maxLength} caracteres
                                    </div>
                                </div>
                            )}
                            {fieldErrors[name as string] && <span className="add-project-form__error-text">{fieldErrors[name as string]}</span>}
                        </div>
                    );
                }}
            </form.Field>
        );
    };

    return (
        <div className="add-project-form"   ref={formContainerRef} >
            {/* Progress Steps */}
            <div className="add-project-form__progress">
                <div className="add-project-form__progress-bar">
                    <div
                        className="add-project-form__progress-fill"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>
                </div>
                <div className="add-project-form__steps">
                    <div className={`add-project-form__step ${currentStep >= 1 ? 'add-project-form__step--active' : ''}`}>
                        <div className="add-project-form__step-number">1</div>
                        <div className="add-project-form__step-label">Información Básica</div>
                    </div>
                    <div className={`add-project-form__step ${currentStep >= 2 ? 'add-project-form__step--active' : ''}`}>
                        <div className="add-project-form__step-number">2</div>
                        <div className="add-project-form__step-label">Detalles</div>
                    </div>
                    <div className={`add-project-form__step ${currentStep >= 3 ? 'add-project-form__step--active' : ''}`}>
                        <div className="add-project-form__step-number">3</div>
                        <div className="add-project-form__step-label">Imágenes</div>
                    </div>
                </div>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="add-project-form__form"
            >
                {currentStep === 1 && (
                    <AddProjectBasicInfoStep
                        formValues={form.state.values}
                        isPastProject={isPastProject}
                        onIsPastProjectChange={setIsPastProject}
                        onNext={handleNextStep}
                        onCancel={onSuccess}
                        renderField={renderField}
                        errorMessage={apiError}
                    />
                )}
                {currentStep === 2 && (
                    <AddProjectDetailsStep
                        formValues={form.state.values}
                        onNext={handleNextStep}
                        onPrevious={handlePrevStep}
                        onCancel={onSuccess}
                        renderField={renderField}
                        errorMessage={apiError}
                    />
                )}
                {currentStep === 3 && (
                    <AddProjectImagesStep
                        formValues={form.state.values}
                        onPrevious={handlePrevStep}
                        onSubmit={handleSubmit}
                        onCancel={onSuccess}
                        isLoading={isLoading}
                        renderField={renderField}
                        errorMessage={apiError}
                    />
                )}
            </form>

            <ConfirmationModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSubmit}
                {...copyCreate({
                  resourceWord: 'proyecto',
                  resourcePhrase: 'el proyecto',
                  name: form.state.values.Name,
                })}
                cancelText="Cancelar"
                type="info"
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddProjectForm;