import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityList from '../Components/ActivityList';
import AddActivityButton from '../Components/AddActivityButton';
import AddActivityForm from '../Components/AddActivityForm';
import EditActivityForm from '../Components/EditActivityForm';
import ChangeActivityStatusModal from '../Components/ChangeActivityStatusModal';
import ActivityDetailsModal from '../Components/ActivityDetailsModal';
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useToggleActivityActive,
  useUpdateActivityStatus,
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
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activityToChangeStatus, setActivityToChangeStatus] = useState<Activity | null>(null);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  const { data: activities = [], isLoading: loadingActivities, error } = useActivities();
  const addActivity = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const toggleActivityActive = useToggleActivityActive();
  const updateActivityStatus = useUpdateActivityStatus();

  const filteredActivities = useMemo(() => {
    const filtered = activities.filter((activity) => {
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

    return filtered.sort((a, b) => {
      const dateA = new Date(a.Registration_date).getTime();
      const dateB = new Date(b.Registration_date).getTime();
      return dateB - dateA;
    });
  }, [activities, searchTerm, statusFilter, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredActivities.length,
      active: filteredActivities.filter(activity => activity.Active).length,
      inactive: filteredActivities.filter(activity => !activity.Active).length,
    };
  }, [filteredActivities]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateActivity = async (value: ActivityFormData, images?: File[]) => {
    try {
      const dto = transformFormDataToDto(value);
      await addActivity.mutateAsync({ activityData: dto, images });
      
      setCurrentPage(1);
      
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

  const handleUpdateActivity = (id: number, data: UpdateActivityDto, images?: File[]) => {
    updateMutation.mutate(
      { id, data, images },
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

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
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

  const handleChangeStatusClick = (activity: Activity) => {
    setActivityToChangeStatus(activity);
    setShowStatusModal(true);
  };

  const confirmChangeStatus = async (newStatus: Activity['Status_activity']) => {
    if (!activityToChangeStatus?.Id_activity) return;

    try {
      await updateActivityStatus.mutateAsync({
        id_activity: activityToChangeStatus.Id_activity,
        status: newStatus
      });
      
      setShowStatusModal(false);
      setActivityToChangeStatus(null);
      showMessage('success', 'Estado de la actividad actualizado exitosamente');
    } catch (error: any) {
      showMessage('error', 'Error al cambiar el estado de la actividad');
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

        <div className="activities-list__stats">
          <div className="activities-list__stat-card activities-list__stat-card--total">
            <div className="activities-list__stat-content">
              <div className="activities-list__stat-icon activities-list__stat-icon--total">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p className="activities-list__stat-label activities-list__stat-label--total">Total Actividades</p>
                <p className="activities-list__stat-value activities-list__stat-value--total">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="activities-list__stat-card activities-list__stat-card--active">
            <div className="activities-list__stat-content">
              <div className="activities-list__stat-icon activities-list__stat-icon--active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="activities-list__stat-label activities-list__stat-label--active">Activos</p>
                <p className="activities-list__stat-value activities-list__stat-value--active">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="activities-list__stat-card activities-list__stat-card--inactive">
            <div className="activities-list__stat-content">
              <div className="activities-list__stat-icon activities-list__stat-icon--inactive">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="activities-list__stat-label activities-list__stat-label--inactive">Inactivos</p>
                <p className="activities-list__stat-value activities-list__stat-value--inactive">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="activities-list__pagination-info">
            <p className="activities-list__results-text">
              Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredActivities.length)} de {filteredActivities.length} actividades
            </p>
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
          <>
            <ActivityList
              activities={currentActivities}
              onView={handleViewActivity}
              onEdit={handleEditActivity}
              onToggleActive={handleToggleActive}
              onChangeStatus={handleChangeStatusClick}
            />

            {totalPages > 1 && (
              <div className="activities-list__pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="activities-list__pagination-btn activities-list__pagination-btn--prev"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>

                <div className="activities-list__pagination-numbers">
                  {currentPage > 3 && totalPages > 5 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="activities-list__pagination-number"
                      >
                        1
                      </button>
                      <span className="activities-list__pagination-ellipsis">...</span>
                    </>
                  )}

                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`activities-list__pagination-number ${currentPage === page ? 'activities-list__pagination-number--active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}

                  {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                      <span className="activities-list__pagination-ellipsis">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="activities-list__pagination-number"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="activities-list__pagination-btn activities-list__pagination-btn--next"
                >
                  Siguiente
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
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

      {activityToChangeStatus && (
        <ChangeActivityStatusModal
          show={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setActivityToChangeStatus(null);
          }}
          onConfirm={confirmChangeStatus}
          currentStatus={activityToChangeStatus.Status_activity}
          activityName={activityToChangeStatus.Name}
          isLoading={updateActivityStatus.isPending}
        />
      )}

      <ActivityDetailsModal
        activity={selectedActivity}
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedActivity(null);
        }}
      />

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