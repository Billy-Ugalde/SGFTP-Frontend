import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { CreateActivityDto } from '../Services/ActivityService';
import '../Styles/AddActivityForm.css';

interface AddActivityFormProps {
  onSubmit: (data: CreateActivityDto, image?: File) => void;
  onCancel: () => void;
  projects: Array<{ Id_project: number; Name: string }>;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ onSubmit, onCancel, projects }) => {
  const [formData, setFormData] = useState<CreateActivityDto>({
    Name: '',
    Description: '',
    Conditions: '',
    Observations: '',
    IsRecurring: false,
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

  useEffect(() => {
    if (projects.length > 0 && formData.Id_project === 0) {
      setFormData(prev => ({
        ...prev,
        Id_project: projects[0].Id_project
      }));
    }
  }, [projects]);

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
    const updatedDates = [...formData.dates];
    updatedDates[index] = { ...updatedDates[index], [field]: value };
    setFormData({ ...formData, dates: updatedDates });
  };

  const addDate = () => {
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
  
  console.log('=== SUBMIT FORM ===');
  console.log('FormData:', formData);
  console.log('ImageFile:', imageFile);
  
  if (!formData.Id_project || formData.Id_project === 0) {
    console.error('Error: Proyecto no seleccionado');
    alert('Por favor selecciona un proyecto válido');
    return;
  }

  if (formData.dates.length === 0 || !formData.dates[0].Start_date) {
    console.error('Error: Sin fechas');
    alert('Por favor ingresa al menos una fecha de inicio');
    return;
  }
  
  console.log('Validaciones OK, llamando onSubmit...');
  onSubmit(formData, imageFile);
};

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
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group-full" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label className="form-label">Fechas de la Actividad</label>
              <button type="button" className="btn-primary" onClick={addDate} style={{ padding: '8px 16px' }}>
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