import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import EditFairButton from './EditFairButton';
import StandsInfoButton from './StandsInfoButton';
import '../Styles/FairsTable.css';

interface Fair {
  id_fair: number;
  name: string;
  description: string;
  conditions: string;
  location: string;
  typeFair: string;
  stand_capacity: number;
  status: boolean;
  archived: boolean;
  date: string;
}

interface Props {
  data: Fair[];
  onViewDetails: (fair: Fair) => void;
  onToggleStatus: (fair: Fair) => void;
  onToggleArchive: (fair: Fair) => void;
  isUpdatingStatus?: boolean;
  isUpdatingArchived?: boolean;
}

const FairsTable: React.FC<Props> = ({
  data,
  onViewDetails,
  onToggleStatus,
  onToggleArchive,
  isUpdatingStatus = false,
  isUpdatingArchived = false,
}) => {
  const truncate = (text: string, max = 25) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  const columns = useMemo<ColumnDef<Fair>[]>(() => [
    {
      header: 'Nombre',
      accessorKey: 'name',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return <span title={val.length > 25 ? val : undefined}>{truncate(val)}</span>;
      },
    },
    {
      header: 'Ubicación',
      accessorKey: 'location',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return <span title={val.length > 25 ? val : undefined}>{truncate(val)}</span>;
      },
    },
    {
      header: 'Tipo',
      accessorFn: row => row.typeFair === 'interna' ? 'Interna' : 'Externa',
    },
    {
      header: 'Fecha',
      accessorFn: row => {
        if (!row.date) return 'Sin fecha';
        try {
          const date = new Date(row.date);
          if (isNaN(date.getTime())) return 'Fecha inválida';
          return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
          return 'Fecha inválida';
        }
      },
    },
    {
      header: 'Estado',
      cell: ({ row }) => {
        const fair = row.original;
        return (
          <span className={`fairs-table__status ${fair.status ? 'fairs-table__status--active' : 'fairs-table__status--inactive'}`}>
            {fair.status ? '✓ Activa' : '✕ Inactiva'}
          </span>
        );
      },
    },
    {
      header: 'Capacidad',
      accessorFn: row => `${row.stand_capacity} stands`,
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => {
        const fair = row.original;
        return (
          <div className="table-actions">
            <button
              className="fairs-table__btn fairs-table__btn--view"
              onClick={() => onViewDetails(fair)}
            >
              <svg className="fairs-table__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>

            <EditFairButton fair={fair} />

            <button
              className={`fairs-table__btn fairs-table__btn--toggle ${fair.status ? 'fairs-table__btn--toggle-active' : 'fairs-table__btn--toggle-inactive'}`}
              onClick={() => onToggleStatus(fair)}
              disabled={isUpdatingStatus}
              title={fair.status ? 'Desactivar feria' : 'Activar feria'}
            >
              <svg className="fairs-table__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <button
              className={`fairs-table__btn ${fair.archived ? 'fairs-table__btn--unarchive' : 'fairs-table__btn--archive'}`}
              onClick={() => onToggleArchive(fair)}
              disabled={isUpdatingArchived}
              title={fair.archived ? 'Desarchivar feria' : 'Archivar feria'}
            >
              <svg className="fairs-table__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {fair.archived ? 'Desarchivar' : 'Archivar'}
            </button>

            <StandsInfoButton fair={fair} />
          </div>
        );
      },
    },
  ], [onViewDetails, onToggleStatus, onToggleArchive, isUpdatingStatus, isUpdatingArchived]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="fairs-table-wrap">
      <table className="fairs-table">
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

export default FairsTable;
