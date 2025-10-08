import React, { useState } from 'react';
import { ProjectStatus } from '../Services/ProjectsServices';
import '../Styles/ChangeStatusModal.css';

interface ChangeStatusModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (newStatus: ProjectStatus) => void;
  currentStatus: ProjectStatus;
  projectName: string;
  isLoading?: boolean;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  show,
  onClose,
  onConfirm,
  currentStatus,
  projectName,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(currentStatus);

  const statusLabels = {
    'pending': 'Pendiente',
    'planning': 'Planificación',
    'execution': 'Ejecución',
    'suspended': 'Suspendido',
    'finished': 'Finalizado'
  };

  const statusDescriptions = {
    'pending': 'El proyecto está pendiente de revisión y aprobación.',
    'planning': 'El proyecto está en fase de planificación y organización.',
    'execution': 'El proyecto está en ejecución y desarrollo activo.',
    'suspended': 'El proyecto ha sido suspendido temporalmente.',
    'finished': 'El proyecto ha sido completado y finalizado.'
  };

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  const getStatusBadgeClass = (status: ProjectStatus) => {
    const classes = {
      'pending': 'change-status-modal__status-badge change-status-modal__status-badge--pending',
      'planning': 'change-status-modal__status-badge change-status-modal__status-badge--planning',
      'execution': 'change-status-modal__status-badge change-status-modal__status-badge--execution',
      'suspended': 'change-status-modal__status-badge change-status-modal__status-badge--suspended',
      'finished': 'change-status-modal__status-badge change-status-modal__status-badge--finished',
    };
    return classes[status];
  };

  if (!show) return null;

  return (
    <div className="change-status-modal">
      <div className="change-status-modal__content">
        {/* Header */}
        <div className="change-status-modal__header">
          <h2 className="change-status-modal__title">Cambiar estado del proyecto</h2>
        </div>

        {/* Body */}
        <div className="change-status-modal__body">
          <p className="change-status-modal__intro-text">
            Estás a punto de cambiar el estado del proyecto{' '}
            <span className="change-status-modal__project-name">"{projectName}"</span>.
          </p>
          
          <div className="change-status-modal__current-status">
            <p>
              <strong>Estado actual:</strong>{' '}
              <span className={getStatusBadgeClass(currentStatus)}>
                {statusLabels[currentStatus]}
              </span>
            </p>
          </div>

          <div className="change-status-modal__select-group">
            <label className="change-status-modal__select-label">
              Nuevo estado:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
              className="change-status-modal__select"
            >
              <option value="pending">Pendiente</option>
              <option value="planning">Planificación</option>
              <option value="execution">Ejecución</option>
              <option value="suspended">Suspendido</option>
              <option value="finished">Finalizado</option>
            </select>
            <p className="change-status-modal__description">
              {statusDescriptions[selectedStatus]}
            </p>
          </div>

          {selectedStatus !== currentStatus && (
            <div className="change-status-modal__change-notice">
              <p>
                <strong>Cambio:</strong> {statusLabels[currentStatus]} → {statusLabels[selectedStatus]}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="change-status-modal__footer">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="change-status-modal__button change-status-modal__button--cancel"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || selectedStatus === currentStatus}
            className="change-status-modal__button change-status-modal__button--confirm"
          >
            {isLoading ? (
              <>
                <span className="change-status-modal__loading"></span>
                Cambiando...
              </>
            ) : (
              'Cambiar Estado'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStatusModal;