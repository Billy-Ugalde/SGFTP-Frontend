import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Info, FileText, ClipboardList, Settings, Image, Wrench, Mic, Leaf, Sparkles, Star, Music, Users, BookOpen, Clock, Zap, PauseCircle, CheckCircle2, GraduationCap, Building2 } from 'lucide-react';
import type { Activity, UpdateActivityDto } from '../Services/ActivityService';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';
import ConfirmationModal from './ConfirmationModal';
import ActivityFormDropdown from './ActivityFormDropdown';
import '../Styles/EditActivityForm.css';

const TYPE_ACTIVITY_OPTIONS = [
  { value: 'workshop', label: 'Taller', icon: <Wrench size={14} /> },
  { value: 'conference', label: 'Conferencia', icon: <Mic size={14} /> },
  { value: 'reforestation', label: 'Reforestación', icon: <Leaf size={14} /> },
  { value: 'garbage_collection', label: 'Recolección de Basura', icon: <Trash2 size={14} /> },
  { value: 'cleanup', label: 'Limpieza', icon: <Sparkles size={14} /> },
  { value: 'special_event', label: 'Evento Especial', icon: <Star size={14} /> },
  { value: 'cultural_event', label: 'Evento Cultural', icon: <Music size={14} /> },
];

const APPROACH_OPTIONS = [
  { value: 'environmental', label: 'Ambiental', icon: <Leaf size={14} /> },
  { value: 'social', label: 'Social', icon: <Users size={14} /> },
  { value: 'cultural', label: 'Cultural', icon: <BookOpen size={14} /> },
];

const IS_FAVORITE_OPTIONS = [
  { value: '', label: 'Ninguno' },
  { value: 'school', label: 'Escuela', icon: <GraduationCap size={14} /> },
  { value: 'condominium', label: 'Condominio', icon: <Building2 size={14} /> },
];

const METRIC_ACTIVITY_OPTIONS = [
  { value: 'attendance', label: 'Asistencia', icon: <Users size={14} /> },
  { value: 'trees_planted', label: 'Árboles Plantados', icon: <Leaf size={14} /> },
  { value: 'waste_collected', label: 'Residuos Recolectados (kg)', icon: <Trash2 size={14} /> },
];

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
  if (!/^https?:\/\//i.test(url)) {
    const path = url.startsWith('/') ? url.slice(1) : url;
    return `${API_BASE_URL.replace(/\/+$/, '')}/${path}`;
  }
  return url;
};

