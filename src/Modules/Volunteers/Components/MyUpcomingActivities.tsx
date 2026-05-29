import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMyUpcomingActivities, useCancelMyEnrollment } from "../Services/VolunteersServices";
import ConfirmationModal from "../../Shared/components/ConfirmationModal";
import "../Styles/VolunteerActivities.css";

const ITEMS_PER_PAGE = 5;

export default function MyUpcomingActivities() {
  const { data: activities, isLoading, error } = useMyUpcomingActivities();
  const cancelEnrollment = useCancelMyEnrollment();

  // Estado para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    enrollmentId: number | null;
    activityName: string;
  }>({ show: false, enrollmentId: null, activityName: "" });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  const handleCancel = (enrollmentId: number, activityName: string) => {
    setConfirmModal({ show: true, enrollmentId, activityName });
  };

  const handleConfirmCancel = () => {
    if (confirmModal.enrollmentId === null) return;
    cancelEnrollment.mutate(confirmModal.enrollmentId, {
      onSuccess: () => {
        setConfirmModal({ show: false, enrollmentId: null, activityName: "" });
        setCurrentPage(1);
      },
      onError: () => {
        setConfirmModal({ show: false, enrollmentId: null, activityName: "" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="volunteer-activities">
        <div className="volunteer-activities__header">
          <h3 className="volunteer-activities__title">Próximas Actividades</h3>
        </div>
        <div className="volunteer-activities__loading">Cargando actividades...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volunteer-activities">
        <div className="volunteer-activities__header">
          <h3 className="volunteer-activities__title">Próximas Actividades</h3>
        </div>
        <div className="volunteer-activities__error">
          Error al cargar las actividades: {(error as any)?.message || "Error desconocido"}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="volunteer-activities">
        <div className="volunteer-activities__header">
          <h3 className="volunteer-activities__title">Próximas Actividades</h3>
        </div>
        <div className="volunteer-activities__empty">
          <div className="volunteer-activities__empty-icon">
            <CalendarDays size={48} strokeWidth={1.5} />
          </div>
          <p>No tienes actividades próximas programadas</p>
        </div>
      </div>
    );
  }

  // Paginación
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActivities = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <div className="volunteer-activities">
        <div className="volunteer-activities__header">
          <h3 className="volunteer-activities__title">Próximas Actividades</h3>
          <span className="volunteer-activities__count">{activities.length}</span>
        </div>

        <div className="volunteer-activities__list">
          {paginatedActivities.map((enrollment: any) => {
            const activity = enrollment.activity;
            const nextDate = activity?.dateActivities?.[0];

            return (
              <div key={enrollment.id_enrollment_activity} className="activity-card">
                <div className="activity-card__header">
                  <h4 className="activity-card__title">{activity?.Name || "Sin nombre"}</h4>
                  <span className={`activity-card__status activity-card__status--${enrollment.status}`}>
                    {enrollment.status === "enrolled" ? "Inscrito" : enrollment.status}
                  </span>
                </div>

                <div className="activity-card__body">
                  {activity?.Description && (
                    <p className="activity-card__description">{activity.Description}</p>
                  )}

                  {nextDate && (
                    <div className="activity-card__date">
                      <svg className="activity-card__icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                      </svg>
                      <span>
                        {new Date(nextDate.Start_date).toLocaleDateString("es-ES", {
                          weekday: "long",
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
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span>{activity.Location}</span>
                    </div>
                  )}
                </div>

                <div className="activity-card__footer">
                  <button
                    className="activity-card__cancel-btn"
                    onClick={() => handleCancel(enrollment.id_enrollment_activity, activity?.Name)}
                    disabled={cancelEnrollment.isPending}
                  >
                    {cancelEnrollment.isPending ? "Cancelando..." : "Cancelar Inscripción"}
                  </button>
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

      {/* Modal de confirmación */}
      <ConfirmationModal
        show={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, enrollmentId: null, activityName: "" })}
        onConfirm={handleConfirmCancel}
        title="Cancelar inscripción"
        message={`¿Estás seguro que deseas cancelar tu inscripción a "${confirmModal.activityName}"?`}
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        type="warning"
        isLoading={cancelEnrollment.isPending}
      />
    </>
  );
}
