import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { Entrepreneur } from '../Services/EntrepreneursServices';
import '../Styles/EntrepreneursTable.css';
import EditEntrepreneurButton from './EditEntrepreneurButton';

interface Props {
    data: Entrepreneur[];
    onViewDetails: (e: Entrepreneur) => void;
    onEdit: (e: Entrepreneur) => void;
    onToggleActive: (e: Entrepreneur) => void;
}

const ApprovedEntrepreneursTable: React.FC<Props> = ({
    data,
    onViewDetails,
    onEdit,
    onToggleActive,
}) => {
    const columns = useMemo<ColumnDef<Entrepreneur>[]>(() => [
        {
            header: 'Nombre',
            accessorFn: row =>
                `${row.person?.first_name ?? ''} ${row.person?.first_lastname ?? ''}`,
        },
        {
            header: 'Emprendimiento',
            accessorFn: row => row.entrepreneurship?.name ?? '',
        },
        {
            header: 'Email',
            accessorFn: row => row.person?.email ?? '',
        },
        {
            header: 'Estado',
            cell: ({ row }) => {
                const e = row.original;
                return (
                    <span
                        className={`approved-entrepreneurs__card-status ${e.is_active
                                ? 'approved-entrepreneurs__card-status--active'
                                : 'approved-entrepreneurs__card-status--inactive'
                            }`}
                    >
                        {e.is_active ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                );
            },
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => {
                const e = row.original;
                return (
                    <div className="table-actions">
                        {/* Ver Detalles*/}
                        <button
                            className="view"
                            onClick={() => onViewDetails(e)}
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
                        <EditEntrepreneurButton
                            entrepreneur={e}
                            onClick={() => onEdit(e)}
                        />

                        {/* Activar/Inactivar */}
                        <button
                            className={`toggle ${e.is_active ? 'active' : 'inactive'}`}
                            onClick={() => onToggleActive(e)}
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
                            {e.is_active ? 'Inactivar' : 'Activar'}
                        </button>

                    </div>
                );
            },
        },
    ], [onViewDetails, onEdit, onToggleActive]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="entrepreneurs-table">
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

export default ApprovedEntrepreneursTable;