const EditActivityForm: React.FC<EditActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState<Array<{ Id_project: number; Name: string }>>([]);
  const [showSpacesField, setShowSpacesField] = useState(!!activity.Spaces && activity.Spaces > 0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
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

  const handleSelectChange = (name: string, value: string) => {
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    let finalValue: any = value;
    if (name === 'IsFavorite') finalValue = value === '' ? undefined : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));

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

  const MAX_IMAGE_SIZE_MB = 10;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleImageChange = (field: string, file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFieldErrors(prev => ({ ...prev, [field]: 'Formato no permitido. Solo se aceptan: JPG, PNG, WebP.' }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFieldErrors(prev => ({ ...prev, [field]: `La imagen no debe superar ${MAX_IMAGE_SIZE_MB}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB.` }));
      return;
    }
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

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

    setFieldErrors(prev => ({ ...prev, [field]: '' }));

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
          setFieldErrors(prev => ({ ...prev, dateError: `La fecha de inicio debe ser igual o posterior a la fecha final anterior (${new Date(previousEndDate).toLocaleString('es-ES')})` }));
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
        setFieldErrors(prev => ({ ...prev, dateError: 'La fecha final debe ser posterior a la fecha de inicio (incluyendo la hora)' }));
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
      setFieldErrors(prev => ({ ...prev, dateError: 'Para agregar múltiples fechas, marca la actividad como recurrente' }));
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

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.Name || formData.Name?.trim().length === 0) {
      errors.Name = 'El campo "Nombre" es obligatorio.';
    } else if (formData.Name?.trim().length < 5) {
      errors.Name = 'El campo "Nombre" debe tener al menos 5 caracteres.';
    }

    if (!formData.Description || formData.Description?.trim().length === 0) {
      errors.Description = 'El campo "Descripción" es obligatorio.';
    } else if (formData.Description?.trim().length < 20) {
      errors.Description = 'El campo "Descripción" debe tener al menos 20 caracteres.';
    }

    if (!formData.Aim || formData.Aim?.trim().length === 0) {
      errors.Aim = 'El campo "Objetivo" es obligatorio.';
    } else if (formData.Aim?.trim().length < 15) {
      errors.Aim = 'El campo "Objetivo" debe tener al menos 15 caracteres.';
    }

    if (!formData.Location || formData.Location?.trim().length === 0) {
      errors.Location = 'El campo "Ubicación" es obligatorio.';
    } else if (formData.Location?.trim().length < 10) {
      errors.Location = 'El campo "Ubicación" debe tener al menos 10 caracteres.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.Conditions || formData.Conditions?.trim().length === 0) {
      errors.Conditions = 'El campo "Condiciones" es obligatorio.';
    } else if (formData.Conditions?.trim().length < 15) {
      errors.Conditions = 'El campo "Condiciones" debe tener al menos 15 caracteres.';
    }

    if (!formData.Observations || formData.Observations?.trim().length === 0) {
      errors.Observations = 'El campo "Observaciones" es obligatorio.';
    } else if (formData.Observations?.trim().length < 15) {
      errors.Observations = 'El campo "Observaciones" debe tener al menos 15 caracteres.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.dateActivities || formData.dateActivities.length === 0 || !formData.dateActivities[0]?.Start_date) {
      errors.dateError = 'Por favor ingresa al menos una fecha de inicio';
    } else if (!formData.IsRecurring && (formData.dateActivities?.length || 0) > 1) {
      errors.dateError = 'Las actividades no recurrentes solo pueden tener una fecha';
    } else {
      for (let i = 0; i < formData.dateActivities.length; i++) {
        const date = formData.dateActivities[i];

        if (!date.Start_date) {
          errors.dateError = `Rellena este campo: Fecha de inicio de la fecha ${i + 1}`;
          break;
        }

        if (!date.End_date) {
          errors.dateError = `Rellena este campo: Fecha de fin de la fecha ${i + 1}`;
          break;
        }

        if (date.End_date && date.Start_date) {
          const startDate = new Date(date.Start_date);
          const endDate = new Date(date.End_date);

          if (endDate <= startDate) {
            errors.dateError = `La fecha final de la fecha ${i + 1} debe ser posterior a la fecha de inicio (incluyendo la hora)`;
            break;
          }
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setFieldErrors({});
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setFieldErrors({});
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
    setApiError('');

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

      setApiError(errorMessage);
      setShowConfirmModal(false);
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
          <FileText size={20} />
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Información Básica de la Actividad</h3>
          <p className="edit-activity-form__step-description">
            Actualiza la información fundamental de la actividad
          </p>
        </div>
        <p className="edit-activity-form__required-legend"><span className="edit-activity-form__required">*</span> Campo obligatorio</p>
      </div>

      <div className="edit-activity-form__fields">
        <div>
          <label htmlFor="Name" className="edit-activity-form__label">
            Nombre{' '}
            {hasInitialName && !showNameRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showNameRequired && (
              <span className="edit-activity-form__required">*</span>
            )}
          </label>
          <input
            id="Name"
            name="Name"
            type="text"
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
          {fieldErrors.Name && <span className="edit-activity-form__error-text">{fieldErrors.Name}</span>}
        </div>

        <div>
          <label htmlFor="Description" className="edit-activity-form__label">
            Descripción{' '}
            {hasInitialDescription && !showDescriptionRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showDescriptionRequired && (
              <span className="edit-activity-form__required">*</span>
            )}
          </label>
          <textarea
            id="Description"
            name="Description"
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
          {fieldErrors.Description && <span className="edit-activity-form__error-text">{fieldErrors.Description}</span>}
        </div>

        <div>
          <label htmlFor="Aim" className="edit-activity-form__label">
            Objetivo{' '}
            {hasInitialAim && !showAimRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showAimRequired && (
              <span className="edit-activity-form__required">*</span>
            )}
          </label>
          <textarea
            id="Aim"
            name="Aim"
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
          {fieldErrors.Aim && <span className="edit-activity-form__error-text">{fieldErrors.Aim}</span>}
        </div>

        <div>
          <label htmlFor="Location" className="edit-activity-form__label">
            Ubicación{' '}
            {hasInitialLocation && !showLocationRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showLocationRequired && (
              <span className="edit-activity-form__required">*</span>
            )}
          </label>
          <textarea
            id="Location"
            name="Location"
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
          {fieldErrors.Location && <span className="edit-activity-form__error-text">{fieldErrors.Location}</span>}
        </div>
      </div>

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
          <ClipboardList size={20} />
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Detalles de la Actividad</h3>
          <p className="edit-activity-form__step-description">
            Actualiza las condiciones y observaciones
          </p>
        </div>
        <p className="edit-activity-form__required-legend"><span className="edit-activity-form__required">*</span> Campo obligatorio</p>
      </div>

      <div className="edit-activity-form__fields">
        <div>
          <label htmlFor="Conditions" className="edit-activity-form__label">
            Condiciones{' '}
            {hasInitialConditions && !showConditionsRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showConditionsRequired && (
              <span className="edit-activity-form__required">*</span>
            )}
          </label>
          <textarea
            id="Conditions"
            name="Conditions"
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
          {fieldErrors.Conditions && <span className="edit-activity-form__error-text">{fieldErrors.Conditions}</span>}
        </div>

        <div>
          <label htmlFor="Observations" className="edit-activity-form__label">
            Observaciones{' '}
            {hasInitialObservations && !showObservationsRequired && (
              <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            )}
            {showObservationsRequired && (
              <span className="edit-activity-form__required">*</span>
            )}
          </label>
          <textarea
            id="Observations"
            name="Observations"
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
          {fieldErrors.Observations && <span className="edit-activity-form__error-text">{fieldErrors.Observations}</span>}
        </div>

        <div className="edit-activity-form__row">
          <ActivityFormDropdown
            label="Tipo de Actividad"
            value={formData.Type_activity || ''}
            onChange={(v) => handleSelectChange('Type_activity', v)}
            options={TYPE_ACTIVITY_OPTIONS}
            showInitialEditable
          />
          <ActivityFormDropdown
            label="Enfoque"
            value={formData.Approach || ''}
            onChange={(v) => handleSelectChange('Approach', v)}
            options={APPROACH_OPTIONS}
            showInitialEditable
          />
        </div>
      </div>

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
          <Settings size={20} />
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Configuración Final</h3>
          <p className="edit-activity-form__step-description">
            Configura los detalles finales de la actividad
          </p>
        </div>
        <p className="edit-activity-form__required-legend"><span className="edit-activity-form__required">*</span> Campo obligatorio</p>
      </div>

      <div className="edit-activity-form__fields">
        <div>
          <ActivityFormDropdown
            label="Proyecto"
            value={String(activity.project?.Id_project || '')}
            onChange={() => {}}
            options={projects.map(p => ({ value: String(p.Id_project), label: p.Name }))}
            showInitialEditable
            disabled
          />
          <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Nota: El proyecto actual es "{activity.project?.Name || 'Sin proyecto'}". Cambiar el proyecto puede afectar las métricas asociadas.
          </p>
        </div>

        <div className="edit-activity-form__row">
          <ActivityFormDropdown
            label="Tipo Favorito"
            value={formData.IsFavorite || ''}
            onChange={(v) => handleSelectChange('IsFavorite', v)}
            options={IS_FAVORITE_OPTIONS}
            optionalLabel="opcional"
          />
          <ActivityFormDropdown
            label="Tipo de Métrica"
            value={formData.Metric_activity || ''}
            onChange={(v) => handleSelectChange('Metric_activity', v)}
            options={METRIC_ACTIVITY_OPTIONS}
            showInitialEditable
          />
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
          {fieldErrors.dateError && <p className="edit-activity-form__error-text">{fieldErrors.dateError}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <label className="edit-activity-form__label" style={{ margin: 0 }}>
              Fechas de la Actividad{' '}
              {formData.dateActivities && formData.dateActivities.length > 0 &&
               formData.dateActivities.some(date => !date.Start_date || !date.End_date) ? (
                <span className="edit-activity-form__required">*</span>
              ) : formData.dateActivities && formData.dateActivities.length > 0 ? (
                <span className="edit-activity-form__initial-editable">valor inicial editable</span>
              ) : (
                <span className="edit-activity-form__required">*</span>
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
          <Image size={20} />
        </div>
        <div>
          <h3 className="edit-activity-form__step-title">Imágenes de la Actividad</h3>
          <p className="edit-activity-form__step-description">
            Actualiza las imágenes de la actividad (máximo 3 imágenes opcionales)
          </p>
        </div>
      </div>

      <p className="edit-activity-form__image-hint">
        Formatos aceptados: JPG, PNG, WebP · Tamaño máximo: 10MB por imagen
      </p>

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
                      handleImageChange(field, file);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              {fieldErrors[field] && (
                <span className="edit-activity-form__error-text">{fieldErrors[field]}</span>
              )}
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
        <p><Info size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /><strong>Nota:</strong> Puedes agregar, reemplazar o eliminar imágenes de forma independiente:</p>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li><strong>Agregar:</strong> Click en un campo vacío para subir una nueva imagen</li>
          <li><strong>Reemplazar:</strong> Click en el ícono de actualizar sobre una imagen existente</li>
<li><strong>Mantener:</strong> Las imágenes sin modificar se conservarán automáticamente</li>
        </ul>
      </div>

      {apiError && (
        <div className="edit-activity-form__error-box">
          <p style={{ whiteSpace: 'pre-line', margin: 0, fontSize: '0.9rem', fontWeight: 500, color: '#1e40af', lineHeight: 1.5 }}>{apiError}</p>
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Formulario de Actividad</h2>
          <button className="btn-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" ref={modalContentRef}>
          {renderStepIndicator()}

          <form onSubmit={handleSubmit} id="edit-activity-form" noValidate>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </form>
        </div>

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