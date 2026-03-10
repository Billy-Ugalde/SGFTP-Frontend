import React, { useMemo } from 'react';
import { flexRender, getCoreRowModel, type ColumnDef, useReactTable } from '@tanstack/react-table';
import { getDonorFullName, type Donation, DonationTypeLabels, ReadStatusLabels, ReadStatus } from '../Services/DonorService';
import '../Styles/DonorList.css';

interface DonorListProps {
  donors: Donation[];
  onView: (donor: Donation) => void;
  onEdit: (donor: Donation) => void;
  onChangeStatus: (donor: Donation) => void;
  onToggleArchive: (donor: Donation) => void;
  variant?: 'donors' | 'donations';
}

const DonorList: React.FC<DonorListProps> = ({ donors, onView, onEdit, onChangeStatus, onToggleArchive, variant = 'donors' }) => {
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
      header: 'Estado',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <span className={`donors-table__status ${donation.archived ? 'donors-table__status--archived' : 'donors-table__status--active'}`}>
            {donation.archived ? 'Archivado' : 'Activo'}
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
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Detalle
            </button>
            <button className="donors-table__action-btn donors-table__action-btn--edit" onClick={() => onEdit(donation)} title="Editar donación">
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar
            </button>
            <button
              className={`donors-table__action-btn ${donation.archived ? 'donors-table__action-btn--unarchive' : 'donors-table__action-btn--archive'}`}
              onClick={() => onToggleArchive(donation)}
              title={donation.archived ? 'Desarchivar' : 'Archivar'}
            >
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7m16 0L12 11 4 7" />
              </svg>
              {donation.archived ? 'Desarchivar' : 'Archivar'}
            </button>
          </div>
        );
      },
    },
  ], [onView, onEdit, onToggleArchive]);

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
        const isRead = donation.status === ReadStatus.READ;
        return (
          <span className={`donors-table__read-status donors-table__read-status--${isRead ? 'read' : 'unread'}`}>
            {ReadStatusLabels[donation.status]}
          </span>
        );
      },
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => {
        const donation = row.original;
        const isRead = donation.status === ReadStatus.READ;
        return (
          <div className="donors-table__actions">
            <button className="donors-table__action-btn donors-table__action-btn--view" onClick={() => onView(donation)} title="Ver detalles">
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Detalle
            </button>
            <button className="donors-table__action-btn donors-table__action-btn--edit" onClick={() => onEdit(donation)} title="Editar donación">
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar
            </button>
            <button
              className={`donors-table__action-btn ${isRead ? 'donors-table__action-btn--unarchive' : 'donors-table__action-btn--status'}`}
              onClick={() => onChangeStatus(donation)}
              title={isRead ? 'Marcar como no leído' : 'Marcar como leído'}
            >
              <svg className="donors-table__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isRead
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              </svg>
              {isRead ? 'No leído' : 'Leído'}
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
