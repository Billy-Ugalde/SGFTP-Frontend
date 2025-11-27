import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { Volunteer } from '../Types';
import '../Styles/VolunteersTable.css';
import EditVolunteerButton from './EditVolunteerButton';

interface Props {
    data: Volunteer[];
    onViewDetails: (v: Volunteer) => void;
    onEdit: (v: Volunteer) => void;
     onToggleActive: (v: Volunteer) => void;
}

const VolunteersTable: React.FC<Props> = ({
    data,
    onViewDetails,
    onEdit,
    onToggleActive,
}) => {

     const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

    const handleToggleActive = async (volunteer: Volunteer) => {
        if (!volunteer.id_volunteer) return;
        
        setLoadingStates(prev => ({ ...prev, [volunteer.id_volunteer!]: true }));
        
        try {
            await onToggleActive(volunteer);
        } finally {
            setLoadingStates(prev => ({ ...prev, [volunteer.id_volunteer!]: false }));
        }
    };

    const columns = useMemo<ColumnDef<Volunteer>[]>(() => [
        {
            header: 'Nombre',
            accessorFn: row =>
                `${row.person?.first_name ?? ''} ${row.person?.second_name ?? ''} ${row.person?.first_lastname ?? ''} ${row.person?.second_lastname ?? ''}`.trim(),
        },
        {
            header: 'Email',
            accessorFn: row => row.person?.email ?? '',
        },
        {
            header: 'Teléfono',
            accessorFn: row => row.person?.phone_primary ?? 'N/A',
        },
        {
            header: 'Estado',
            cell: ({ row }) => {
                const v = row.original;
                return (
                    <span
                        className={`volunteers-table__status ${v.is_active
                                ? 'volunteers-table__status--active'
                                : 'volunteers-table__status--inactive'
                            }`}
                    >
                        {v.is_active ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                );
            },
        },
        {
            header: 'Fecha de Registro',
            accessorFn: row => row.registration_date
                ? new Date(row.registration_date).toLocaleDateString('es-ES')
                : 'N/A',
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => {
                const v = row.original;
                const isLoading = v.id_volunteer ? loadingStates[v.id_volunteer] : false;
                return (
                    <div className="table-actions">
                        {/* Ver Detalles*/}
                        <button
                            className="view"
                            onClick={() => onViewDetails(v)}
                        >
                            <svg
                                className="view-icon"
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

                        {/* Editar */}
                        <EditVolunteerButton
                            volunteer={v}
                            onClick={() => onEdit(v)}
                        />
                        
                        {/* Activar/Inactivar */}
                        <button
                            className={`toggle ${isLoading ? 'loading' : ''} ${v.is_active ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleActive(v)}
                            disabled={isLoading}
                            title={v.is_active ? 'Inactivar voluntario' : 'Activar voluntario'}
                        >
                            <svg
                                className="toggle-icon"
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
                        </button>
                    </div>
                );
            },
        },
    ], [onViewDetails, onEdit, loadingStates]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="volunteers-table">
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

export default VolunteersTable;
