import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { ActivityFormData } from '../Services/ActivityService';
import axios from 'axios';
import '../Styles/AddActivityForm.css';

interface AddActivityFormProps {
  onSubmit: (data: ActivityFormData, image?: File) => void;
  onCancel: () => void;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ onSubmit, onCancel }) => {
  const [projects, setProjects] = useState<Array<{ Id_project: number; Name: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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
    Metric_value: 0,
    Active: true,
    Id_project: 0,
    dates: [{ Start_date: '', End_date: '' }]
  });

  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imageError, setImageError] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/projects');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setImageError('Solo se permiten imágenes (JPG, PNG, WEBP)');
        e.target.value = '';
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setImageError('La imagen no debe superar 5MB');
        e.target.value = '';
        return;
      }
      
      setImageFile(file);
    }
  };

  const handleDateChange = (index: number, field: string, value: string) => {
    const updatedDates = [...formData.dates];
    updatedDates[index] = { ...updatedDates[index], [field]: value };
    setFormData({ ...formData, dates: updatedDates });
  };

  const addDate = () => {
    if (!formData.IsRecurring) {
      alert('Para agregar múltiples fechas, marca la actividad como recurrente');
      return;
    }
    setFormData({
      ...formData,
      dates: [...formData.dates, { Start_date: '', End_date: '' }]
    });
  };

  const removeDate = (index: number) => {
    const updatedDates = formData.dates.filter((_, i) => i !== index);
    setFormData({ ...formData, dates: updatedDates });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Id_project || formData.Id_project === 0) {
      alert('Por favor selecciona un proyecto válido');
      return;
    }

    if (formData.dates.length === 0 || !formData.dates[0].Start_date) {
      alert('Por favor ingresa al menos una fecha de inicio');
      return;
    }

    if (!formData.IsRecurring && formData.dates.length > 1) {
      alert('Las actividades no recurrentes solo pueden tener una fecha');
      return;
    }

    const formattedData: ActivityFormData = {
      ...formData,
      dates: formData.dates.map(date => ({
        Start_date: new Date(date.Start_date).toISOString(),
        End_date: date.End_date ? new Date(date.End_date).toISOString() : undefined
      }))
    };
    
    onSubmit(formattedData, imageFile);
  };

  if (loadingProjects) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <p style={{ textAlign: 'center', padding: '40px' }}>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Crear Nueva Actividad</h2>
          <button className="btn-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                name="Name"
                className="form-input"
                value={formData.Name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label className="form-label">Descripción *</label>
              <textarea
                name="Description"
                className="form-textarea"
                value={formData.Description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Actividad *</label>
              <select
                name="Type_activity"
                className="form-select"
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

            <div className="form-group">
              <label className="form-label">Estado *</label>
              <select
                name="Status_activity"
                className="form-select"
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

            <div className="form-group">
              <label className="form-label">Enfoque *</label>
              <select
                name="Approach"
                className="form-select"
                value={formData.Approach}
                onChange={handleChange}
                required
              >
                <option value="environmental">Ambiental</option>
                <option value="social">Social</option>
                <option value="cultural">Cultural</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo Favorito (Opcional)</label>
              <select
                name="IsFavorite"
                className="form-select"
                value={formData.IsFavorite || ''}
                onChange={handleChange}
              >
                <option value="">Ninguno</option>
                <option value="school">Escuela</option>
                <option value="condominium">Condominio</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Proyecto *</label>
              <select
                name="Id_project"
                className="form-select"
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

            <div className="form-group">
              <label className="form-label">Ubicación *</label>
              <input
                type="text"
                name="Location"
                className="form-input"
                value={formData.Location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Espacios Disponibles</label>
              <input
                type="number"
                name="Spaces"
                className="form-input"
                value={formData.Spaces}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Métrica *</label>
              <select
                name="Metric_activity"
                className="form-select"
                value={formData.Metric_activity}
                onChange={handleChange}
                required
              >
                <option value="attendance">Asistencia</option>
                <option value="trees_planted">Árboles Plantados</option>
                <option value="waste_collected">Residuos Recolectados (kg)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Valor de Métrica</label>
              <input
                type="number"
                name="Metric_value"
                className="form-input"
                value={formData.Metric_value}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group form-group-full">
              <label className="form-label">Objetivo *</label>
              <textarea
                name="Aim"
                className="form-textarea"
                value={formData.Aim}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label className="form-label">Condiciones *</label>
              <textarea
                name="Conditions"
                className="form-textarea"
                value={formData.Conditions}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label className="form-label">Observaciones *</label>
              <textarea
                name="Observations"
                className="form-textarea"
                value={formData.Observations}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  name="IsRecurring"
                  className="form-checkbox"
                  checked={formData.IsRecurring}
                  onChange={handleChange}
                />
                <label>¿Es una actividad recurrente?</label>
              </div>
              {formData.IsRecurring && (
                <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 500 }}>
                  Puedes agregar múltiples fechas
                </p>
              )}
              {!formData.IsRecurring && (
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                  Solo una fecha permitida
                </p>
              )}
            </div>

            <div className="form-group">
              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  name="OpenForRegistration"
                  className="form-checkbox"
                  checked={formData.OpenForRegistration}
                  onChange={handleChange}
                />
                <label>Abierto a inscripción</label>
              </div>
            </div>

            <div className="form-group">
              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  name="Active"
                  className="form-checkbox"
                  checked={formData.Active}
                  onChange={handleChange}
                />
                <label>Activa</label>
              </div>
            </div>

            <div className="form-group form-group-full">
              <label className="form-label">Imagen</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="form-input"
              />
              {imageError && (
                <p style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '4px' }}>
                  {imageError}
                </p>
              )}
              {imageFile && (
                <p style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '4px' }}>
                  ✓ {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="form-group-full" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label className="form-label">Fechas de la Actividad *</label>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={addDate} 
                style={{ padding: '8px 16px' }}
                disabled={!formData.IsRecurring && formData.dates.length >= 1}
              >
                <Plus size={16} />
                Agregar Fecha
              </button>
            </div>
            {formData.dates.map((date, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={date.Start_date}
                    onChange={(e) => handleDateChange(index, 'Start_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Fecha Fin</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={date.End_date || ''}
                    onChange={(e) => handleDateChange(index, 'End_date', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {formData.dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDate(index)}
                      style={{
                        padding: '10px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Crear Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityForm;