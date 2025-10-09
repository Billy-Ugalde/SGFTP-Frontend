import React, { useState } from 'react';
import type { Activity } from '../Services/ActivityService';
import '../Styles/ChangeActivityStatusModal.css';

interface ChangeActivityStatusModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (newStatus: Activity['Status_activity']) => void;
  currentStatus: Activity['Status_activity'];
  activityName: string;
  isLoading?: boolean;
}

const ChangeActivityStatusModal: React.FC<ChangeActivityStatusModalProps> = ({
  show,
  onClose,
  onConfirm,
  currentStatus,
  activityName,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Activity['Status_activity']>(currentStatus);

  const statusLabels = {
    'pending': 'Pendiente',
    'planning': 'Planificación',
    'execution': 'Ejecución',
    'suspended': 'Suspendido',
    'finished': 'Finalizado'
  };

  const statusDescriptions = {
    'pending': 'La actividad está pendiente de revisión y aprobación.',
    'planning': 'La actividad está en fase de planificación y organización.',
    'execution': 'La actividad está en ejecución y desarrollo activo.',
    'suspended': 'La actividad ha sido suspendida temporalmente.',
    'finished': 'La actividad ha sido completada y finalizada.'
  };

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  const getStatusBadgeClass = (status: Activity['Status_activity']) => {
    const classes = {
      'pending': 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--pending',
      'planning': 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--planning',
      'execution': 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--execution',
      'suspended': 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--suspended',
      'finished': 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--finished',
    };
    return classes[status];
  };

  if (!show) return null;

  return (
    <div className="change-activity-status-modal">
      <div className="change-activity-status-modal__content">
        {/* Header */}
        <div className="change-activity-status-modal__header">
          <h2 className="change-activity-status-modal__title">Cambiar estado de la actividad</h2>
        </div>

        {/* Body */}
        <div className="change-activity-status-modal__body">
          <p className="change-activity-status-modal__intro-text">
            Estás a punto de cambiar el estado de la actividad{' '}
            <span className="change-activity-status-modal__activity-name">"{activityName}"</span>.
          </p>
          
          <div className="change-activity-status-modal__current-status">
            <p>
              <strong>Estado actual:</strong>{' '}
              <span className={getStatusBadgeClass(currentStatus)}>
                {statusLabels[currentStatus]}
              </span>
            </p>
          </div>

          <div className="change-activity-status-modal__select-group">
            <label className="change-activity-status-modal__select-label">
              Nuevo estado:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Activity['Status_activity'])}
              className="change-activity-status-modal__select"
            >
              <option value="pending">Pendiente</option>
              <option value="planning">Planificación</option>
              <option value="execution">Ejecución</option>
              <option value="suspended">Suspendido</option>
              <option value="finished">Finalizado</option>
            </select>
            <p className="change-activity-status-modal__description">
              {statusDescriptions[selectedStatus]}
            </p>
          </div>

          {selectedStatus !== currentStatus && (
            <div className="change-activity-status-modal__change-notice">
              <p>
                <strong>Cambio:</strong> {statusLabels[currentStatus]} → {statusLabels[selectedStatus]}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="change-activity-status-modal__footer">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="change-activity-status-modal__button change-activity-status-modal__button--cancel"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || selectedStatus === currentStatus}
            className="change-activity-status-modal__button change-activity-status-modal__button--confirm"
          >
            {isLoading ? (
              <>
                <span className="change-activity-status-modal__loading"></span>
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

export default ChangeActivityStatusModal;