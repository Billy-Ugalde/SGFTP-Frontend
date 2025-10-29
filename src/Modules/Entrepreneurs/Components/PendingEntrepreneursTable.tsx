import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { Entrepreneur } from '../Types';
import '../Styles/EntrepreneursTable.css';

interface Props {
    data: Entrepreneur[];
    onViewDetails: (e: Entrepreneur) => void;
    onApprove: (e: Entrepreneur) => void;
    onReject: (e: Entrepreneur) => void;
}

const PendingEntrepreneursTable: React.FC<Props> = ({
    data,
    onViewDetails,
    onApprove,
    onReject,
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
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => {
                const e = row.original;
                return (
                    <div className="table-actions">
                        {/* Ver Detalles */}
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

                        {/* Rechazar */}
                        <button
                            className="pending-entrepreneurs__reject-btn"
                            onClick={() => onReject(e)}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rechazar
                        </button>

                        {/* Aprobar */}
                        <button
                            className="pending-entrepreneurs__approve-btn"
                            onClick={() => onApprove(e)}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Aprobar
                        </button>
                    </div>
                );
            },
        },
    ], [onViewDetails, onApprove, onReject]);

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

export default PendingEntrepreneursTable;
