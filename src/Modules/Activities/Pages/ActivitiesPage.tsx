import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityList from '../Components/ActivityList';
import AddActivityButton from '../Components/AddActivityButton';
import AddActivityForm from '../Components/AddActivityForm';
import EditActivityForm from '../Components/EditActivityForm';
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useToggleActivityActive,
  transformFormDataToDto,
  type Activity,
  type ActivityFormData,
  type UpdateActivityDto,
} from '../Services/ActivityService';
import '../Styles/ActivitiesPage.css';

const ActivitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'planning' | 'execution' | 'suspended' | 'finished'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const navigate = useNavigate();

  const { data: activities = [], isLoading: loadingActivities, error } = useActivities();
  const addActivity = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const toggleActivityActive = useToggleActivityActive();

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.Aim.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || activity.Status_activity === statusFilter;
    const matchesActive = activeFilter === 'all' || 
      (activeFilter === 'active' && activity.Active) ||
      (activeFilter === 'inactive' && !activity.Active);

    return matchesSearch && matchesStatus && matchesActive;
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateActivity = async (value: ActivityFormData, image?: File) => {
    try {
      const dto = transformFormDataToDto(value);
      await addActivity.mutateAsync({ activityData: dto, image });
      setShowAddModal(false);
      showMessage('success', 'Actividad creada exitosamente');
    } catch (error: any) {
      if (error?.response?.status === 409) {
        showMessage('error', 'Ya existe una actividad con el mismo nombre');
      } else if (error?.response?.status === 400) {
        showMessage('error', 'Los datos enviados son inválidos');
      } else {
        showMessage('error', 'Error al crear la actividad');
      }
    }
  };

  const handleUpdateActivity = (id: number, data: UpdateActivityDto, image?: File) => {
    updateMutation.mutate(
      { id, data, image },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedActivity(null);
          showMessage('success', 'Actividad actualizada exitosamente');
        },
        onError: () => {
          showMessage('error', 'Error al actualizar la actividad');
        },
      }
    );
  };

  const handleViewActivity = (_activity: Activity) => {
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowEditModal(true);
  };

  const handleToggleActive = async (activity: Activity) => {
    if (!activity.Id_activity) {
      showMessage('error', 'Error: ID de actividad no disponible');
      return;
    }

    try {
      await toggleActivityActive.mutateAsync({
        id_activity: activity.Id_activity,
        active: !activity.Active
      });
      
      showMessage('success', `Actividad ${!activity.Active ? 'activada' : 'desactivada'} exitosamente`);
    } catch (error: any) {
      showMessage('error', 
        error?.response?.data?.message || 
        `Error al ${!activity.Active ? 'activar' : 'desactivar'} la actividad`
      );
    }
  };

  return (
    <div className="activities-dashboard">
      <div className="activities-dashboard__header">
        <div className="activities-dashboard__header-container">
          <div className="activities-dashboard__title-section">
            <div className="activities-dashboard__title-row">
              <div style={{ flex: 1 }}></div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div className="activities-dashboard__title-icon">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: "40px", height: "40px", background: "#dbeafe", padding: "10px", borderRadius: "16px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="activities-dashboard__title">Gestión de Actividades</h1>
              </div>

              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingLeft: "80px" }}>
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  style={{
                    backgroundColor: "#1e40af",
                    padding: "10px 20px",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ← Volver al Dashboard
                </button>
              </div>
            </div>

            <div className="activities-dashboard__emoji-container">
              <div className="activities-dashboard__emoji">🌱</div>
            </div>

            <p className="activities-dashboard__description">
              Administrar y organizar todas las actividades ambientales. Crear, editar y coordinar eventos comunitarios sostenibles que promuevan la conservación y la conciencia ambiental.
            </p>
          </div>
        </div>
      </div>

      <div className="activities-dashboard__main">
        <div className="activities-dashboard__action-bar">
          <div className="activities-dashboard__action-content">
            <div className="activities-dashboard__directory-header">
              <h2 className="activities-dashboard__directory-title">
                Lista de Actividades
              </h2>
              <p className="activities-dashboard__directory-description">
                Gestiona y supervisa todas las actividades activas y en desarrollo
              </p>
            </div>

            <div className="activities-dashboard__controls">
              <div className="activities-dashboard__controls-row">
                <div className="activities-dashboard__filter">
                  <label className="activities-dashboard__filter-label">Estado de Actividad:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="activities-dashboard__filter-select"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="planning">Planificación</option>
                    <option value="execution">Ejecución</option>
                    <option value="suspended">Suspendido</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>

                <div className="activities-dashboard__filter">
                  <label className="activities-dashboard__filter-label">Estado Activo:</label>
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="activities-dashboard__filter-select"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>

                <div className="activities-dashboard__search-wrapper">
                  <div className="activities-dashboard__search-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar actividades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="activities-dashboard__search-input"
                  />
                </div>

                <AddActivityButton onClick={() => setShowAddModal(true)} />
              </div>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className={`activities-list__message activities-list__message--${actionMessage.type}`}>
            {actionMessage.text}
          </div>
        )}

        {loadingActivities ? (
          <div className="activities-list__loading">
            <div className="activities-list__loading-spinner"></div>
            <p>Cargando actividades...</p>
          </div>
        ) : error ? (
          <div className="activities-list__error">
            <div className="activities-list__error-icon">⚠️</div>
            <h3>Error al cargar las actividades</h3>
            <p>{error.message}</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="activities-list__empty">
            <div className="activities-list__empty-icon">📋</div>
            <h3>No se encontraron actividades</h3>
            <p>No hay actividades que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <ActivityList
            activities={filteredActivities}
            onView={handleViewActivity}
            onEdit={handleEditActivity}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      {showAddModal && (
        <AddActivityForm
          onSubmit={handleCreateActivity}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && selectedActivity && (
        <EditActivityForm
          activity={selectedActivity}
          onSubmit={handleUpdateActivity}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedActivity(null);
          }}
        />
      )}

      <div className="activities-dashboard__footer">
        <div className="activities-dashboard__footer-container">
          <div className="activities-dashboard__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;