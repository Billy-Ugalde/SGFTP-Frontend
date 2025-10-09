import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '../../Auth/context/AuthContext';
import { useAddProject, transformFormDataToDto } from '../Services/ProjectsServices';
import type { ProjectFormData } from '../Services/ProjectsServices';
import AddProjectBasicInfoStep from './AddProjectBasicInfoStep';
import AddProjectDetailsStep from './AddProjectDetailsStep';
import AddProjectImagesStep from './AddProjectImagesStep';
import '../Styles/AddProjectForm.css';

interface AddProjectFormProps {
    onSuccess: () => void;
}

const AddProjectForm = ({ onSuccess }: AddProjectFormProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { user } = useAuth();
    const addProject = useAddProject();

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
        onSubmit: async ({ value }) => {
            setIsLoading(true);
            setErrorMessage('');

            try {
                console.log('📋 Valores del formulario:', value);
                
                const dto = transformFormDataToDto(value);
                console.log('📦 DTO generado:', dto);

                // Preparar archivos
                const files: File[] = [];
                const imageFields = ['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'] as const;
                
                imageFields.forEach(field => {
                    const file = value[field] as File | undefined;
                    if (file instanceof File) files.push(file);
                });

                console.log(`📸 Total de archivos: ${files.length}`);
                
                await addProject.mutateAsync({ projectData: dto, files });
                console.log('✅ Proyecto creado exitosamente');
                onSuccess();
            } catch (error: any) {
                console.error('❌ Error al crear proyecto:', error);
                
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
                    setErrorMessage('Error al crear el proyecto. Por favor intenta de nuevo.');
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
        // Validación de fechas - SOLO si ambas fechas están presentes
        if (isValid && values.Start_date && values.End_date) {
            const startDate = new Date(values.Start_date);
            const endDate = new Date(values.End_date);

            // Crear fecha mínima (día siguiente)
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

                    if (type === 'file') {
                        return (
                            <div className="add-project-form__file-field">
                                <label className="add-project-form__label">
                                    {label}{' '}
                                    {required && (
                                        <span className="add-project-form__required">campo obligatorio</span>
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
                                    {required && (
                                        <span className="add-project-form__required">campo obligatorio</span>
                                    )}
                                </label>
                                <textarea
                                    name={name as string}
                                    value={(typeof value === 'string' ? value : '') || ''}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value as any)}
                                    className="add-project-form__input add-project-form__input--textarea"
                                    placeholder={placeholder}
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
                            </div>
                        );
                    }

                    if (type === 'select') {
                        return (
                            <div>
                                <label className="add-project-form__label">
                                    {label}{' '}
                                    {required && (
                                        <span className="add-project-form__required">campo obligatorio</span>
                                    )}
                                </label>
                                <select
                                    name={name as string}
                                    value={(typeof value === 'string' ? value : '') || ''}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value as any)}
                                    className="add-project-form__input add-project-form__input--select"
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
                            <label className="add-project-form__label">
                                {label}{' '}
                                {required && (
                                    <span className="add-project-form__required">campo obligatorio</span>
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
                                    } else {
                                        field.handleChange(e.target.value as any);
                                    }
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
                        </div>
                    );
                }}
            </form.Field>
        );
    };

    return (
        <div className="add-project-form">
            {errorMessage && (
                <div className="add-project-form__error">
                    <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
                </div>
            )}

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
                        onNext={handleNextStep}
                        onCancel={onSuccess}
                        renderField={renderField}
                    />
                )}
                {currentStep === 2 && (
                    <AddProjectDetailsStep
                        formValues={form.state.values}
                        onNext={handleNextStep}
                        onPrevious={handlePrevStep}
                        renderField={renderField}
                    />
                )}
                {currentStep === 3 && (
                    <AddProjectImagesStep
                        formValues={form.state.values}
                        onPrevious={handlePrevStep}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        renderField={renderField}
                    />
                )}
            </form>
        </div>
    );
};

export default AddProjectForm;