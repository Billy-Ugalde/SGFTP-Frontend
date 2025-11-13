// Components/ActivityEnrollmentsModal.tsx
import { useState } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import {
    useActivityEnrollments,
    useUpdateEnrollmentStatus,
    type ActivityEnrollment,
    getEnrollmentStatusLabels,
    getEnrollmentStatusColor
} from '../Services/EnrollmentService';
import '../Styles/ActivityEnrollmentsModal.css';
import ConfirmationModal from './ConfirmationModal';
import { Trash, X, Check, Phone, Undo2 } from 'lucide-react';


interface ActivityEnrollmentsModalProps {
    activityId: number;
    activityName: string;
    activitySpaces?: number;
    activityEnrolledCount?: number;
    show: boolean;
    onClose: () => void;
}

const ActivityEnrollmentsModal = ({
    activityId,
    activityName,
    activitySpaces,
    show,
    onClose
}: ActivityEnrollmentsModalProps) => {
    const [, setSelectedEnrollment] = useState<ActivityEnrollment | null>(null);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [enrollmentToCancel, setEnrollmentToCancel] = useState<ActivityEnrollment | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: enrollments, isLoading, error } = useActivityEnrollments(activityId);
    const updateEnrollmentMutation = useUpdateEnrollmentStatus();

    // Calcular datos paginados CORRECTAMENTE
    const totalPages = Math.ceil((enrollments?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentEnrollments = enrollments?.slice(startIndex, startIndex + itemsPerPage) || [];

    // Función para cambiar página
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };


    // Función para información de cupos disponibles
    const getAvailableSpacesInfo = (): string => {
        if (!enrollments) return 'Cargando...';

        const activeEnrollments = enrollments.filter(e =>
            e.status === 'enrolled' || e.status === 'attended' || e.status === 'not_attended'
        ).length;

        // Verificar si activitySpaces tiene un valor válido (no null, no undefined, y mayor que 0)
        if (activitySpaces !== null && activitySpaces !== undefined && activitySpaces > 0) {
            const available = Math.max(0, activitySpaces - activeEnrollments);
            return `${available} de ${activitySpaces}`;
        }

        // Si no tiene límite
        return 'Sin límite';
    };

    const handleUpdateStatus = (enrollment: ActivityEnrollment, newStatus: ActivityEnrollment['status']) => {
        setSelectedEnrollment(enrollment);

        if (newStatus === 'cancelled') {
            // Mostrar modal de confirmación
            setEnrollmentToCancel(enrollment);
            setShowCancelModal(true);
        } else {
            // Para otros estados, actualizar directamente
            updateEnrollmentMutation.mutate({
                enrollmentId: enrollment.id_enrollment_activity,
                status: {
                    status: newStatus,
                    attendance_date: newStatus === 'attended' ? new Date().toISOString() : undefined
                }
            });
        }
    };

    const handleConfirmCancel = () => {
        if (!enrollmentToCancel) return;

        updateEnrollmentMutation.mutate(
            {
                enrollmentId: enrollmentToCancel.id_enrollment_activity,
                status: {
                    status: 'cancelled',
                    attendance_date: undefined
                }
            },
            {
                onSuccess: () => {
                    setShowCancelModal(false);
                    setEnrollmentToCancel(null);
                }
            }
        );
    };

    const getStatusButtonVariant = (currentStatus: string, targetStatus: string) => {
        if (currentStatus === targetStatus) {
            return 'enrollments-table__status-btn--active';
        }
        return '';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    // Calcular estadísticas
    const totalEnrollments = enrollments?.length || 0;
    const presentCount = enrollments?.filter(e => e.status === 'attended').length || 0;
    const enrolledCount = enrollments?.filter(e => e.status === 'enrolled').length || 0;
    const cancelledCount = enrollments?.filter(e => e.status === 'cancelled').length || 0;
    const absentCount = enrollments?.filter(e => e.status === 'not_attended').length || 0;
    const activeEnrollments = enrolledCount + presentCount + absentCount;

    return (
        <>
            <GenericModal
                show={show}
                onClose={onClose}
                title={`Inscripciones - ${activityName}`}
                size="xl"
                maxHeight
            >
                <div className="activity-enrollments">
                    <div className="activity-enrollments__header">
                        <div className="activity-enrollments__stats">
                            <div className="activity-enrollments__stat">
                                <span className="activity-enrollments__stat-label">Total registros:</span>
                                <span className="activity-enrollments__stat-value">
                                    {totalEnrollments}
                                </span>
                            </div>

                            <div className="activity-enrollments__stat">
                                <span className="activity-enrollments__stat-label">Cupos disponibles:</span>
                                <span className="activity-enrollments__stat-value activity-enrollments__stat-value--available">
                                    {getAvailableSpacesInfo()}
                                </span>
                            </div>

                            <div className="activity-enrollments__stat">
                                <span className="activity-enrollments__stat-label">Inscritos activos:</span>
                                <span className="activity-enrollments__stat-value activity-enrollments__stat-value--enrolled">
                                    {activeEnrollments}
                                </span>
                            </div>

                            <div className="activity-enrollments__stat">
                                <span className="activity-enrollments__stat-label">Presentes:</span>
                                <span className="activity-enrollments__stat-value activity-enrollments__stat-value--attended">
                                    {presentCount}
                                </span>
                            </div>

                            <div className="activity-enrollments__stat">
                                <span className="activity-enrollments__stat-label">Ausentes:</span>
                                <span className="activity-enrollments__stat-value activity-enrollments__stat-value--absent">
                                    {absentCount}
                                </span>
                            </div>

                            <div className="activity-enrollments__stat">
                                <span className="activity-enrollments__stat-label">Cancelados:</span>
                                <span className="activity-enrollments__stat-value activity-enrollments__stat-value--cancelled">
                                    {cancelledCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="activity-enrollments__loading">
                            <div className="activity-enrollments__loading-spinner"></div>
                            <p>Cargando inscripciones...</p>
                        </div>
                    ) : error ? (
                        <div className="activity-enrollments__error">
                            <div className="activity-enrollments__error-icon">⚠️</div>
                            <h3>Error al cargar las inscripciones</h3>
                            <p>{error.message}</p>
                        </div>
                    ) : !enrollments || enrollments.length === 0 ? (
                        <div className="activity-enrollments__empty">
                            <div className="activity-enrollments__empty-icon">👥</div>
                            <h3>No hay inscripciones</h3>
                            <p>No hay voluntarios inscritos en esta actividad.</p>
                        </div>
                    ) : (
                        <div className="activity-enrollments__content">
                            <table className="enrollments-table">
                                <thead>
                                    <tr>
                                        <th>Voluntario</th>
                                        <th>Contacto</th>
                                        <th>Fecha de Inscripción</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEnrollments.map((enrollment) => (
                                        <tr key={enrollment.id_enrollment_activity} className={
                                            enrollment.status === 'cancelled' ? 'enrollments-table__row--cancelled' : ''
                                        }>
                                            <td>
                                                <div className="enrollments-table__volunteer-info">
                                                    <div className="enrollments-table__volunteer-name">
                                                        {enrollment.volunteer.person.first_name} {enrollment.volunteer.person.first_lastname}
                                                    </div>
                                                    <div className="enrollments-table__volunteer-email">
                                                        {enrollment.volunteer.person.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="enrollments-table__contact-info">
                                                    <div className="enrollments-table__phone">
                                                        <Phone /> {(enrollment.volunteer.person.phone_primary)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="enrollments-table__date">
                                                    {formatDateTime(enrollment.enrollment_date)}
                                                </div>
                                                {/* MOSTRAR SOLO CUANDO EL ESTADO ES 'attended' Y HAY FECHA */}
                                                {enrollment.status === 'attended' && enrollment.attendance_date && (
                                                    <div className="enrollments-table__attendance-date">
                                                        Asistió: {formatDate(enrollment.attendance_date)}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`enrollments-table__status ${getEnrollmentStatusColor(enrollment.status)} ${enrollment.status === 'cancelled' ? 'enrollments-table__status--cancelled' : ''
                                                    }`}>
                                                    {getEnrollmentStatusLabels[enrollment.status]}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="enrollments-table__actions">
                                                    {enrollment.status === 'enrolled' && (
                                                        <>
                                                            <button
                                                                className={`enrollments-table__status-btn enrollments-table__status-btn--attended ${getStatusButtonVariant(enrollment.status, 'attended')}`}
                                                                onClick={() => handleUpdateStatus(enrollment, 'attended')}
                                                                disabled={updateEnrollmentMutation.isPending}
                                                                title="Marcar como presente"
                                                            >
                                                                <Check />
                                                            </button>
                                                            <button
                                                                className={`enrollments-table__status-btn enrollments-table__status-btn--absent ${getStatusButtonVariant(enrollment.status, 'not_attended')}`}
                                                                onClick={() => handleUpdateStatus(enrollment, 'not_attended')}
                                                                disabled={updateEnrollmentMutation.isPending}
                                                                title="Marcar como ausente"
                                                            >
                                                                <X />
                                                            </button>
                                                        </>
                                                    )}

                                                    {enrollment.status !== 'cancelled' && (
                                                        <button
                                                            className={`enrollments-table__status-btn enrollments-table__status-btn--cancel ${getStatusButtonVariant(enrollment.status, 'cancelled')}`}
                                                            onClick={() => handleUpdateStatus(enrollment, 'cancelled')}
                                                            disabled={updateEnrollmentMutation.isPending}
                                                            title="Cancelar inscripción"
                                                        >
                                                            <Trash />
                                                        </button>
                                                    )}

                                                    {(enrollment.status === 'attended' || enrollment.status === 'not_attended') && (
                                                        <button
                                                            className={`enrollments-table__status-btn enrollments-table__status-btn--enrolled ${getStatusButtonVariant(enrollment.status, 'enrolled')}`}
                                                            onClick={() => handleUpdateStatus(enrollment, 'enrolled')}
                                                            disabled={updateEnrollmentMutation.isPending}
                                                            title="Revertir a inscrito"
                                                        >
                                                            <Undo2 />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="enrollments-pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="enrollments-pagination__btn enrollments-pagination__btn--prev"
                                    >
                                        ‹ Anterior
                                    </button>

                                    <div className="enrollments-pagination__numbers">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`enrollments-pagination__number ${currentPage === page ? 'enrollments-pagination__number--active' : ''
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="enrollments-pagination__btn enrollments-pagination__btn--next"
                                    >
                                        Siguiente ›
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </GenericModal>

            <ConfirmationModal
                show={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setEnrollmentToCancel(null);
                }}
                onConfirm={handleConfirmCancel}
                title="Confirmar Cancelación"
                message={
                    enrollmentToCancel
                        ? `¿Estás seguro de cancelar la inscripción de ${enrollmentToCancel.volunteer.person.first_name} ${enrollmentToCancel.volunteer.person.first_lastname}? Esta acción liberará el cupo de la actividad.`
                        : ''
                }
                confirmText="Sí, cancelar inscripción"
                cancelText="No, mantener"
                type="danger"
                isLoading={updateEnrollmentMutation.isPending}
            />
        </>
    );
};

export default ActivityEnrollmentsModal;