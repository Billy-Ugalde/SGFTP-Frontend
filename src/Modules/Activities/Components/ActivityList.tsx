import React, { useMemo, useState } from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { Activity } from '../Services/ActivityService';
import { getActivityLabels, formatDate } from '../Services/ActivityService';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/ActivityList.css';

interface ActivityListProps {
  activities: Activity[];
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onToggleActive: (activity: Activity) => void;
  onChangeStatus: (activity: Activity) => void;
  onViewEnrollments: (activity: Activity) => void;
  viewMode?: 'cards' | 'table';
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onView,
  onEdit,
  onToggleActive,
  onChangeStatus,
  onViewEnrollments,
  viewMode = 'table',
}) => {
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [statusLoadingStates] = useState<{ [key: number]: boolean }>({});

  const [showToggleModal, setShowToggleModal] = useState(false);
  const [activityToToggle, setActivityToToggle] = useState<Activity | null>(null);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.Registration_date).getTime();
      const dateB = new Date(b.Registration_date).getTime();
      return dateB - dateA;
    });
  }, [activities]);

  const buildConfirmationMessage = (activity: Activity): string => {
    if (activity.Active) {
      return `Se inactivará la actividad "${activity.Name}". No podrá ser visible en la sección informativa del sistema.`;
    } else {
      return `Se activará la actividad "${activity.Name}". Podrá ser visible en la sección informativa del sistema.`;
    }
  };

  const handleToggleActiveClick = (activity: Activity) => {
    setActivityToToggle(activity);
    setShowToggleModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!activityToToggle || !activityToToggle.Id_activity) return;

    setLoadingStates(prev => ({ ...prev, [activityToToggle.Id_activity]: true }));

    try {
      await onToggleActive(activityToToggle);
      setShowToggleModal(false);
      setActivityToToggle(null);
    } finally {
      setLoadingStates(prev => ({ ...prev, [activityToToggle.Id_activity]: false }));
    }
  };

  const handleChangeStatus = (activity: Activity) => {
    onChangeStatus(activity);
  };

  const columns = useMemo<ColumnDef<Activity>[]>(() => [
    {
      header: 'Nombre',
      accessorKey: 'Name',
    },
    {
      header: 'Tipo',
      accessorFn: row => getActivityLabels.type[row.Type_activity as keyof typeof getActivityLabels.type],
    },
    {
      header: 'Estado',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <span className={`activities-table__status ${activity.Active ? 'activities-table__status--active' : 'activities-table__status--inactive'}`}>
            {activity.Active ? '✓ Activo' : '✕ Inactivo'}
          </span>
        );
      },
    },
    {
      header: 'Estado Actividad',
      cell: ({ row }) => {
        const activity = row.original;
        const statusLabel = getActivityLabels.status[activity.Status_activity as keyof typeof getActivityLabels.status];
        return (
          <span className={`activities-table__activity-status activities-table__activity-status--${activity.Status_activity}`}>
            {statusLabel}
          </span>
        );
      },
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => {
        const activity = row.original;
        const isLoading = activity.Id_activity ? loadingStates[activity.Id_activity] : false;
        const isStatusLoading = activity.Id_activity ? statusLoadingStates[activity.Id_activity] : false;

        const getStatusButtonClass = (status: string) => {
          const baseClass = "activities-table__action-btn activities-table__action-btn--status";
          const statusClass = `activities-table__action-btn--status-${status}`;
          const loadingClass = isStatusLoading ? 'activities-table__action-btn--loading' : '';
          return `${baseClass} ${statusClass} ${loadingClass}`;
        };

        return (
          <div className="activities-table__actions">
            <button
              className="activities-table__action-btn activities-table__action-btn--view"
              onClick={() => onView(activity)}
              disabled={isLoading || isStatusLoading}
              title="Ver detalles"
            >
              <svg className="activities-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>

            <button
              className="activities-table__action-btn activities-table__action-btn--edit"
              onClick={() => onEdit(activity)}
              disabled={isLoading || isStatusLoading}
              title="Editar"
            >
              <svg className="activities-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar
            </button>

            <button
              className={getStatusButtonClass(activity.Status_activity)}
              onClick={() => handleChangeStatus(activity)}
              disabled={isLoading || isStatusLoading}
              title="Cambiar estado"
            >
              <svg className="activities-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isStatusLoading ? 'Cambiando...' : 'Estado'}
            </button>

            <button
              className={`activities-table__action-btn activities-table__action-btn--toggle ${isLoading ? 'activities-table__action-btn--loading' : ''} ${activity.Active ? 'activities-table__action-btn--toggle-active' : 'activities-table__action-btn--toggle-inactive'}`}
              onClick={() => handleToggleActiveClick(activity)}
              disabled={isLoading || isStatusLoading}
              title={activity.Active ? 'Inactivar actividad' : 'Activar actividad'}
            >
              <svg className="activities-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <button
              className="activities-table__action-btn activities-table__action-btn--enrollments"
              onClick={() => onViewEnrollments(activity)}
              disabled={isLoading || isStatusLoading}
              title="Ver inscripciones"
              aria-label="Ver inscripciones"
            >
              <svg className="activities-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Inscripciones
            </button>
          </div>
        );
      },
    },
  ], [onView, onEdit, onViewEnrollments, loadingStates, statusLoadingStates]);

  const table = useReactTable({ data: sortedActivities, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <>
      {viewMode === 'cards' ? (
        /* ── Vista Cards ── */
        <div className="activities-cards__grid">
          {sortedActivities.map(activity => {
            const isLoading = activity.Id_activity ? loadingStates[activity.Id_activity] : false;
            const statusLabel = getActivityLabels.status[activity.Status_activity as keyof typeof getActivityLabels.status];
            const typeLabel = getActivityLabels.type[activity.Type_activity as keyof typeof getActivityLabels.type];
            const startDate = activity.dateActivities && activity.dateActivities.length > 0
              ? formatDate(activity.dateActivities[0].Start_date)
              : null;

            return (
              <div key={activity.Id_activity} className="activities-card">
                {/* Cabecera */}
                <div className="activities-card__header">
                  <div className="activities-card__title-row">
                    <h3 className="activities-card__name">{activity.Name}</h3>
                    <span className={`activities-card__status ${activity.Active ? 'activities-card__status--active' : 'activities-card__status--inactive'}`}>
                      {activity.Active ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                  </div>
                  <div className="activities-card__badges">
                    <span className="activities-card__type-badge">{typeLabel}</span>
                    <span className={`activities-card__activity-status activities-card__activity-status--${activity.Status_activity}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="activities-card__body">
                  {activity.Location && (
                    <p className="activities-card__meta">
                      <MapPin size={14} />
                      <span className="activities-card__meta-text">{activity.Location}</span>
                    </p>
                  )}
                  {startDate && (
                    <p className="activities-card__meta">
                      <Calendar size={14} />
                      {startDate}
                    </p>
                  )}
                  {activity.Spaces != null && (
                    <p className="activities-card__meta">
                      <Users size={14} />
                      {activity.Spaces} cupos
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="activities-card__actions">
                  <button
                    className="activities-card__view-btn"
                    onClick={() => onView(activity)}
                    disabled={isLoading}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver detalles
                  </button>
                  <div className="activities-card__action-btns">
                    <button
                      className="activities-card__action-btn activities-card__action-btn--edit"
                      onClick={() => onEdit(activity)}
                      disabled={isLoading}
                      title="Editar"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      className="activities-card__action-btn activities-card__action-btn--status"
                      onClick={() => handleChangeStatus(activity)}
                      disabled={isLoading}
                      title="Cambiar estado"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      className={`activities-card__action-btn ${activity.Active ? 'activities-card__action-btn--toggle-active' : 'activities-card__action-btn--toggle-inactive'}`}
                      onClick={() => handleToggleActiveClick(activity)}
                      disabled={isLoading}
                      title={activity.Active ? 'Inactivar' : 'Activar'}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                    <button
                      className="activities-card__action-btn activities-card__action-btn--enrollments"
                      onClick={() => onViewEnrollments(activity)}
                      disabled={isLoading}
                      title="Ver inscripciones"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Vista Tabla ── */
        <table className="activities-table">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmationModal
        show={showToggleModal}
        onClose={() => {
          setShowToggleModal(false);
          setActivityToToggle(null);
        }}
        onConfirm={handleConfirmToggle}
        title={activityToToggle?.Active ? "¿Inactivar actividad?" : "¿Activar actividad?"}
        message={activityToToggle ? buildConfirmationMessage(activityToToggle) : ''}
        confirmText={activityToToggle?.Active ? "Sí, inactivar" : "Sí, activar"}
        cancelText="Cancelar"
        type={activityToToggle?.Active ? "warning" : "info"}
        isLoading={activityToToggle?.Id_activity ? loadingStates[activityToToggle.Id_activity] : false}
      />
    </>
  );
};

export default ActivityList;
