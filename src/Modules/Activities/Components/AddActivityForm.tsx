import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { ActivityFormData } from '../Services/ActivityService';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/AddActivityForm.css';

interface AddActivityFormProps {
  onSubmit: (data: ActivityFormData, images?: File[]) => Promise<void>;
  onCancel: () => void;
}

const getCharacterCountClass = (currentLength: number, maxLength: number) => {
  if (currentLength >= maxLength) {
    return 'add-activity-form__character-count--error';
  } else if (currentLength >= maxLength - 10) {
    return 'add-activity-form__character-count--warning';
  }
  return '';
};

const AddActivityForm: React.FC<AddActivityFormProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState<Array<{ Id_project: number; Name: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showSpacesField, setShowSpacesField] = useState(false);
  const modalContentRef = React.useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState<ActivityFormData>({
    Name: '',
    Description: '',
    Conditions: '',
    Observations: '',
    IsRecurring: false,
    IsFavorite: undefined,
    OpenForRegistration: false,
    Type_activity: 'workshop',
    Status_activity: 'pending',
    Approach: 'environmental',
    Spaces: 0,
    Location: '',
    Aim: '',
    Metric_activity: 'attendance',
    Active: true,
    Id_project: 0,
    dates: [{ Start_date: '', End_date: '' }]
  });

  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({
    image_1: null,
    image_2: null,
    image_3: null
  });
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string | null }>({
    image_1: null,
    image_2: null,
    image_3: null
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects`, {
          withCredentials: true
        });
        const projectsData = response.data.map((p: any) => ({
          Id_project: p.Id_project,
          Name: p.Name
        }));
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setFormData(prev => ({
            ...prev,
            Id_project: projectsData[0].Id_project
          }));
        }
        setLoadingProjects(false);
      } catch (error) {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!formData.IsRecurring && formData.dates.length > 1) {
      setFormData(prev => ({
        ...prev,
        dates: [prev.dates[0]]
      }));
    }
  }, [formData.IsRecurring]);

  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (formData.Status_activity === 'finished') {
      const updatedDates = formData.dates.map(date => ({
        ...date,
        Metric_value: date.Metric_value ?? 0
      }));
      if (JSON.stringify(updatedDates) !== JSON.stringify(formData.dates)) {
        setFormData({ ...formData, dates: updatedDates });
      }
    }
  }, [formData.Status_activity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const activeElement = document.activeElement;
        const formElement = document.getElementById('add-activity-form');

        if (formElement) {
          const focusableElements = Array.from(
            formElement.querySelectorAll(
              'input:not([disabled]):not([type="file"]), select:not([disabled]), textarea:not([disabled])'
            )
          ).filter(el => {
            const parent = (el as HTMLElement).closest('.add-activity-form__step-actions');
            return !parent;
          });

          const lastFormField = focusableElements[focusableElements.length - 1];

          if (activeElement === lastFormField) {
            e.preventDefault();
            nextButtonRef.current?.focus();
            return;
          }
        }

        if (cancelButtonRef.current && activeElement === cancelButtonRef.current) {
          e.preventDefault();
          nextButtonRef.current?.focus();
        } else if (prevButtonRef.current && activeElement === prevButtonRef.current) {
          e.preventDefault();
          nextButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (error) {
      setError('');
    }

    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'number') {
      finalValue = Number(value);
    } else if (name === 'IsFavorite') {
      finalValue = value === '' ? undefined : value as ('school' | 'condominium');
    }
    
    setFormData({
      ...formData,
      [name]: finalValue
    });
  };

  const handleImageChange = (field: string, file: File) => {
    setImageFiles(prev => ({
      ...prev,
      [field]: file
    }));
    
    setImagePreviews(prev => ({
      ...prev,
      [field]: URL.createObjectURL(file)
    }));
  };

  const handleImageRemove = (field: string) => {
    setImageFiles(prev => ({
      ...prev,
      [field]: null
    }));
    
    setImagePreviews(prev => ({
      ...prev,
      [field]: null
    }));

    const input = document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
    if (input) {
      input.value = "";
    }
  };

  const handleDateChange = (index: number, field: string, value: string | number) => {
    const updatedDates = [...formData.dates];

    if (field === 'Start_date' && typeof value === 'string' && index > 0 && value) {
      const previousEndDate = updatedDates[index - 1].End_date;
      if (previousEndDate) {
        const newStartDate = new Date(value);
        const prevEndDate = new Date(previousEndDate);

        if (newStartDate < prevEndDate) {
          setError(`La fecha de inicio debe ser igual o posterior a la fecha final anterior (${new Date(previousEndDate).toLocaleString('es-ES')})`);
          return;
        }
      }
    }

    if (field === 'Start_date' && typeof value === 'string' && updatedDates[index].End_date) {
      const startDate = new Date(value);
      const endDate = new Date(updatedDates[index].End_date!);

      if (value && startDate >= endDate) {
        updatedDates[index].End_date = '';
      }
    }

    if (field === 'End_date' && typeof value === 'string' && value && updatedDates[index].Start_date) {
      const startDate = new Date(updatedDates[index].Start_date);
      const endDate = new Date(value);

      if (endDate <= startDate) {
        setError('La fecha final debe ser posterior a la fecha de inicio (incluyendo la hora)');
        return;
      }
    }

    if (field === 'Metric_value') {
      const numValue = typeof value === 'string' ? Number(value) : value;
      if (numValue && numValue > 0) {
        updatedDates[index] = { ...updatedDates[index], Metric_value: numValue };
      } else {
        const { Metric_value, ...rest } = updatedDates[index] as any;
        updatedDates[index] = rest;
      }
    } else {
      updatedDates[index] = { ...updatedDates[index], [field]: value };
    }

    setFormData({ ...formData, dates: updatedDates });
  };

  const addDate = () => {
    if (!formData.IsRecurring) {
      setError('Para agregar múltiples fechas, marca la actividad como recurrente');
      return;
    }
    const newDate = formData.Status_activity === 'finished'
      ? { Start_date: '', End_date: '', Metric_value: 0 }
      : { Start_date: '', End_date: '' };

    setFormData({
      ...formData,
      dates: [...formData.dates, newDate]
    });
  };

  const removeDate = (index: number) => {
    const updatedDates = formData.dates.filter((_, i) => i !== index);
    setFormData({ ...formData, dates: updatedDates });
  };

  const handleToggleSpacesField = () => {
    if (showSpacesField) {
      setFormData({ ...formData, Spaces: 0 });
    }
    setShowSpacesField(!showSpacesField);
  };

  const focusFieldWithError = (fieldName: string) => {
    setTimeout(() => {
      const element = document.querySelector(`[name="${fieldName}"]`) || document.querySelector(`#${fieldName}`);
      if (element) {
        (element as HTMLElement).focus();
        (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          const errorMsg = element.validity.valueMissing ? 'Rellena este campo' :
                          element.validity.tooShort ? `Este campo requiere al menos ${element.minLength} caracteres` :
                          'Por favor completa este campo correctamente';
          element.setCustomValidity(errorMsg);
          element.reportValidity();
          element.setCustomValidity('');
        }
      }
    }, 100);
  };

  const focusDateFieldWithError = (dateIndex: number, fieldType: 'Start_date' | 'End_date') => {
    setTimeout(() => {
      const dateContainers = document.querySelectorAll('.add-activity-form__date-item');
      if (dateContainers && dateContainers[dateIndex]) {
        const container = dateContainers[dateIndex];
        const inputs = container.querySelectorAll('input[type="datetime-local"]');

        const input = (fieldType === 'Start_date' ? inputs[0] : inputs[1]) as HTMLInputElement;

        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });

          input.setCustomValidity('Rellena este campo');
          input.reportValidity();
          input.setCustomValidity('');
        }
      }
    }, 100);
  };

  const validateStep1 = (): boolean => {
    if (!formData.Name || formData.Name.trim().length === 0) {
      setError('El campo "Nombre" es obligatorio.');
      focusFieldWithError('Name');
      return false;
    }
    if (formData.Name.trim().length < 5) {
      setError('El campo "Nombre" debe tener al menos 5 caracteres.');
      focusFieldWithError('Name');
      return false;
    }

    if (!formData.Description || formData.Description.trim().length === 0) {
      setError('El campo "Descripción" es obligatorio.');
      focusFieldWithError('Description');
      return false;
    }
    if (formData.Description.trim().length < 20) {
      setError('El campo "Descripción" debe tener al menos 20 caracteres.');
      focusFieldWithError('Description');
      return false;
    }

    if (!formData.Aim || formData.Aim.trim().length === 0) {
      setError('El campo "Objetivo" es obligatorio.');
      focusFieldWithError('Aim');
      return false;
    }
    if (formData.Aim.trim().length < 15) {
      setError('El campo "Objetivo" debe tener al menos 15 caracteres.');
      focusFieldWithError('Aim');
      return false;
    }

    if (!formData.Location || formData.Location.trim().length === 0) {
      setError('El campo "Ubicación" es obligatorio.');
      focusFieldWithError('Location');
      return false;
    }
    if (formData.Location.trim().length < 10) {
      setError('El campo "Ubicación" debe tener al menos 10 caracteres.');
      focusFieldWithError('Location');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.Conditions || formData.Conditions.trim().length === 0) {
      setError('El campo "Condiciones" es obligatorio.');
      focusFieldWithError('Conditions');
      return false;
    }
    if (formData.Conditions.trim().length < 15) {
      setError('El campo "Condiciones" debe tener al menos 15 caracteres.');
      focusFieldWithError('Conditions');
      return false;
    }

    if (!formData.Observations || formData.Observations.trim().length === 0) {
      setError('El campo "Observaciones" es obligatorio.');
      focusFieldWithError('Observations');
      return false;
    }
    if (formData.Observations.trim().length < 15) {
      setError('El campo "Observaciones" debe tener al menos 15 caracteres.');
      focusFieldWithError('Observations');
      return false;
    }

    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.Id_project || formData.Id_project === 0) {
      setError('Por favor selecciona un proyecto válido');
      return false;
    }

    if (formData.dates.length === 0 || !formData.dates[0].Start_date) {
      setError('Por favor ingresa al menos una fecha de inicio');
      focusDateFieldWithError(0, 'Start_date');
      return false;
    }

    if (!formData.IsRecurring && formData.dates.length > 1) {
      setError('Las actividades no recurrentes solo pueden tener una fecha');
      return false;
    }

    for (let i = 0; i < formData.dates.length; i++) {
      const date = formData.dates[i];

      if (!date.Start_date) {
        setError(`Rellena este campo: Fecha de inicio de la fecha ${i + 1}`);
        focusDateFieldWithError(i, 'Start_date');
        return false;
      }

      if (!date.End_date) {
        setError(`Rellena este campo: Fecha de fin de la fecha ${i + 1}`);
        focusDateFieldWithError(i, 'End_date');
        return false;
      }

      if (date.End_date && date.Start_date) {
        const startDate = new Date(date.Start_date);
        const endDate = new Date(date.End_date);

        if (endDate <= startDate) {
          setError(`La fecha final de la fecha ${i + 1} debe ser posterior a la fecha de inicio (incluyendo la hora)`);
          focusDateFieldWithError(i, 'End_date');
          return false;
        }
      }
    }

    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 4) {
      handleNextStep();
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const validImageFiles = Object.values(imageFiles).filter((file): file is File => file !== null);

      await onSubmit(formData, validImageFiles.length > 0 ? validImageFiles : undefined);

      setShowConfirmModal(false);
    } catch (err: any) {

      let errorMessage = 'Error al crear la actividad. Por favor intenta de nuevo.';

      if (err?.response?.status === 409) {
        errorMessage = 'Ya existe una actividad con el mismo nombre';
      } else if (err?.response?.status === 400) {
        if (err?.response?.data?.message) {
          if (Array.isArray(err.response.data.message)) {
            errorMessage = 'Errores de validación: ' + err.response.data.message.join(', ');
          } else {
            errorMessage = err.response.data.message;
          }
        } else {
          errorMessage = 'Los datos enviados son inválidos. Revisa todos los campos.';
        }
      } else if (err?.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Verifica los datos e intenta nuevamente.';
      }

      setError(errorMessage);
      setShowConfirmModal(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="add-activity-form__step-indicator">
      <div className="add-activity-form__progress">
        <div className="add-activity-form__progress-bar">
          <div
            className="add-activity-form__progress-fill"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
        <div className="add-activity-form__steps">
          <div className={`add-activity-form__step ${currentStep >= 1 ? 'add-activity-form__step--active' : ''}`}>
            <div className="add-activity-form__step-number">1</div>
            <div className="add-activity-form__step-label">Información Básica</div>
          </div>
          <div className={`add-activity-form__step ${currentStep >= 2 ? 'add-activity-form__step--active' : ''}`}>
            <div className="add-activity-form__step-number">2</div>
            <div className="add-activity-form__step-label">Detalles</div>
          </div>
          <div className={`add-activity-form__step ${currentStep >= 3 ? 'add-activity-form__step--active' : ''}`}>
            <div className="add-activity-form__step-number">3</div>
            <div className="add-activity-form__step-label">Configuración</div>
          </div>
          <div className={`add-activity-form__step ${currentStep >= 4 ? 'add-activity-form__step--active' : ''}`}>
            <div className="add-activity-form__step-number">4</div>
            <div className="add-activity-form__step-label">Imágenes</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => {
    const shouldShowNameRequired = formData.Name.trim().length < 5;
    const shouldShowDescriptionRequired = formData.Description.trim().length < 20;
    const shouldShowAimRequired = formData.Aim.trim().length < 15;
    const shouldShowLocationRequired = formData.Location.trim().length < 10;

    return (
      <div className="add-activity-form__section">
        <div className="add-activity-form__step-header">
          <div className="add-activity-form__step-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="add-activity-form__step-title">Información Básica</h3>
            <p className="add-activity-form__step-description">
              Proporciona la información fundamental de la actividad
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="Name" className="add-activity-form__label">
            Nombre {shouldShowNameRequired && <span className="add-activity-form__required">campo obligatorio</span>}
          </label>
          <input
            id="Name"
            name="Name"
            type="text"
            required
            minLength={5}
            maxLength={50}
            value={formData.Name}
            onChange={handleChange}
            placeholder="Ingresa el nombre de la actividad"
            className="add-activity-form__input"
          />
          <div className="add-activity-form__field-info">
            <div className="add-activity-form__min-length">Mínimo: 5 caracteres</div>
            <div className={`add-activity-form__character-count ${getCharacterCountClass(formData.Name.length, 50)}`}>
              {formData.Name.length}/50 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Description" className="add-activity-form__label">
            Descripción {shouldShowDescriptionRequired && <span className="add-activity-form__required">campo obligatorio</span>}
          </label>
          <textarea
            id="Description"
            name="Description"
            required
            minLength={20}
            rows={4}
            maxLength={150}
            value={formData.Description}
            onChange={handleChange}
            placeholder="Describe la actividad, su propósito y características principales..."
            className="add-activity-form__input add-activity-form__textarea"
          />
          <div className="add-activity-form__field-info">
            <div className="add-activity-form__min-length">Mínimo: 20 caracteres</div>
            <div className={`add-activity-form__character-count ${getCharacterCountClass(formData.Description.length, 150)}`}>
              {formData.Description.length}/150 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Aim" className="add-activity-form__label">
            Objetivo {shouldShowAimRequired && <span className="add-activity-form__required">campo obligatorio</span>}
          </label>
          <textarea
            id="Aim"
            name="Aim"
            required
            minLength={15}
            rows={4}
            maxLength={350}
            value={formData.Aim}
            onChange={handleChange}
            placeholder="Define el objetivo principal de esta actividad..."
            className="add-activity-form__input add-activity-form__textarea"
          />
          <div className="add-activity-form__field-info">
            <div className="add-activity-form__min-length">Mínimo: 15 caracteres</div>
            <div className={`add-activity-form__character-count ${getCharacterCountClass(formData.Aim.length, 350)}`}>
              {formData.Aim.length}/350 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Location" className="add-activity-form__label">
            Ubicación {shouldShowLocationRequired && <span className="add-activity-form__required">campo obligatorio</span>}
          </label>
          <textarea
            id="Location"
            name="Location"
            required
            minLength={10}
            rows={3}
            maxLength={150}
            value={formData.Location}
            onChange={handleChange}
            placeholder="Ingresa la ubicación donde se realizará la actividad"
            className="add-activity-form__input add-activity-form__textarea"
          />
          <div className="add-activity-form__field-info">
            <div className="add-activity-form__min-length">Mínimo: 10 caracteres</div>
            <div className={`add-activity-form__character-count ${getCharacterCountClass(formData.Location.length, 150)}`}>
              {formData.Location.length}/150 caracteres
            </div>
          </div>
        </div>

        {error && (
          <div className="add-activity-form__error-box">
            <svg className="add-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="add-activity-form__error-text">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    const shouldShowConditionsRequired = formData.Conditions.trim().length < 15;
    const shouldShowObservationsRequired = formData.Observations.trim().length < 15;

    return (
      <div className="add-activity-form__section">
        <div className="add-activity-form__step-header">
          <div className="add-activity-form__step-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <h3 className="add-activity-form__step-title">Detalles de la Actividad</h3>
            <p className="add-activity-form__step-description">
              Especifica las condiciones y observaciones importantes
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="Conditions" className="add-activity-form__label">
            Condiciones {shouldShowConditionsRequired && <span className="add-activity-form__required">campo obligatorio</span>}
          </label>
          <textarea
            id="Conditions"
            name="Conditions"
            required
            minLength={15}
            rows={6}
            maxLength={450}
            value={formData.Conditions}
            onChange={handleChange}
            placeholder="Especifica las condiciones y requisitos para participar en esta actividad..."
            className="add-activity-form__input add-activity-form__textarea"
          />
          <div className="add-activity-form__field-info">
            <div className="add-activity-form__min-length">Mínimo: 15 caracteres</div>
            <div className={`add-activity-form__character-count ${getCharacterCountClass(formData.Conditions.length, 450)}`}>
              {formData.Conditions.length}/450 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Observations" className="add-activity-form__label">
            Observaciones {shouldShowObservationsRequired && <span className="add-activity-form__required">campo obligatorio</span>}
          </label>
          <textarea
            id="Observations"
            name="Observations"
            required
            minLength={15}
            rows={6}
            maxLength={450}
            value={formData.Observations}
            onChange={handleChange}
            placeholder="Agrega observaciones importantes sobre la actividad..."
            className="add-activity-form__input add-activity-form__textarea"
          />
          <div className="add-activity-form__field-info">
            <div className="add-activity-form__min-length">Mínimo: 15 caracteres</div>
            <div className={`add-activity-form__character-count ${getCharacterCountClass(formData.Observations.length, 450)}`}>
              {formData.Observations.length}/450 caracteres
            </div>
          </div>
        </div>

        <div className="add-activity-form__grid">
          <div>
            <label htmlFor="Type_activity" className="add-activity-form__label">
              Tipo de Actividad <span className="add-activity-form__initial-editable">valor inicial editable</span>
            </label>
            <select
              id="Type_activity"
              name="Type_activity"
              className="add-activity-form__select"
              value={formData.Type_activity}
              onChange={handleChange}
              required
            >
              <option value="workshop">Taller</option>
              <option value="conference">Conferencia</option>
              <option value="reforestation">Reforestación</option>
              <option value="garbage_collection">Recolección de Basura</option>
              <option value="cleanup">Limpieza</option>
              <option value="special_event">Evento Especial</option>
              <option value="cultural_event">Evento Cultural</option>
            </select>
          </div>

          <div>
            <label htmlFor="Approach" className="add-activity-form__label">
              Enfoque <span className="add-activity-form__initial-editable">valor inicial editable</span>
            </label>
            <select
              id="Approach"
              name="Approach"
              className="add-activity-form__select"
              value={formData.Approach}
              onChange={handleChange}
              required
            >
              <option value="environmental">Ambiental</option>
              <option value="social">Social</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="add-activity-form__error-box">
            <svg className="add-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="add-activity-form__error-text">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="add-activity-form__section">
        <div className="add-activity-form__step-header">
          <div className="add-activity-form__step-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="add-activity-form__step-title">Configuración Final</h3>
            <p className="add-activity-form__step-description">
              Configura los detalles finales de la actividad
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="Id_project" className="add-activity-form__label">
            Proyecto <span className="add-activity-form__initial-editable">valor inicial editable</span>
          </label>
          <select
            id="Id_project"
            name="Id_project"
            className="add-activity-form__select"
            value={formData.Id_project}
            onChange={handleChange}
            required
          >
            {formData.Id_project === 0 && (
              <option value={0} disabled>Seleccionar proyecto</option>
            )}
            {projects.map((project) => (
              <option key={project.Id_project} value={project.Id_project}>
                {project.Name}
              </option>
            ))}
          </select>
        </div>

        <div className="add-activity-form__grid">
          <div>
            <label htmlFor="IsFavorite" className="add-activity-form__label">
              Tipo Favorito <span className="add-activity-form__initial-editable">opcional</span>
            </label>
            <select
              id="IsFavorite"
              name="IsFavorite"
              className="add-activity-form__select"
              value={formData.IsFavorite || ''}
              onChange={handleChange}
            >
              <option value="">Ninguno</option>
              <option value="school">Escuela</option>
              <option value="condominium">Condominio</option>
            </select>
          </div>

          <div>
            <label htmlFor="Status_activity" className="add-activity-form__label">
              Estado <span className="add-activity-form__initial-editable">valor inicial editable</span>
            </label>
            <select
              id="Status_activity"
              name="Status_activity"
              className="add-activity-form__select"
              value={formData.Status_activity}
              onChange={handleChange}
              required
            >
              <option value="pending">Pendiente</option>
              <option value="planning">Planificación</option>
              <option value="execution">Ejecución</option>
              <option value="suspended">Suspendido</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="Metric_activity" className="add-activity-form__label">
            Tipo de Métrica <span className="add-activity-form__initial-editable">valor inicial editable</span>
          </label>
          <select
            id="Metric_activity"
            name="Metric_activity"
            className="add-activity-form__select"
            value={formData.Metric_activity}
            onChange={handleChange}
            required
          >
            <option value="attendance">Asistencia</option>
            <option value="trees_planted">Árboles Plantados</option>
            <option value="waste_collected">Residuos Recolectados (kg)</option>
          </select>
        </div>

        <div>
          <label htmlFor="Spaces" className="add-activity-form__label">
            Espacios Disponibles <span className="add-activity-form__initial-editable">opcional</span>
          </label>
          
          {!showSpacesField && (
            <button
              type="button"
              onClick={handleToggleSpacesField}
              className="add-activity-form__toggle-field-btn"
              style={{ marginBottom: '0.5rem' }} 
            >
              <Plus size={14} />
              Agregar Campo
            </button>
          )}
          
          {showSpacesField && (
            <div style={{ position: 'relative' }}>
              <input
                id="Spaces"
                name="Spaces"
                type="number"
                className="add-activity-form__input"
                value={formData.Spaces}
                onChange={handleChange}
                min="0"
                placeholder="Número de espacios"
              />
              <button
                type="button"
                onClick={handleToggleSpacesField}
                className="add-activity-form__remove-field-btn"
                title="Quitar campo"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {!showSpacesField && (
            <p className="add-activity-form__help-text" style={{ marginTop: '0.5rem' }}>
              Haz clic en "Agregar Campo" si deseas especificar un límite de espacios
            </p>
          )}
        </div>

        <div className="add-activity-form__checkbox-group">
          <div className="add-activity-form__checkbox-item">
            <input
              type="checkbox"
              id="IsRecurring"
              name="IsRecurring"
              className="add-activity-form__checkbox"
              checked={formData.IsRecurring}
              onChange={handleChange}
            />
            <label htmlFor="IsRecurring" className="add-activity-form__checkbox-label">
              ¿Es una actividad recurrente?
            </label>
          </div>
          {formData.IsRecurring && (
            <p className="add-activity-form__help-text" style={{ color: '#10b981', fontWeight: 500 }}>
              Puedes agregar múltiples fechas
            </p>
          )}
          {!formData.IsRecurring && (
            <p className="add-activity-form__help-text">
              Solo una fecha permitida
            </p>
          )}
        </div>

        <div className="add-activity-form__checkbox-group">
          <div className="add-activity-form__checkbox-item">
            <input
              type="checkbox"
              id="OpenForRegistration"
              name="OpenForRegistration"
              className="add-activity-form__checkbox"
              checked={formData.OpenForRegistration}
              onChange={handleChange}
            />
            <label htmlFor="OpenForRegistration" className="add-activity-form__checkbox-label">
              Abierto a inscripción
            </label>
          </div>
        </div>

        <div className="add-activity-form__checkbox-group">
          <div className="add-activity-form__checkbox-item">
            <input
              type="checkbox"
              id="Active"
              name="Active"
              className="add-activity-form__checkbox"
              checked={formData.Active}
              onChange={handleChange}
            />
            <label htmlFor="Active" className="add-activity-form__checkbox-label">
              Activa
            </label>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <label className="add-activity-form__label" style={{ margin: 0 }}>
              Fechas de la Actividad {formData.dates.some(date => !date.Start_date || !date.End_date) && <span className="add-activity-form__required">campo obligatorio</span>}
            </label>
            <button 
              type="button" 
              onClick={addDate}
              disabled={!formData.IsRecurring && formData.dates.length >= 1}
              className="add-activity-form__add-date-btn"
            >
              <Plus size={16} />
              Agregar Fecha
            </button>
          </div>

          {formData.dates.map((date, index) => {
            let minStartDate = undefined;
            if (index > 0 && formData.dates[index - 1].End_date) {
              minStartDate = formData.dates[index - 1].End_date;
            }

            const isFinished = formData.Status_activity === 'finished';

            return (
              <div key={index} className="add-activity-form__date-item">
                <div style={{ display: 'grid', gridTemplateColumns: isFinished ? '1fr 1fr 1fr auto' : '1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="add-activity-form__sublabel">
                      Fecha Inicio {!date.Start_date && <span className="add-activity-form__required">*</span>}
                    </label>
                    <input
                      type="datetime-local"
                      className="add-activity-form__input"
                      value={date.Start_date}
                      onChange={(e) => handleDateChange(index,'Start_date', e.target.value)}
                      min={minStartDate || undefined}
                      required
                    />
                    {!date.Start_date && (
                      <p className="add-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                        Rellena este campo
                      </p>
                    )}
                    {index > 0 && minStartDate && date.Start_date && (
                      <p className="add-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                        Debe ser desde {new Date(minStartDate).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} en adelante
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="add-activity-form__sublabel">
                      Fecha Fin {!date.End_date && <span className="add-activity-form__required">*</span>}
                    </label>
                    <input
                      type="datetime-local"
                      className="add-activity-form__input"
                      value={date.End_date || ''}
                      onChange={(e) => handleDateChange(index, 'End_date', e.target.value)}
                      min={date.Start_date || undefined}
                      required
                    />
                    {date.Start_date && !date.End_date && (
                      <p className="add-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                        Rellena este campo
                      </p>
                    )}
                    {date.Start_date && date.End_date && (
                      <p className="add-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                        La fecha y hora final debe ser posterior a la de inicio
                      </p>
                    )}
                  </div>
                  {isFinished && (
                    <div>
                      <label className="add-activity-form__sublabel">
                        Valor de Métrica
                      </label>
                      <input
                        type="number"
                        className="add-activity-form__input"
                        value={date.Metric_value ?? 0}
                        onChange={(e) => handleDateChange(index, 'Metric_value', e.target.value)}
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                      <p className="add-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                        {formData.Metric_activity === 'attendance' && 'Asistencia'}
                        {formData.Metric_activity === 'trees_planted' && 'Árboles Plantados'}
                        {formData.Metric_activity === 'waste_collected' && 'Residuos (kg)'}
                      </p>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    {formData.dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDate(index)}
                        className="add-activity-form__remove-date-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="add-activity-form__info-box">
          <svg className="add-activity-form__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="add-activity-form__info-title">
              Acerca del Estado de la Actividad
            </p>
            <p className="add-activity-form__info-text">
              <strong>Activa:</strong> La actividad es visible en la página informativa<br />
              <strong>Inactiva:</strong> La actividad está oculta en la página informativa<br />
            </p>
          </div>
        </div>

        {error && (
          <div className="add-activity-form__error-box">
            <svg className="add-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="add-activity-form__error-text">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => {
    return (
      <div className="add-activity-form__section">
        <div className="add-activity-form__step-header">
          <div className="add-activity-form__step-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="add-activity-form__step-title">Imágenes de la Actividad</h3>
            <p className="add-activity-form__step-description">
              Puedes subir hasta 3 imágenes que representen la actividad. Estas imágenes son opcionales.
            </p>
          </div>
        </div>

        <div className="add-activity-form__image-uploads">
          {['image_1', 'image_2', 'image_3'].map((field, idx) => {
            const previewUrl = imagePreviews[field];

            return (
              <div key={field} className="add-activity-form__image-upload">
                <label className="add-activity-form__image-upload-box">
                  {previewUrl ? (
                    <div className="add-activity-form__image-preview">
                      <img src={previewUrl} alt={`Preview ${idx + 1}`} />
                      <button
                        type="button"
                        className="add-activity-form__image-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          handleImageRemove(field);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="add-activity-form__image-upload-label">
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
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="add-activity-form__image-input"
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
          })}
        </div>

        {error && (
          <div className="add-activity-form__error-box">
            <svg className="add-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="add-activity-form__error-text">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loadingProjects) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <p style={{ textAlign: 'center', padding: '40px' }}>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Crear Nueva Actividad</h2>
          <button className="btn-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} id="add-activity-form" noValidate>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="add-activity-form__step-actions">
            {currentStep === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="add-activity-form__cancel-btn"
                  ref={cancelButtonRef}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="add-activity-form__next-btn"
                  ref={nextButtonRef}
                >
                  Siguiente: Detalles
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            ) : currentStep === 2 ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="add-activity-form__cancel-btn"
                  ref={cancelButtonRef}
                >
                  Cancelar
                </button>
                <div className="add-activity-form__navigation-buttons">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="add-activity-form__back-btn"
                    ref={prevButtonRef}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior: Información Básica
                  </button>
                  <button
                    type="submit"
                    className="add-activity-form__next-btn"
                    ref={nextButtonRef}
                  >
                    Siguiente: Configuración
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            ) : currentStep === 3 ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="add-activity-form__cancel-btn"
                  ref={cancelButtonRef}
                >
                  Cancelar
                </button>
                <div className="add-activity-form__navigation-buttons">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="add-activity-form__back-btn"
                    ref={prevButtonRef}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior: Detalles
                  </button>
                  <button
                    type="submit"
                    className="add-activity-form__next-btn"
                    ref={nextButtonRef}
                  >
                    Siguiente: Imágenes
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="add-activity-form__cancel-btn"
                  ref={cancelButtonRef}
                >
                  Cancelar
                </button>
                <div className="add-activity-form__navigation-buttons">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="add-activity-form__back-btn"
                    ref={prevButtonRef}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior: Configuración
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`add-activity-form__submit-btn ${isLoading ? 'add-activity-form__submit-btn--loading' : ''}`}
                    ref={nextButtonRef}
                  >
                    {isLoading ? (
                      <>
                        <svg className="add-activity-form__loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Creando...
                      </>
                    ) : (
                      'Crear Actividad'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>

        <ConfirmationModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSubmit}
          title="Confirmar Creación de Actividad"
          message={`¿Estás seguro de que deseas crear la actividad "${formData.Name}"?`}
          confirmText="Crear Actividad"
          cancelText="Cancelar"
          type="info"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AddActivityForm;