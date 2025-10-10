import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Activity, UpdateActivityDto } from '../Services/ActivityService';
import axios from 'axios';
import '../Styles/EditActivityForm.css';

interface EditActivityFormProps {
  activity: Activity;
  onSubmit: (id: number, data: UpdateActivityDto, images?: File[]) => void;
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

const EditActivityForm: React.FC<EditActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState<Array<{ Id_project: number; Name: string }>>([]);
  const [showSpacesField, setShowSpacesField] = useState(!!activity.Spaces && activity.Spaces > 0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    Metric_value: activity.Metric_value,
    dateActivities: activity.dateActivities || []
  });

  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({
    image_1: null,
    image_2: null,
    image_3: null
  });
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string | null }>({
    image_1: activity.url1 || null,
    image_2: activity.url2 || null,
    image_3: activity.url3 || null
  });
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/projects');
        const projectsData = response.data.map((p: any) => ({
          Id_project: p.Id_project,
          Name: p.Name
        }));
        setProjects(projectsData);
      } catch (error) {
        console.error('Error cargando proyectos:', error);
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
      setImagesToDelete(prev => [...prev, urlKey]);
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

  const handleDateChange = (index: number, field: string, value: string) => {
    const updatedDates = [...(formData.dateActivities || [])];
    
    // Si se está cambiando la fecha de inicio y hay una fecha final
    if (field === 'Start_date' && updatedDates[index].End_date) {
      const startDate = new Date(value);
      const endDate = new Date(updatedDates[index].End_date!);
      
      if (value && startDate >= endDate) {
        updatedDates[index].End_date = '';
      }
    }
    
    if (field === 'End_date' && value && updatedDates[index].Start_date) {
      const startDate = new Date(updatedDates[index].Start_date);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        setError('La fecha final debe ser posterior a la fecha de inicio (incluyendo la hora)');
        return;
      }
    }
    
    updatedDates[index] = { ...updatedDates[index], [field]: value };
    setFormData({ ...formData, dateActivities: updatedDates });
  };

  const addDate = () => {
    if (!formData.IsRecurring) {
      setError('Para agregar múltiples fechas, marca la actividad como recurrente');
      return;
    }
    setFormData({
      ...formData,
      dateActivities: [...(formData.dateActivities || []), { Start_date: '', End_date: '' }]
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
    if (!formData.Name || formData.Name?.trim().length < 5) {
      setError('El nombre de la actividad debe tener al menos 5 caracteres.');
      return false;
    }
    if (!formData.Description || formData.Description?.trim().length < 20) {
      setError('La descripción debe tener al menos 20 caracteres.');
      return false;
    }
    if (!formData.Aim || formData.Aim?.trim().length < 15) {
      setError('El objetivo debe tener al menos 15 caracteres.');
      return false;
    }
    if (!formData.Location || formData.Location?.trim().length < 10) {
      setError('La ubicación debe tener al menos 10 caracteres.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.Conditions || formData.Conditions?.trim().length < 15) {
      setError('Las condiciones deben tener al menos 15 caracteres.');
      return false;
    }
    if (!formData.Observations || formData.Observations?.trim().length < 15) {
      setError('Las observaciones deben tener al menos 15 caracteres.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.dateActivities || formData.dateActivities.length === 0 || !formData.dateActivities[0]?.Start_date) {
      setError('Por favor ingresa al menos una fecha de inicio');
      return false;
    }
    if (!formData.IsRecurring && (formData.dateActivities?.length || 0) > 1) {
      setError('Las actividades no recurrentes solo pueden tener una fecha');
      return false;
    }

    for (let i = 0; i < formData.dateActivities.length; i++) {
      const date = formData.dateActivities[i];
      if (date.End_date && date.Start_date) {
        const startDate = new Date(date.Start_date);
        const endDate = new Date(date.End_date);
        
        if (endDate <= startDate) {
          setError(`La fecha final de la fecha ${i + 1} debe ser posterior a la fecha de inicio (incluyendo la hora)`);
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
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      handleNextStep();
      return;
    }
    
    if (!validateStep3()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const formattedData: UpdateActivityDto = {
        ...formData,
        dateActivities: formData.dateActivities?.map(date => ({
          Id_dateActivity: date.Id_dateActivity,
          Start_date: new Date(date.Start_date).toISOString(),
          End_date: date.End_date ? new Date(date.End_date).toISOString() : undefined
        }))
      };
      
      const validImageFiles = Object.values(imageFiles).filter((file): file is File => file !== null);
      
      const updateData = {
        ...formattedData,
        imagesToDelete: imagesToDelete.length > 0 ? imagesToDelete : undefined
      };
      
      await onSubmit(activity.Id_activity, updateData, validImageFiles.length > 0 ? validImageFiles : undefined);
    } catch (err: any) {
      let errorMessage = 'Error al actualizar la actividad. Por favor intenta de nuevo.';
      
      if (err?.response?.status === 409) {
        errorMessage = 'Ya existe una actividad con el mismo nombre';
      } else if (err?.response?.status === 400) {
        errorMessage = 'Los datos enviados son inválidos';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="edit-activity-form__progress">
      <div className="edit-activity-form__progress-bar">
        <div
          className="edit-activity-form__progress-fill"
          style={{ width: `${(currentStep / 3) * 100}%` }}
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
      </div>
    </div>
  );

  const renderStep1 = () => (
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
            Nombre <span className="edit-activity-form__required">campo obligatorio</span>
          </label>
          <input
            id="Name"
            name="Name"
            type="text"
            required
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
            Descripción <span className="edit-activity-form__required">campo obligatorio</span>
          </label>
          <textarea
            id="Description"
            name="Description"
            required
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
            Objetivo <span className="edit-activity-form__required">campo obligatorio</span>
          </label>
          <textarea
            id="Aim"
            name="Aim"
            required
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
            Ubicación <span className="edit-activity-form__required">campo obligatorio</span>
          </label>
          <textarea
            id="Location"
            name="Location"
            required
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
        <button type="button" onClick={onCancel} className="edit-activity-form__cancel-btn">
          Cancelar
        </button>
        <button type="button" onClick={handleNextStep} className="edit-activity-form__next-btn">
          Siguiente: Detalles
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
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
            Condiciones <span className="edit-activity-form__required">campo obligatorio</span>
          </label>
          <textarea
            id="Conditions"
            name="Conditions"
            required
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
            Observaciones <span className="edit-activity-form__required">campo obligatorio</span>
          </label>
          <textarea
            id="Observations"
            name="Observations"
            required
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
        <button type="button" onClick={handlePrevStep} className="edit-activity-form__back-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        <button type="button" onClick={handleNextStep} className="edit-activity-form__next-btn">
          Siguiente: Configuración
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

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
            Proyecto <span className="edit-activity-form__required">campo obligatorio</span>
          </label>
          <select
            id="Id_project"
            name="Id_project"
            className="edit-activity-form__input edit-activity-form__input--select"
            value={activity.project?.Id_project || 0}
            onChange={(e) => {
              const selectedProjectId = Number(e.target.value);
              console.log('Proyecto seleccionado:', selectedProjectId);
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

          <div>
            <label htmlFor="Metric_value" className="edit-activity-form__label">
              Valor de Métrica <span className="edit-activity-form__initial-editable">valor inicial editable</span>
            </label>
            <input
              id="Metric_value"
              name="Metric_value"
              type="number"
              className="edit-activity-form__input"
              value={formData.Metric_value || 0}
              onChange={handleChange}
              min={activity.Metric_value > 0 ? 1 : 0}
              placeholder="Ingresa el valor de la métrica"
            />
            {activity.Metric_value > 0 && (
              <p className="edit-activity-form__help-text" style={{ color: '#d97706', marginTop: '0.5rem', fontWeight: 500 }}>
                ⚠️ No se permite valor 0 porque ya existe un valor previo ({activity.Metric_value})
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

        <div className="edit-activity-form__section">
          <h4 className="edit-activity-form__section-title">Imágenes de la Actividad</h4>
          <p className="edit-activity-form__section-description">
            Puedes actualizar hasta 3 imágenes que representen la actividad. Las imágenes actuales se mostrarán si existen. <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Estas imágenes son opcionales.</span>
          </p>

          <div className="edit-activity-form__image-uploads">
            {['image_1', 'image_2', 'image_3'].map((field, idx) => {
              const previewUrl = imagePreviews[field];
              
              return (
                <div key={field} className="edit-activity-form__image-upload">
                  <label className="edit-activity-form__image-upload-box">
                    {previewUrl ? (
                      <div className="edit-activity-form__image-preview">
                        <img src={previewUrl} alt={`Preview ${idx + 1}`} />
                        <button
                          type="button"
                          className="edit-activity-form__image-remove"
                          onClick={(e) => {
                            e.preventDefault();
                            handleImageRemove(field);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="edit-activity-form__image-upload-label">
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
                      className="edit-activity-form__image-input"
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
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <label className="edit-activity-form__label" style={{ margin: 0 }}>
              Fechas de la Actividad <span className="edit-activity-form__required">campo obligatorio</span>
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

          {(formData.dateActivities || []).map((date, index) => (
            <div key={index} className="edit-activity-form__date-item">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="edit-activity-form__sublabel">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    className="edit-activity-form__input"
                    value={formatDateForInput(date.Start_date)}
                    onChange={(e) => handleDateChange(index, 'Start_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="edit-activity-form__sublabel">Fecha Fin</label>
                  <input
                    type="datetime-local"
                    className="edit-activity-form__input"
                    value={formatDateForInput(date.End_date)}
                    onChange={(e) => handleDateChange(index, 'End_date', e.target.value)}
                    min={formatDateForInput(date.Start_date) || undefined}
                  />
                  {date.Start_date && (
                    <p className="edit-activity-form__help-text" style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                      La fecha y hora final debe ser posterior a la de inicio
                    </p>
                  )}
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
          ))}
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
        <button type="button" onClick={handlePrevStep} className="edit-activity-form__back-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="edit-activity-form__submit-btn"
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
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Actualizar Actividad
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Actividad</h2>
          <button className="btn-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </form>
      </div>
    </div>
  );
};

export default EditActivityForm;