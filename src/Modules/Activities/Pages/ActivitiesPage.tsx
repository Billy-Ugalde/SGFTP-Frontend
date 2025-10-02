import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityList from "../Components/ActivityList";
import AddActivityButton from "../Components/AddActivityButton";
import AddActivityForm from "../Components/AddActivityForm";
import EditActivityForm from "../Components/EditActivityForm";
import ConfirmationModal from "../Components/ConfirmationModal";
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  type Activity,
  type CreateActivityDto,
  type UpdateActivityDto,
} from "../Services/ActivityService";
import "../Styles/ActivitiesPage.css";
import "../Styles/AddActivityButton.css";
import "../Styles/AddActivityForm.css";
import "../Styles/EditActivityButton.css";
import "../Styles/EditActivityForm.css";
import "../Styles/ActivityList.css";
import "../Styles/ConfirmationModal.css";

const ActivitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  const { data: activities = [], isLoading, error } = useActivities();
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();

  const mockProjects = [
    { Id_project: 1, Name: "Proyecto Verde" },
    { Id_project: 2, Name: "Costa Limpia" },
  ];

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.Description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && activity.Active) ||
      (statusFilter === "inactive" && !activity.Active);

    return matchesSearch && matchesStatus;
  });

const handleCreateActivity = (data: CreateActivityDto, image?: File) => {
  console.log('=== INICIO handleCreateActivity ===');
  console.log('Data recibida:', data);
  console.log('Image recibida:', image);
  
  createMutation.mutate(
    { data, image },
    {
      onSuccess: () => {
        console.log('SUCCESS: Actividad creada');
        setShowAddModal(false);
        alert("Actividad creada exitosamente");
      },
      onError: (error: any) => {
        console.error('ERROR en mutation:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        alert(`Error al crear actividad: ${error.response?.data?.message || error.message}`);
      },
    }
  );
};

  const handleUpdateActivity = (
    id: number,
    data: UpdateActivityDto,
    image?: File
  ) => {
    updateMutation.mutate(
      { id, data, image },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedActivity(null);
          alert("Actividad actualizada exitosamente");
        },
        onError: (error: any) => {
          alert(`Error al actualizar actividad: ${error.message}`);
        },
      }
    );
  };

  const handleViewActivity = (activity: Activity) => {
    // Implementar vista de detalles o navegar a otra página
    console.log("Ver actividad:", activity);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setActivityToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Eliminar actividad:", activityToDelete);
    setShowDeleteModal(false);
    setActivityToDelete(null);
    alert("Funcionalidad de eliminación pendiente");
  };

  // Estadísticas
  const totalActivities = activities.length;
  const activeActivities = activities.filter((a) => a.Active).length;
  const inactiveActivities = totalActivities - activeActivities;

  return (
    <div className="activities-page">
      {/* Header Section */}
      <div className="activities-page__header">
        <div className="activities-page__header-container">
          <div className="activities-page__title-section">
            {/* Fila superior: título y botones */}
            <div className="activities-page__title-row">
              {/* Espaciador izquierdo */}
              <div style={{ flex: 1 }}></div>

              {/* Centro: ícono + título */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div className="activities-page__title-icon">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="activities-page__title">
                  Gestión de Actividades
                </h1>
              </div>

              {/* Botón derecha */}
              <div
                style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
              >
                <button
                  className="newsletter-btn"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  ← Volver al Dashboard
                </button>
              </div>
            </div>

            {/* Emoji */}
            <div className="activities-page__emoji-container">
              <div className="activities-page__emoji">🌱</div>
            </div>

            <p className="activities-page__description">
              Administrar y organizar actividades ambientales para la{" "}
              <span className="activities-page__foundation-name">
                Fundación Tamarindo Park
              </span>
              . Crear, editar y coordinar eventos comunitarios sostenibles que
              promuevan la conservación y la conciencia ambiental.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="activities-page__main">
        {/* Action Bar */}
        <div className="activities-page__action-bar">
          <div className="activities-page__action-content">
            <div className="activities-page__directory-header">
              <h2 className="activities-page__directory-title">
                Directorio de actividades
              </h2>
              <p className="activities-page__directory-description">
                Crear, editar y administrar todas las actividades ambientales de
                la fundación
              </p>
            </div>

            <div className="activities-page__controls">
              {/* Search Bar */}
              <div className="activities-page__search-wrapper">
                <div className="activities-page__search-icon">
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
                  className="activities-page__search-input"
                />
              </div>

              {/* Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="activities-page__filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Solo activo</option>
                <option value="inactive">Solo inactivo</option>
              </select>

              {/* Add Activity Button */}
              <div onClick={() => setShowAddModal(true)}>
                <AddActivityButton onClick={() => setShowAddModal(true)} />
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-container">
          <div className="stat-card stat-card-total">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Total de Actividades</h3>
              <p>{totalActivities}</p>
            </div>
          </div>
          <div className="stat-card stat-card-active">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Actividades Activas</h3>
              <p>{activeActivities}</p>
            </div>
          </div>
          <div className="stat-card stat-card-inactive">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>Actividades Inactivas</h3>
              <p>{inactiveActivities}</p>
            </div>
          </div>
        </div>

        {/* Activities List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Cargando actividades...</p>
          </div>
        ) : error ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}
          >
            <p>Error al cargar actividades: {error.message}</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No se encontraron actividades</p>
          </div>
        ) : (
          <ActivityList
            activities={filteredActivities}
            onView={handleViewActivity}
            onEdit={handleEditActivity}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddActivityForm
          onSubmit={handleCreateActivity}
          onCancel={() => setShowAddModal(false)}
          projects={mockProjects}
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
          projects={mockProjects}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          title="Eliminar Actividad"
          message="¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setActivityToDelete(null);
          }}
        />
      )}

      {/* Footer */}
      <div className="activities-page__footer">
        <div className="activities-page__footer-container">
          <div className="activities-page__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
