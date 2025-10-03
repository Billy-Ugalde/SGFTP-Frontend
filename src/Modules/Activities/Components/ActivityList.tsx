import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { Activity } from '../Services/ActivityService';
import { getActivityLabels, formatDate } from '../Services/ActivityService';
import '../Styles/ActivityList.css';

interface ActivityListProps {
  activities: Activity[];
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onToggleActive: (activity: Activity) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, onView, onEdit, onToggleActive }) => {
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  const handleToggleActive = async (activity: Activity) => {
    if (!activity.Id_activity) return;
    
    setLoadingStates(prev => ({ ...prev, [activity.Id_activity]: true }));
    
    try {
      await onToggleActive(activity);
    } finally {
      setLoadingStates(prev => ({ ...prev, [activity.Id_activity]: false }));
    }
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
      header: 'Ubicación',
      accessorKey: 'Location',
      cell: ({ row }) => {
        const location = row.original.Location;
        return location.length > 30 ? `${location.substring(0, 30)}...` : location;
      },
    },
    {
      header: 'Fecha',
      cell: ({ row }) => {
        const activity = row.original;
        return activity.dateActivities && activity.dateActivities.length > 0
          ? formatDate(activity.dateActivities[0].Start_date)
          : 'Sin fecha';
      },
    },
    {
      header: 'Estado',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <span
            className={`activities-table__status ${activity.Active
              ? 'activities-table__status--active'
              : 'activities-table__status--inactive'
            }`}
          >
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
        
        return (
          <div className="activities-table__actions">
            <button
              className="activities-table__action-btn activities-table__action-btn--view"
              onClick={() => onView(activity)}
              disabled={isLoading}
            >
              <svg
                className="activities-table__action-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Ver
            </button>

            <button
              className="activities-table__action-btn activities-table__action-btn--edit"
              onClick={() => onEdit(activity)}
              disabled={isLoading}
            >
              <svg
                className="activities-table__action-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Editar
            </button>

            <button
              className={`activities-table__action-btn ${isLoading ? 'activities-table__action-btn--loading' : ''} ${
                activity.Active 
                ? 'activities-table__action-btn--deactivate' 
                : 'activities-table__action-btn--activate'
              }`}
              onClick={() => handleToggleActive(activity)}
              disabled={isLoading}
            >
              {!isLoading && (
                <svg
                  className="activities-table__action-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              )}
              {isLoading ? 'Cambiando...' : (activity.Active ? 'Inactivar' : 'Activar')}
            </button>
          </div>
        );
      },
    },
  ], [onView, onEdit, loadingStates]);

  const table = useReactTable({ data: activities, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div style={{ overflowX: 'auto' }}>
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
    </div>
  );
};

export default ActivityList;