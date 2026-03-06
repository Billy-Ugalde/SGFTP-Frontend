import React, { useMemo } from 'react';
import { flexRender, getCoreRowModel, type ColumnDef, useReactTable } from '@tanstack/react-table';
import { getDonorFullName, humanizeEnum, type Donor } from '../Services/DonorService';
import '../Styles/DonorList.css';

interface DonorListProps {
  donors: Donor[];
  onView: (donor: Donor) => void;
  onEdit: (donor: Donor) => void;
}

const DonorList: React.FC<DonorListProps> = ({ donors, onView, onEdit }) => {
  const sortedDonors = useMemo(() => {
    return [...donors].sort((a, b) => {
      const dateA = new Date(a.Created_at).getTime();
      const dateB = new Date(b.Created_at).getTime();
      return dateB - dateA;
    });
  }, [donors]);

  const columns = useMemo<ColumnDef<Donor>[]>(() => [
    {
      header: 'Nombre',
      accessorFn: (row) => getDonorFullName(row),
    },
    {
      header: 'Tipo de Donación',
      accessorFn: (row) => humanizeEnum(row.Donation_type),
    },
    {
      header: 'Interés',
      accessorFn: (row) => humanizeEnum(row.Interest),
    },
    {
      header: 'Email',
      accessorKey: 'Email',
    },
    {
      header: 'Teléfono',
      accessorKey: 'Phone',
    },
    {
      header: 'Estado',
      cell: ({ row }) => {
        const donor = row.original;
        const readLabel = humanizeEnum(donor.status);

        return (
          <div className="donors-table__status-group">
            <span
              className={`donors-table__status ${donor.archived ? 'donors-table__status--archived' : 'donors-table__status--active'}`}
            >
              {donor.archived ? 'Archivado' : 'Activo'}
            </span>
            <span className={`donors-table__read-status ${donor.status ? `donors-table__read-status--${String(donor.status).toLowerCase()}` : ''}`}>
              {readLabel}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => {
        const donor = row.original;
        return (
          <div className="donors-table__actions">
            <button className="donors-table__action-btn donors-table__action-btn--view" onClick={() => onView(donor)}>
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>

            <button className="donors-table__action-btn donors-table__action-btn--edit" onClick={() => onEdit(donor)}>
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar
            </button>
          </div>
        );
      },
    },
  ], [onEdit, onView]);

  const table = useReactTable({
    data: sortedDonors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="donors-table">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DonorList;

