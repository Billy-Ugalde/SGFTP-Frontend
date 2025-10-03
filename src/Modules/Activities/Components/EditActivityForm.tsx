import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Activity, UpdateActivityDto } from '../Services/ActivityService';
import axios from 'axios';
import '../Styles/EditActivityForm.css';

interface EditActivityFormProps {
  activity: Activity;
  onSubmit: (id: number, data: UpdateActivityDto, image?: File) => void;
  onCancel: () => void;
}

const EditActivityForm: React.FC<EditActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const [projects, setProjects] = useState<Array<{ Id_project: number; Name: string }>>([]);
  
  const [formData, setFormData] = useState<UpdateActivityDto>({
    Name: activity.Name,
    Description: activity.Description,
    Conditions: activity.Conditions,
    Observations: activity.Observations,
    IsRecurring: activity.IsRecurring,
    OpenForRegistration: activity.OpenForRegistration,
    Type_activity: activity.Type_activity,
    Status_activity: activity.Status_activity,
    Approach: activity.Approach,
    Spaces: activity.Spaces,
    Location: activity.Location,
    Aim: activity.Aim,
    Metric_activity: activity.Metric_activity,
    Metric_value: activity.Metric_value,
    Active: activity.Active,
    dateActivities: activity.dateActivities || []
  });

  const [imageFile, setImageFile] = useState<File | undefined>();

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
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleDateChange = (index: number, field: string, value: string) => {
    const updatedDates = [...(formData.dateActivities || [])];
    updatedDates[index] = { ...updatedDates[index], [field]: value };
    setFormData({ ...formData, dateActivities: updatedDates });
  };

  const addDate = () => {
    if (!formData.IsRecurring) {
      alert('Para agregar múltiples fechas, marca la actividad como recurrente');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.IsRecurring && (formData.dateActivities?.length || 0) > 1) {
      alert('Las actividades no recurrentes solo pueden tener una fecha');
      return;
    }

    const formattedData = {
      ...formData,
      dateActivities: formData.dateActivities?.map(date => ({
        Id_dateActivity: date.Id_dateActivity,
        Start_date: new Date(date.Start_date).toISOString(),
        End_date: date.End_date ? new Date(date.End_date).toISOString() : undefined
      }))
    };
    
    onSubmit(activity.Id_activity, formattedData, imageFile);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Actividad</h2>
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
                <option value="cultutal_event">Evento Cultural</option>
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
              <label className="form-label">Proyecto</label>
              <input
                type="text"
                className="form-input"
                value={activity.project?.Name || 'Sin proyecto'}
                disabled
              />
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

            <div className="form-group form-group-full">
              <label className="form-label">Objetivo</label>
              <textarea
                name="Aim"
                className="form-textarea"
                value={formData.Aim}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label className="form-label">Condiciones</label>
              <textarea
                name="Conditions"
                className="form-textarea"
                value={formData.Conditions}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label className="form-label">Observaciones</label>
              <textarea
                name="Observations"
                className="form-textarea"
                value={formData.Observations}
                onChange={handleChange}
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
              <label className="form-label">Cambiar Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group-full" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label className="form-label">Fechas de la Actividad</label>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={addDate} 
                style={{ padding: '8px 16px' }}
                disabled={!formData.IsRecurring && (formData.dateActivities?.length || 0) >= 1}
              >
                <Plus size={16} />
                Agregar Fecha
              </button>
            </div>

            {(formData.dateActivities || []).map((date, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={date.Start_date ? new Date(date.Start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateChange(index, 'Start_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Fecha Fin</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={date.End_date ? new Date(date.End_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleDateChange(index, 'End_date', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {(formData.dateActivities || []).length > 1 && (
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
              Actualizar Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityForm;