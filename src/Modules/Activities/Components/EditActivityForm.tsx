import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Activity, UpdateActivityDto } from '../Services/ActivityService';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/EditActivityForm.css';

interface EditActivityFormProps {
  activity: Activity;
  onSubmit: (id: number, data: UpdateActivityDto, images?: { [key: string]: File }) => void;
  onCancel: () => void;
}

const getCharacterCountClass = (currentLength: number, maxLength: number) => {
  if (currentLength >= maxLength) {
    return 'edit-activity-form__character-count--error';
  } else if (currentLength >= maxLength - 10) {
    return 'edit-activity-form__character-count--warning';
  }
  return '';
};

const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
};

const getProxyImageUrl = (url: string): string => {
  if (!url) return '';

  if (url.startsWith('blob:')) return url;

  if (url.includes('/images/proxy')) return url;

  if (url.includes('drive.google.com')) {
    return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
};

const EditActivityForm: React.FC<EditActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState<Array<{ Id_project: number; Name: string }>>([]);
  const [showSpacesField, setShowSpacesField] = useState(!!activity.Spaces && activity.Spaces > 0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const modalContentRef = React.useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState<UpdateActivityDto>({
    Name: activity.Name,
    Description: activity.Description,
    Conditions: activity.Conditions,
    Observations: activity.Observations,
    IsRecurring: activity.IsRecurring,
    IsFavorite: activity.IsFavorite,
    OpenForRegistration: activity.OpenForRegistration,
    Type_activity: activity.Type_activity,
    Approach: activity.Approach,
    Spaces: activity.Spaces || 0,
    Location: activity.Location,
    Aim: activity.Aim,
    Metric_activity: activity.Metric_activity,
    dateActivities: (activity.dateActivities || [])
      .sort((a, b) => new Date(a.Start_date).getTime() - new Date(b.Start_date).getTime())
      .map(date => {
        const metricForDate = activity.metric_value?.find(
          mv => mv.dateActivity?.Id_dateActivity === date.Id_dateActivity
        );
        return {
          ...date,
          Metric_value: metricForDate?.Value ?? 0
        };
      })
  });

  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({
    image_1: null,
    image_2: null,
    image_3: null
  });
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string | null }>({
    image_1: activity.url1 ? getProxyImageUrl(activity.url1) : null,
    image_2: activity.url2 ? getProxyImageUrl(activity.url2) : null,
    image_3: activity.url3 ? getProxyImageUrl(activity.url3) : null
  });
  const [imageActions, setImageActions] = useState<{ [key: string]: 'keep' | 'replace' | 'delete' | 'add' }>(() => {
    const initialActions: { [key: string]: 'keep' } = {};
    if (activity.url1) initialActions.image_1 = 'keep';
    if (activity.url2) initialActions.image_2 = 'keep';
    if (activity.url3) initialActions.image_3 = 'keep';
    return initialActions;
  });

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
      } catch (error) {
        // Error al cargar proyectos
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!formData.IsRecurring && (formData.dateActivities?.length || 0) > 1) {
      setFormData(prev => ({
        ...prev,
        dateActivities: prev.dateActivities ? [prev.dateActivities[0]] : []
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const activeElement = document.activeElement;
        const formElement = document.getElementById('edit-activity-form');

        if (formElement) {
          const focusableElements = Array.from(
            formElement.querySelectorAll(
              'input:not([disabled]):not([type="file"]), select:not([disabled]), textarea:not([disabled])'
            )
          ).filter(el => {
            const parent = (el as HTMLElement).closest('.edit-activity-form__step-actions');
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
    
    if (error) setError('');

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
    const fieldIndex = field.split('_')[1];
    const urlKey = `url${fieldIndex}` as 'url1' | 'url2' | 'url3';
    const existingUrl = activity[urlKey];

    const action = existingUrl ? 'replace' : 'add';

    setImageActions(prev => ({
      ...prev,
      [field]: action
    }));

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
    const fieldIndex = field.split('_')[1];
    const urlKey = `url${fieldIndex}` as 'url1' | 'url2' | 'url3';

    if (activity[urlKey]) {
      setImageActions(prev => ({
        ...prev,
        [field]: 'delete'
      }));
    } else {
      setImageActions(prev => {
        const newActions = { ...prev };
        delete newActions[field];
        return newActions;
      });
    }

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
    const updatedDates = [...(formData.dateActivities || [])];

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

    setFormData({ ...formData, dateActivities: updatedDates });
  };

  const addDate = () => {
    if (!formData.IsRecurring) {
      setError('Para agregar múltiples fechas, marca la actividad como recurrente');
      return;
    }
    const newDate = { Start_date: '', End_date: '', Metric_value: 0 };
    setFormData({
      ...formData,
      dateActivities: [...(formData.dateActivities || []), newDate]
    });
  };

  const removeDate = (index: number) => {
    const updatedDates = (formData.dateActivities || []).filter((_, i) => i !== index);
    setFormData({ ...formData, dateActivities: updatedDates });
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
      const dateContainers = document.querySelectorAll('.edit-activity-form__date-item');
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
    if (!formData.Name || formData.Name?.trim().length === 0) {
      setError('El campo "Nombre" es obligatorio.');
      focusFieldWithError('Name');
      return false;
    }
    if (formData.Name?.trim().length < 5) {
      setError('El campo "Nombre" debe tener al menos 5 caracteres.');
      focusFieldWithError('Name');
      return false;
    }

    if (!formData.Description || formData.Description?.trim().length === 0) {
      setError('El campo "Descripción" es obligatorio.');
      focusFieldWithError('Description');
      return false;
    }
    if (formData.Description?.trim().length < 20) {
      setError('El campo "Descripción" debe tener al menos 20 caracteres.');
      focusFieldWithError('Description');
      return false;
    }

    if (!formData.Aim || formData.Aim?.trim().length === 0) {
      setError('El campo "Objetivo" es obligatorio.');
      focusFieldWithError('Aim');
      return false;
    }
    if (formData.Aim?.trim().length < 15) {
      setError('El campo "Objetivo" debe tener al menos 15 caracteres.');
      focusFieldWithError('Aim');
      return false;
    }

    if (!formData.Location || formData.Location?.trim().length === 0) {
      setError('El campo "Ubicación" es obligatorio.');
      focusFieldWithError('Location');
      return false;
    }
    if (formData.Location?.trim().length < 10) {
      setError('El campo "Ubicación" debe tener al menos 10 caracteres.');
      focusFieldWithError('Location');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.Conditions || formData.Conditions?.trim().length === 0) {
      setError('El campo "Condiciones" es obligatorio.');
      focusFieldWithError('Conditions');
      return false;
    }
    if (formData.Conditions?.trim().length < 15) {
      setError('El campo "Condiciones" debe tener al menos 15 caracteres.');
      focusFieldWithError('Conditions');
      return false;
    }

    if (!formData.Observations || formData.Observations?.trim().length === 0) {
      setError('El campo "Observaciones" es obligatorio.');
      focusFieldWithError('Observations');
      return false;
    }
    if (formData.Observations?.trim().length < 15) {
      setError('El campo "Observaciones" debe tener al menos 15 caracteres.');
      focusFieldWithError('Observations');
      return false;
    }

    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.dateActivities || formData.dateActivities.length === 0 || !formData.dateActivities[0]?.Start_date) {
      setError('Por favor ingresa al menos una fecha de inicio');
      focusDateFieldWithError(0, 'Start_date');
      return false;
    }
    if (!formData.IsRecurring && (formData.dateActivities?.length || 0) > 1) {
      setError('Las actividades no recurrentes solo pueden tener una fecha');
      return false;
    }

    for (let i = 0; i < formData.dateActivities.length; i++) {
      const date = formData.dateActivities[i];

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
      const cleanedDates = formData.dateActivities?.map(date => ({
        Id_dateActivity: date.Id_dateActivity,
        Start_date: new Date(date.Start_date).toISOString(),
        End_date: date.End_date ? new Date(date.End_date).toISOString() : undefined
      }));

      const metricValues: { Id_activity_value?: number; Value: number; Id_dateActivity?: number }[] = [];

      formData.dateActivities?.forEach((date) => {
        if (date.Id_dateActivity) {
          const existingMetric = activity.metric_value?.find(
            mv => mv.dateActivity?.Id_dateActivity === date.Id_dateActivity
          );

          const metricValue = date.Metric_value !== undefined ? Number(date.Metric_value) : 0;

          if (metricValue > 0 || existingMetric) {
            metricValues.push({
              Id_activity_value: existingMetric?.Id_activity_value,
              Value: metricValue,
              Id_dateActivity: date.Id_dateActivity
            });
          }
        }
      });

      const updateData: UpdateActivityDto = {
        ...formData,
        dateActivities: cleanedDates,
        metricValues: metricValues.length > 0 ? metricValues : undefined
      };

      // Agregar acciones de imágenes al updateData (url1_action, url2_action, url3_action)
      const imageFieldsMap = {
        image_1: 'url1',
        image_2: 'url2',
        image_3: 'url3'
      };

      Object.entries(imageFieldsMap).forEach(([imageKey, urlKey]) => {
        const action = imageActions[imageKey];
        if (action) {
          // @ts-ignore - Las acciones se agregarán dinámicamente
          updateData[`${urlKey}_action`] = action;
        }
      });

      const imageFilesForBackend: { [key: string]: File } = {};
      Object.entries(imageFiles).forEach(([key, file]) => {
        if (file) {
          const index = key.split('_')[1];
          imageFilesForBackend[`url${index}_file`] = file;
        }
      });

      await onSubmit(
        activity.Id_activity,
        updateData,
        Object.keys(imageFilesForBackend).length > 0 ? imageFilesForBackend : undefined
      );
      setShowConfirmModal(false);
    } catch (err: any) {
      let errorMessage = 'Error al actualizar la actividad. Por favor intenta de nuevo.';

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
    <div className="edit-activity-form__progress">
      <div className="edit-activity-form__progress-bar">
        <div
          className="edit-activity-form__progress-fill"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
      </div>
      <div className="edit-activity-form__steps">
        <div className={`edit-activity-form__step ${currentStep >= 1 ? 'edit-activity-form__step--active' : ''}`}>
          <div className="edit-activity-form__step-number">1</div>
          <div className="edit-activity-form__step-label">Información Básica</div>
        </div>
        <div className={`edit-activity-form__step ${currentStep >= 2 ? 'edit-activity-form__step--active' : ''}`}>
          <div className="edit-activity-form__step-number">2</div>
          <div className="edit-activity-form__step-label">Detalles</div>
        </div>
        <div className={`edit-activity-form__step ${currentStep >= 3 ? 'edit-activity-form__step--active' : ''}`}>
          <div className="edit-activity-form__step-number">3</div>
          <div className="edit-activity-form__step-label">Configuración</div>
        </div>
        <div className={`edit-activity-form__step ${currentStep >= 4 ? 'edit-activity-form__step--active' : ''}`}>
          <div className="edit-activity-form__step-number">4</div>
          <div className="edit-activity-form__step-label">Imágenes</div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => {
    const hasInitialName = activity.Name && activity.Name.trim() !== '';
    const hasInitialDescription = activity.Description && activity.Description.trim() !== '';
    const hasInitialAim = activity.Aim && activity.Aim.trim() !== '';
    const hasInitialLocation = activity.Location && activity.Location.trim() !== '';

    const showNameRequired = hasInitialName ? (formData.Name || '').trim().length < 5 : (formData.Name || '').trim().length < 5;
    const showDescriptionRequired = hasInitialDescription ? (formData.Description || '').trim().length < 20 : (formData.Description || '').trim().length < 20;
    const showAimRequired = hasInitialAim ? (formData.Aim || '').trim().length < 15 : (formData.Aim || '').trim().length < 15;
    const showLocationRequired = hasInitialLocation ? (formData.Location || '').trim().length < 10 : (formData.Location || '').trim().length < 10;

    return (
    <div className="edit-activity-form__step-content">
      <div className="edit-activity-form__step-header">
        <div className="edit-activity-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Información Básica de la Actividad</h3>
          <p className="edit-activity-form__step-description">
            Actualiza la información fundamental de la actividad
          </p>
        </div>
      </div>

      <div className="edit-activity-form__fields">
        <div>
          <label htmlFor="Name" className="edit-activity-form__label">
            Nombre{' '}
            {hasInitialName && !showNameRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showNameRequired && (
              <span className="edit-activity-form__required">campo obligatorio</span>
            )}
          </label>
          <input
            id="Name"
            name="Name"
            type="text"
            required
            minLength={5}
            maxLength={50}
            value={formData.Name || ''}
            onChange={handleChange}
            placeholder="Ingresa el nombre de la actividad"
            className="edit-activity-form__input"
          />
          <div className="edit-activity-form__field-info">
            <div className="edit-activity-form__min-length">Mínimo: 5 caracteres</div>
            <div className={`edit-activity-form__character-count ${getCharacterCountClass((formData.Name || '').length, 50)}`}>
              {(formData.Name || '').length}/50 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Description" className="edit-activity-form__label">
            Descripción{' '}
            {hasInitialDescription && !showDescriptionRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showDescriptionRequired && (
              <span className="edit-activity-form__required">campo obligatorio</span>
            )}
          </label>
          <textarea
            id="Description"
            name="Description"
            required
            minLength={20}
            rows={4}
            maxLength={150}
            value={formData.Description || ''}
            onChange={handleChange}
            placeholder="Describe la actividad, su propósito y características principales..."
            className="edit-activity-form__input edit-activity-form__input--textarea"
          />
          <div className="edit-activity-form__field-info">
            <div className="edit-activity-form__min-length">Mínimo: 20 caracteres</div>
            <div className={`edit-activity-form__character-count ${getCharacterCountClass((formData.Description || '').length, 150)}`}>
              {(formData.Description || '').length}/150 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Aim" className="edit-activity-form__label">
            Objetivo{' '}
            {hasInitialAim && !showAimRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showAimRequired && (
              <span className="edit-activity-form__required">campo obligatorio</span>
            )}
          </label>
          <textarea
            id="Aim"
            name="Aim"
            required
            minLength={15}
            rows={4}
            maxLength={350}
            value={formData.Aim || ''}
            onChange={handleChange}
            placeholder="Define el objetivo principal de esta actividad..."
            className="edit-activity-form__input edit-activity-form__input--textarea"
          />
          <div className="edit-activity-form__field-info">
            <div className="edit-activity-form__min-length">Mínimo: 15 caracteres</div>
            <div className={`edit-activity-form__character-count ${getCharacterCountClass((formData.Aim || '').length, 350)}`}>
              {(formData.Aim || '').length}/350 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Location" className="edit-activity-form__label">
            Ubicación{' '}
            {hasInitialLocation && !showLocationRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showLocationRequired && (
              <span className="edit-activity-form__required">campo obligatorio</span>
            )}
          </label>
          <textarea
            id="Location"
            name="Location"
            required
            minLength={10}
            rows={3}
            maxLength={150}
            value={formData.Location || ''}
            onChange={handleChange}
            placeholder="Ingresa la ubicación donde se realizará la actividad"
            className="edit-activity-form__input edit-activity-form__input--textarea"
          />
          <div className="edit-activity-form__field-info">
            <div className="edit-activity-form__min-length">Mínimo: 10 caracteres</div>
            <div className={`edit-activity-form__character-count ${getCharacterCountClass((formData.Location || '').length, 150)}`}>
              {(formData.Location || '').length}/150 caracteres
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="edit-activity-form__error-box">
          <svg className="edit-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="edit-activity-form__error-text">
            {error}
          </p>
        </div>
      )}

      <div className="edit-activity-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-activity-form__cancel-btn"
          ref={cancelButtonRef}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="edit-activity-form__next-btn"
          ref={nextButtonRef}
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

  const renderStep2 = () => {
    const hasInitialConditions = activity.Conditions && activity.Conditions.trim() !== '';
    const hasInitialObservations = activity.Observations && activity.Observations.trim() !== '';

    const showConditionsRequired = hasInitialConditions ? (formData.Conditions || '').trim().length < 15 : (formData.Conditions || '').trim().length < 15;
    const showObservationsRequired = hasInitialObservations ? (formData.Observations || '').trim().length < 15 : (formData.Observations || '').trim().length < 15;

    return (
    <div className="edit-activity-form__step-content">
      <div className="edit-activity-form__step-header">
        <div className="edit-activity-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Detalles de la Actividad</h3>
          <p className="edit-activity-form__step-description">
            Actualiza las condiciones y observaciones
          </p>
        </div>
      </div>

      <div className="edit-activity-form__fields">
        <div>
          <label htmlFor="Conditions" className="edit-activity-form__label">
            Condiciones{' '}
            {hasInitialConditions && !showConditionsRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showConditionsRequired && (
              <span className="edit-activity-form__required">campo obligatorio</span>
            )}
          </label>
          <textarea
            id="Conditions"
            name="Conditions"
            required
            minLength={15}
            rows={6}
            maxLength={450}
            value={formData.Conditions || ''}
            onChange={handleChange}
            placeholder="Especifica las condiciones y requisitos para participar en esta actividad..."
            className="edit-activity-form__input edit-activity-form__input--textarea"
          />
          <div className="edit-activity-form__field-info">
            <div className="edit-activity-form__min-length">Mínimo: 15 caracteres</div>
            <div className={`edit-activity-form__character-count ${getCharacterCountClass((formData.Conditions || '').length, 450)}`}>
              {(formData.Conditions || '').length}/450 caracteres
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="Observations" className="edit-activity-form__label">
            Observaciones{' '}
            {hasInitialObservations && !showObservationsRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showObservationsRequired && (
              <span className="edit-activity-form__required">campo obligatorio</span>
            )}
          </label>
          <textarea
            id="Observations"
            name="Observations"
            required
            minLength={15}
            rows={6}
            maxLength={450}
            value={formData.Observations || ''}
            onChange={handleChange}
            placeholder="Agrega observaciones importantes sobre la actividad..."
            className="edit-activity-form__input edit-activity-form__input--textarea"
          />
          <div className="edit-activity-form__field-info">
            <div className="edit-activity-form__min-length">Mínimo: 15 caracteres</div>
            <div className={`edit-activity-form__character-count ${getCharacterCountClass((formData.Observations || '').length, 450)}`}>
              {(formData.Observations || '').length}/450 caracteres
            </div>
          </div>
        </div>

        <div className="edit-activity-form__row">
          <div>
            <label htmlFor="Type_activity" className="edit-activity-form__label">
              Tipo de Actividad <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            </label>
            <select
              id="Type_activity"
              name="Type_activity"
              className="edit-activity-form__input edit-activity-form__input--select"
              value={formData.Type_activity || ''}
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
            <label htmlFor="Approach" className="edit-activity-form__label">
              Enfoque <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            </label>
            <select
              id="Approach"
              name="Approach"
              className="edit-activity-form__input edit-activity-form__input--select"
              value={formData.Approach || ''}
              onChange={handleChange}
              required
            >
              <option value="environmental">Ambiental</option>
              <option value="social">Social</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="edit-activity-form__error-box">
          <svg className="edit-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="edit-activity-form__error-text">
            {error}
          </p>
        </div>
      )}

      <div className="edit-activity-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-activity-form__cancel-btn"
          ref={cancelButtonRef}
        >
          Cancelar
        </button>
        <div className="edit-activity-form__navigation-buttons">
          <button
            type="button"
            onClick={handlePrevStep}
            className="edit-activity-form__back-btn"
            ref={prevButtonRef}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior: Información Básica
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="edit-activity-form__next-btn"
            ref={nextButtonRef}
          >
            Siguiente: Configuración
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    );
  };
const renderStep3 = () => (
    <div className="edit-activity-form__step-content">
      <div className="edit-activity-form__step-header">
        <div className="edit-activity-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Configuración Final</h3>
          <p className="edit-activity-form__step-description">
            Configura los detalles finales de la actividad
          </p>
        </div>
      </div>

      <div className="edit-activity-form__fields">
        <div>
          <label htmlFor="Id_project" className="edit-activity-form__label">
            Proyecto <span className="edit-activity-form__initial-editable">valor inicial editable</span>
          </label>
          <select
            id="Id_project"
            name="Id_project"
            className="edit-activity-form__input edit-activity-form__input--select"
            value={activity.project?.Id_project || 0}
            onChange={(e) => {
              // Project selection logic can be added here if needed
            }}
            required
          >
            {projects.map((project) => (
              <option key={project.Id_project} value={project.Id_project}>
                {project.Name}
              </option>))}
          </select>
          <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Nota: El proyecto actual es "{activity.project?.Name || 'Sin proyecto'}". Cambiar el proyecto puede afectar las métricas asociadas.
          </p>
        </div>

        <div className="edit-activity-form__row">
          <div>
            <label htmlFor="IsFavorite" className="edit-activity-form__label">
              Tipo Favorito <span className="edit-activity-form__optional">opcional</span>
            </label>
            <select
              id="IsFavorite"
              name="IsFavorite"
              className="edit-activity-form__input edit-activity-form__input--select"
              value={formData.IsFavorite || ''}
              onChange={handleChange}
            >
              <option value="">Ninguno</option>
              <option value="school">Escuela</option>
              <option value="condominium">Condominio</option>
            </select>
          </div>

          <div>
            <label htmlFor="Metric_activity" className="edit-activity-form__label">
              Tipo de Métrica <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            </label>
            <select
              id="Metric_activity"
              name="Metric_activity"
              className="edit-activity-form__input edit-activity-form__input--select"
              value={formData.Metric_activity || ''}
              onChange={handleChange}
              required
            >
              <option value="attendance">Asistencia</option>
              <option value="trees_planted">Árboles Plantados</option>
              <option value="waste_collected">Residuos Recolectados (kg)</option>
            </select>
          </div>
        </div>

        <div className="edit-activity-form__row">
          <div>
            <label htmlFor="Spaces" className="edit-activity-form__label">
              Espacios Disponibles <span className="edit-activity-form__optional">opcional</span>
            </label>
            
            {!showSpacesField && (
              <button
                type="button"
                onClick={handleToggleSpacesField}
                className="edit-activity-form__toggle-field-btn"
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
                  className="edit-activity-form__input"
                  value={formData.Spaces || 0}
                  onChange={handleChange}
                  min="0"
                  placeholder="Número de espacios"
                />
                <button
                  type="button"
                  onClick={handleToggleSpacesField}
                  className="edit-activity-form__remove-field-btn"
                  title="Quitar campo"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {!showSpacesField && (
              <p className="edit-activity-form__help-text" style={{ marginTop: '0.5rem' }}>
                Haz clic en "Agregar Campo" si deseas especificar un límite de espacios
              </p>
            )}
          </div>
        </div>

        <div className="edit-activity-form__checkbox-group">
          <div className="edit-activity-form__checkbox-item">
            <input
              type="checkbox"
              id="IsRecurring"
              name="IsRecurring"
              className="edit-activity-form__checkbox"
              checked={formData.IsRecurring || false}
              onChange={handleChange}
            />
            <label htmlFor="IsRecurring" className="edit-activity-form__checkbox-label">
              ¿Es una actividad recurrente?
            </label>
          </div>
          {formData.IsRecurring && (
            <p className="edit-activity-form__help-text" style={{ color: '#10b981', fontWeight: 500 }}>
              Puedes agregar múltiples fechas
            </p>
          )}
          {!formData.IsRecurring && (
            <p className="edit-activity-form__help-text">
              Solo una fecha permitida
            </p>
          )}
        </div>

        <div className="edit-activity-form__checkbox-group">
          <div className="edit-activity-form__checkbox-item">
            <input
              type="checkbox"
              id="OpenForRegistration"
              name="OpenForRegistration"
              className="edit-activity-form__checkbox"
              checked={formData.OpenForRegistration || false}
              onChange={handleChange}
            />
            <label htmlFor="OpenForRegistration" className="edit-activity-form__checkbox-label">
              Abierto a inscripción
            </label>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <label className="edit-activity-form__label" style={{ margin: 0 }}>
              Fechas de la Actividad{' '}
              {formData.dateActivities && formData.dateActivities.length > 0 &&
               formData.dateActivities.some(date => !date.Start_date || !date.End_date) ? (
                <span className="edit-activity-form__required">campo obligatorio</span>
              ) : formData.dateActivities && formData.dateActivities.length > 0 ? (
                <span className="edit-activity-form__initial-editable">valor inicial editable</span>
              ) : (
                <span className="edit-activity-form__required">campo obligatorio</span>
              )}
            </label>
            <button
              type="button"
              onClick={addDate}
              disabled={!formData.IsRecurring && (formData.dateActivities?.length || 0) >= 1}
              className="edit-activity-form__add-date-btn"
            >
              <Plus size={16} />
              Agregar Fecha
            </button>
          </div>

          {(formData.dateActivities || []).map((date, index) => {
            // Calcular la fecha mínima de inicio basada en la fecha final anterior
            let minStartDate = undefined;
            if (index > 0 && formData.dateActivities && formData.dateActivities[index - 1].End_date) {
              minStartDate = formData.dateActivities[index - 1].End_date;
            }

            return (
            <div key={index} className="edit-activity-form__date-item">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="edit-activity-form__sublabel">
                    Fecha Inicio {!date.Start_date && <span className="edit-activity-form__required">*</span>}
                  </label>
                  <input
                    type="datetime-local"
                    className="edit-activity-form__input"
                    value={formatDateForInput(date.Start_date)}
                    onChange={(e) => handleDateChange(index, 'Start_date', e.target.value)}
                    min={minStartDate ? formatDateForInput(minStartDate) : undefined}
                    required
                  />
                  {!date.Start_date && (
                    <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                      Rellena este campo
                    </p>
                  )}
                  {index > 0 && minStartDate && date.Start_date && (
                    <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
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
                  <label className="edit-activity-form__sublabel">
                    Fecha Fin {!date.End_date && <span className="edit-activity-form__required">*</span>}
                  </label>
                  <input
                    type="datetime-local"
                    className="edit-activity-form__input"
                    value={formatDateForInput(date.End_date)}
                    onChange={(e) => handleDateChange(index, 'End_date', e.target.value)}
                    min={formatDateForInput(date.Start_date) || undefined}
                    required
                  />
                  {date.Start_date && !date.End_date && (
                    <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                      Rellena este campo
                    </p>
                  )}
                  {date.Start_date && date.End_date && (
                    <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                      La fecha y hora final debe ser posterior a la de inicio
                    </p>
                  )}
                </div>
                <div>
                  <label className="edit-activity-form__sublabel">
                    Valor de Métrica
                  </label>
                  <input
                    type="number"
                    className="edit-activity-form__input"
                    value={date.Metric_value ?? 0}
                    onChange={(e) => handleDateChange(index, 'Metric_value', e.target.value)}
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                  <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                    {formData.Metric_activity === 'attendance' && 'Asistencia'}
                    {formData.Metric_activity === 'trees_planted' && 'Árboles Plantados'}
                    {formData.Metric_activity === 'waste_collected' && 'Residuos (kg)'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {(formData.dateActivities || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDate(index)}
                      className="edit-activity-form__remove-date-btn"
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

        <div className="edit-activity-form__info-box">
          <svg className="edit-activity-form__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="edit-activity-form__info-title">
              Información Importante
            </p>
            <p className="edit-activity-form__info-text">
              El <strong>Estado de la Actividad</strong> y el <strong>Estado Activo/Inactivo</strong> se gestionan mediante botones dedicados en la tabla de actividades.<br />
              Puedes cambiarlos fácilmente desde la vista principal sin necesidad de editar el formulario.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="edit-activity-form__error-box">
          <svg className="edit-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="edit-activity-form__error-text">
            {error}
          </p>
        </div>
      )}

      <div className="edit-activity-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-activity-form__cancel-btn"
          ref={cancelButtonRef}
        >
          Cancelar
        </button>
        <div className="edit-activity-form__navigation-buttons">
          <button
            type="button"
            onClick={handlePrevStep}
            className="edit-activity-form__back-btn"
            ref={prevButtonRef}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior: Detalles
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="edit-activity-form__next-btn"
            ref={nextButtonRef}
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

  const renderStep4 = () => (
    <div className="edit-activity-form__step-content">
      <div className="edit-activity-form__step-header">
        <div className="edit-activity-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Imágenes de la Actividad</h3>
          <p className="edit-activity-form__step-description">
            Actualiza las imágenes de la actividad (máximo 3 imágenes opcionales)
          </p>
        </div>
      </div>

      <div className="edit-activity-form__image-grid">
        {['image_1', 'image_2', 'image_3'].map((field, idx) => {
          const previewUrl = imagePreviews[field];
          const hasImage = previewUrl !== null;
          const isNewFile = imageFiles[field] !== null;

          return (
            <div key={field} className="edit-activity-form__image-upload">
              <div
                className="edit-activity-form__image-upload-box"
                onClick={() => {
                  if (!hasImage) {
                    const input = document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
                    input?.click();
                  }
                }}
                style={{ cursor: hasImage ? 'default' : 'pointer' }}
              >
                {hasImage ? (
                  <div className="edit-activity-form__image-preview">
                    <img src={previewUrl} alt={`Preview ${idx + 1}`} crossOrigin="anonymous" />
                    <button
                      type="button"
                      className="edit-activity-form__image-delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleImageRemove(field);
                      }}
                      title="Eliminar imagen"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="edit-activity-form__image-replace-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const input = document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
                        input?.click();
                      }}
                      title="Reemplazar imagen"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="edit-activity-form__image-upload-label">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agregar imagen {idx + 1}</span>
                  </div>
                )}
                <input
                  type="file"
                  name={field}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="edit-activity-form__image-input"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.type.startsWith('image/')) {
                        alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, etc.)');
                        return;
                      }
                      handleImageChange(field, file);
                    }
                  }}
                />
              </div>
              <div className="edit-activity-form__image-field-info">
                <span className="edit-activity-form__image-field-name">Imagen {idx + 1}</span>
                {isNewFile && (
                  <span className="edit-activity-form__image-new-indicator">
                    {activity[`url${idx + 1}` as 'url1' | 'url2' | 'url3'] ? 'Reemplazando' : 'Nueva imagen'}
                  </span>
                )}
                {!hasImage && !isNewFile && (
                  <span className="edit-activity-form__image-new-indicator" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                    Vacío
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="edit-activity-form__images-note">
        <p>💡 <strong>Nota:</strong> Puedes agregar, reemplazar o eliminar imágenes de forma independiente:</p>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li><strong>Agregar:</strong> Click en un campo vacío para subir una nueva imagen</li>
          <li><strong>Reemplazar:</strong> Click en el ícono de actualizar sobre una imagen existente</li>
          <li><strong>Eliminar:</strong> Click en el ícono de basura sobre una imagen existente</li>
          <li><strong>Mantener:</strong> Las imágenes sin modificar se conservarán automáticamente</li>
        </ul>
      </div>

      {error && (
        <div className="edit-activity-form__error-box">
          <svg className="edit-activity-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="edit-activity-form__error-text">
            {error}
          </p>
        </div>
      )}

      <div className="edit-activity-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-activity-form__cancel-btn"
          ref={cancelButtonRef}
        >
          Cancelar
        </button>
        <div className="edit-activity-form__navigation-buttons">
          <button
            type="button"
            onClick={handlePrevStep}
            className="edit-activity-form__back-btn"
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
            className={`edit-activity-form__submit-btn ${isLoading ? 'edit-activity-form__submit-btn--loading' : ''}`}
            ref={nextButtonRef}
          >
            {isLoading ? (
              <>
                <svg className="edit-activity-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </>
            ) : (
              'Actualizar Actividad'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Actividad</h2>
          <button className="btn-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} id="edit-activity-form" noValidate>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </form>

        <ConfirmationModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSubmit}
          title="Confirmar Actualización de Actividad"
          message={`¿Estás seguro de que deseas actualizar la actividad "${formData.Name}"?`}
          confirmText="Actualizar Actividad"
          cancelText="Cancelar"
          type="info"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default EditActivityForm;