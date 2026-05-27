import { useState } from "react";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { useMyPastActivities } from "../Services/VolunteersServices";
import "../Styles/VolunteerActivities.css";

const ITEMS_PER_PAGE = 5;

export default function MyPastActivities() {
  const { data: activities, isLoading, error } = useMyPastActivities();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className="volunteer-activities">
        <div className="volunteer-activities__header">
          <h3 className="volunteer-activities__title">Historial de Actividades</h3>
        </div>
        <div className="volunteer-activities__loading">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volunteer-activities">
        <div className="volunteer-activities__header">
          <h3 className="volunteer-activities__title">Historial de Actividades</h3>
        </div>
        <div className="volunteer-activities__error">
          Error al cargar el historial: {(error as any)?.message || "Error desconocido"}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="volunteer-activities">
        <div className="volunteer-activities__header">
          <h3 className="volunteer-activities__title">Historial de Actividades</h3>
        </div>
        <div className="volunteer-activities__empty">
          <div className="volunteer-activities__empty-icon">
            <History size={48} strokeWidth={1.5} />
          </div>
          <p>Aún no has participado en ninguna actividad</p>
        </div>
      </div>
    );
  }

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      attended: { label: "Asistió", className: "attended" },
      not_attended: { label: "No asistió", className: "not-attended" },
      cancelled: { label: "Cancelado", className: "cancelled" },
      enrolled: { label: "Inscrito", className: "enrolled" },
    };

    const statusInfo = statusMap[status] || { label: status, className: "default" };
    return { ...statusInfo };
  };

  // Paginación
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActivities = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="volunteer-activities">
      <div className="volunteer-activities__header">
        <h3 className="volunteer-activities__title">Historial de Actividades</h3>
        <span className="volunteer-activities__count">{activities.length}</span>
      </div>

      <div className="volunteer-activities__list">
        {paginatedActivities.map((enrollment: any) => {
          const activity = enrollment.activity;
          const lastDate = activity?.dateActivities?.[activity.dateActivities.length - 1];
          const statusInfo = getStatusBadge(enrollment.status);

          return (
            <div key={enrollment.id_enrollment_activity} className="activity-card activity-card--past">
              <div className="activity-card__header">
                <h4 className="activity-card__title">{activity?.Name || "Sin nombre"}</h4>
                <span className={`activity-card__status activity-card__status--${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="activity-card__body">
                {activity?.Description && (
                  <p className="activity-card__description">{activity.Description}</p>
                )}

                {lastDate && (
                  <div className="activity-card__date">
                    <svg className="activity-card__icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
                    </svg>
                    <span>
                      {new Date(lastDate.Start_date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {activity?.Location && (
                  <div className="activity-card__location">
                    <svg className="activity-card__icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{activity.Location}</span>
                  </div>
                )}

                {enrollment.attendance_date && (
                  <div className="activity-card__attendance">
                    <span className="activity-card__label">Fecha de asistencia:</span>
                    <span>
                      {new Date(enrollment.attendance_date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="volunteer-activities__pagination">
          <button
            className="volunteer-activities__page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>
          <span className="volunteer-activities__page-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="volunteer-activities__page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
