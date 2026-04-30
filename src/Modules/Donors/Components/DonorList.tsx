import React, { useMemo } from 'react';
import { flexRender, getCoreRowModel, type ColumnDef, useReactTable } from '@tanstack/react-table';
import { Eye, Pencil, RefreshCcw } from 'lucide-react';
import { getDonorFullName, type Donation, DonationTypeLabels, DonationStatusLabels } from '../Services/DonorService';
import '../Styles/DonorList.css';
import { formatPhoneForDisplay } from '../../../shared/utils/phone.utils';

interface DonorListProps {
  donors: Donation[];
  onView: (donor: Donation) => void;
  onEdit: (donor: Donation) => void;
  onChangeStatus: (donor: Donation) => void;
  variant?: 'donors' | 'donations';
}

const DonorList: React.FC<DonorListProps> = ({ donors, onView, onEdit, onChangeStatus, variant = 'donors' }) => {
  const sortedDonors = useMemo(() => {
    return [...donors].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [donors]);

  const donorsColumns = useMemo<ColumnDef<Donation>[]>(() => [
    {
      header: 'Donador',
      accessorFn: (row) => getDonorFullName(row.donor),
    },
    {
      header: 'Email',
      accessorFn: (row) => row.donor.email,
    },
    {
      header: 'Teléfono',
      accessorFn: (row) => formatPhoneForDisplay(row.donor.phone) || '—',
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <div className="donors-table__actions">
            <button className="donors-table__action-btn donors-table__action-btn--view" onClick={() => onView(donation)} title="Ver detalles">
              <Eye size={14} />
              Detalle
            </button>
            <button className="donors-table__action-btn donors-table__action-btn--edit" onClick={() => onEdit(donation)} title="Editar donación">
              <Pencil size={14} />
              Editar
            </button>
          </div>
        );
      },
    },
  ], [onView, onEdit]);

  const donationsColumns = useMemo<ColumnDef<Donation>[]>(() => [
    {
      header: 'Donador',
      accessorFn: (row) => getDonorFullName(row.donor),
    },
    {
      header: 'Tipo de Donación',
      accessorFn: (row) => DonationTypeLabels[row.donationType],
    },
    {
      header: 'Descripción',
      cell: ({ row }) => {
        const details = row.original.donationDetails;
        return (
          <span className="donors-table__description" title={details || ''}>
            {details ? (details.length > 60 ? details.slice(0, 60) + '…' : details) : '—'}
          </span>
        );
      },
    },
    {
      header: 'Estado',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <span className={`donors-table__status donors-table__status--${donation.status as string}`}>
            {DonationStatusLabels[donation.status]}
          </span>
        );
      },
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <div className="donors-table__actions">
            <button className="donors-table__action-btn donors-table__action-btn--view" onClick={() => onView(donation)} title="Ver detalles">
              <Eye size={14} />
              Detalle
            </button>
            <button className="donors-table__action-btn donors-table__action-btn--edit" onClick={() => onEdit(donation)} title="Editar donación">
              <Pencil size={14} />
              Editar
            </button>
            <button
              className={`donors-table__action-btn donors-table__action-btn--status-${donation.status as string}`}
              onClick={() => onChangeStatus(donation)}
              title="Cambiar estado"
            >
              <RefreshCcw size={14} />
              Estado
            </button>
          </div>
        );
      },
    },
  ], [onView, onEdit, onChangeStatus]);

  const columns = variant === 'donations' ? donationsColumns : donorsColumns;

  const table = useReactTable({
    data: sortedDonors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="donors-table-scroll">
    <table className={`donors-table donors-table--${variant}`}>
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
              <td
                key={cell.id}
                data-label={typeof cell.column.columnDef.header === 'string' ? cell.column.columnDef.header : ''}
              >
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

export default DonorList;
