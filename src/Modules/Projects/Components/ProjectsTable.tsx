import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { Project } from '../Services/ProjectsServices';
import EditProject from './EditProject';
import '../Styles/ProjectsTable.css';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
    data: Project[];
    onViewDetails: (project: Project) => void;
    onEdit: (project: Project) => void;
    onToggleActive: (project: Project) => void;
}

const ProjectsTable: React.FC<Props> = ({
    data,
    onViewDetails,
    onEdit,
    onToggleActive,
}) => {
    const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
    const queryClient = useQueryClient();

    const handleToggleActive = async (project: Project) => {
        if (!project.Id_project) return;
        
        setLoadingStates(prev => ({ ...prev, [project.Id_project!]: true }));
        
        try {
            await onToggleActive(project);
        } finally {
            setLoadingStates(prev => ({ ...prev, [project.Id_project!]: false }));
        }
    };

    const columns = useMemo<ColumnDef<Project>[]>(() => [
        {
            header: 'Nombre',
            accessorKey: 'Name',
        },
        {
            header: 'Objetivo',
            accessorFn: row => row.Aim,
            cell: ({ row }) => {
                const aim = row.original.Aim;
                return (
                    <div className="projects-table__aim">
                        {aim.length > 50 ? `${aim.substring(0, 50)}...` : aim}
                    </div>
                );
            },
        },
        {
            header: 'Fecha Inicio',
            accessorFn: row => new Date(row.Start_date).toLocaleDateString('es-ES'),
        },
        {
            header: 'Estado',
            cell: ({ row }) => {
                const project = row.original;
                return (
                    <span
                        className={`projects-table__status ${project.Active
                                ? 'projects-table__status--active'
                                : 'projects-table__status--inactive'
                            }`}
                    >
                        {project.Active ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                );
            },
        },
        {
            header: 'Estado Proyecto',
            cell: ({ row }) => {
                const project = row.original;
                const statusLabels = {
                    'pending': 'Pendiente',
                    'planning': 'Planificación',
                    'execution': 'Ejecución',
                    'suspended': 'Suspendido',
                    'finished': 'Finalizado'
                };
                return (
                    <span className={`projects-table__project-status projects-table__project-status--${project.Status}`}>
                        {statusLabels[project.Status as keyof typeof statusLabels]}
                    </span>
                );
            },
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => {
                const project = row.original;
                const isLoading = project.Id_project ? loadingStates[project.Id_project] : false;
                
                return (
                    <div className="table-actions">
                        {/* Ver Detalles*/}
                        <button
                            className="view"
                            onClick={() => onViewDetails(project)}
                            disabled={isLoading}
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

                        {/* Editar  */}
                        <EditProject 
                          project={project}
                          onProjectUpdated={() => {
                            queryClient.invalidateQueries({ queryKey: ['projects'] });
                          }}
                        />

                        {/* Activar/Inactivar */}
                        <button
                            className={`toggle ${isLoading ? 'loading' : ''} ${project.Active ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleActive(project)}
                            disabled={isLoading}
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
                            {isLoading ? 'Cambiando...' : (project.Active ? 'Inactivar' : 'Activar')}
                        </button>
                    </div>
                );
            },
        },
    ], [onViewDetails, onToggleActive, loadingStates, queryClient]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="projects-table">
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

export default ProjectsTable;