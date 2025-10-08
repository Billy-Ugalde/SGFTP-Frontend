import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { Project, ProjectStatus } from '../Services/ProjectsServices';
import EditProject from './EditProject';
import ChangeStatusModal from './ChangeStatusModal'; 
import '../Styles/ProjectsTable.css';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateProjectStatus } from '../Services/ProjectsServices'; 

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
    const [statusLoadingStates, setStatusLoadingStates] = useState<{ [key: number]: boolean }>({});
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [projectToChangeStatus, setProjectToChangeStatus] = useState<Project | null>(null);
    
    const queryClient = useQueryClient();
    const updateProjectStatus = useUpdateProjectStatus();

    const handleToggleActive = async (project: Project) => {
        if (!project.Id_project) return;
        
        setLoadingStates(prev => ({ ...prev, [project.Id_project!]: true }));
        
        try {
            await onToggleActive(project);
        } finally {
            setLoadingStates(prev => ({ ...prev, [project.Id_project!]: false }));
        }
    };

    // Manejar clic en el botón de cambiar estado
    const handleChangeStatusClick = (project: Project) => {
        setProjectToChangeStatus(project);
        setShowStatusModal(true);
    };

    // Confirmar cambio de estado
    const confirmChangeStatus = async (newStatus: ProjectStatus) => {
        if (!projectToChangeStatus?.Id_project) return;

        setStatusLoadingStates(prev => ({ ...prev, [projectToChangeStatus.Id_project]: true }));
        
        try {
            await updateProjectStatus.mutateAsync({
                id_project: projectToChangeStatus.Id_project,
                status: newStatus
            });
            
            setShowStatusModal(false);
            setProjectToChangeStatus(null);
        } catch (error: any) {
            console.error('Error al cambiar estado del proyecto:', error);
        } finally {
            setStatusLoadingStates(prev => ({ ...prev, [projectToChangeStatus.Id_project]: false }));
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
                const isStatusLoading = project.Id_project ? statusLoadingStates[project.Id_project] : false;

                // Determinar la clase CSS basada en el estado del proyecto
                const getStatusButtonClass = (status: ProjectStatus) => {
                    const baseClass = "status";
                    const statusClass = `status--${status}`;
                    const loadingClass = isStatusLoading ? 'loading' : '';
                    return `${baseClass} ${statusClass} ${loadingClass}`;
                };

                return (
                    <div className="table-actions">
                        {/* Ver Detalles*/}
                        <button
                            className="view"
                            onClick={() => onViewDetails(project)}
                            disabled={isLoading || isStatusLoading}
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
                        <EditProject 
                          project={project}
                          onProjectUpdated={() => {
                            queryClient.invalidateQueries({ queryKey: ['projects'] });
                          }}
                        />

                        {/* Cambiar Estado del Proyecto*/}
                        <button
                            className={getStatusButtonClass(project.Status)}
                            onClick={() => handleChangeStatusClick(project)}
                            disabled={isLoading || isStatusLoading}
                        >
                            <svg
                                className="status-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            {isStatusLoading ? 'Cambiando...' : 'Estado'}
                        </button>

                        {/* Activar/Inactivar */}
                        <button
                            className={`toggle ${isLoading ? 'loading' : ''} ${project.Active ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleActive(project)}
                            disabled={isLoading || isStatusLoading}
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
    ], [onViewDetails, onToggleActive, loadingStates, statusLoadingStates, queryClient]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <>
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

            {/* Modal para cambiar estado */}
            {projectToChangeStatus && (
                <ChangeStatusModal
                    show={showStatusModal}
                    onClose={() => {
                        setShowStatusModal(false);
                        setProjectToChangeStatus(null);
                    }}
                    onConfirm={confirmChangeStatus}
                    currentStatus={projectToChangeStatus.Status}
                    projectName={projectToChangeStatus.Name}
                    isLoading={projectToChangeStatus.Id_project ? statusLoadingStates[projectToChangeStatus.Id_project] : false}
                />
            )}
        </>
    );
};

export default ProjectsTable;