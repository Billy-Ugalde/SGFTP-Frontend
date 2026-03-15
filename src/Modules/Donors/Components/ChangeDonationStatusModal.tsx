import React, { useState } from 'react';
import { DonationStatus, DonationStatusLabels } from '../Services/DonorService';
import '../../Activities/Styles/ChangeActivityStatusModal.css';

interface ChangeDonationStatusModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (newStatus: DonationStatus) => void;
  currentStatus: DonationStatus;
  donationId: number;
  isLoading?: boolean;
}

const ChangeDonationStatusModal: React.FC<ChangeDonationStatusModalProps> = ({
  show,
  onClose,
  onConfirm,
  currentStatus,
  donationId,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<DonationStatus>(currentStatus);

  const statusDescriptions: Record<DonationStatus, string> = {
    [DonationStatus.NUEVO]: 'La donación ha sido registrada y está pendiente de inicio.',
    [DonationStatus.EJECUCION]: 'La donación está siendo procesada o en ejecución.',
    [DonationStatus.FINALIZADO]: 'La donación ha sido completada exitosamente.',
    [DonationStatus.SUSPENDIDO]: 'La donación ha sido suspendida temporalmente.',
  };

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  const getStatusBadgeClass = (status: DonationStatus) => {
    const classes: Record<DonationStatus, string> = {
      [DonationStatus.NUEVO]: 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--pending',
      [DonationStatus.EJECUCION]: 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--execution',
      [DonationStatus.FINALIZADO]: 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--finished',
      [DonationStatus.SUSPENDIDO]: 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--suspended',
    };
    return classes[status];
  };

  if (!show) return null;

  return (
    <div className="change-activity-status-modal">
      <div className="change-activity-status-modal__content">
        {/* Header */}
        <div className="change-activity-status-modal__header">
          <h2 className="change-activity-status-modal__title">Cambiar estado de la donación</h2>
        </div>

        {/* Body */}
        <div className="change-activity-status-modal__body">
          <p className="change-activity-status-modal__intro-text">
            Estás a punto de cambiar el estado de la donación{' '}
            <span className="change-activity-status-modal__activity-name">#{donationId}</span>.
          </p>

          <div className="change-activity-status-modal__current-status">
            <p>
              <strong>Estado actual:</strong>{' '}
              <span className={getStatusBadgeClass(currentStatus)}>
                {DonationStatusLabels[currentStatus]}
              </span>
            </p>
          </div>

          <div className="change-activity-status-modal__select-group">
            <label className="change-activity-status-modal__select-label">
              Nuevo estado:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DonationStatus)}
              className="change-activity-status-modal__select"
            >
              {Object.entries(DonationStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="change-activity-status-modal__description">
              {statusDescriptions[selectedStatus]}
            </p>
          </div>

          {selectedStatus !== currentStatus && (
            <div className="change-activity-status-modal__change-notice">
              <p>
                <strong>Cambio:</strong> {DonationStatusLabels[currentStatus]} → {DonationStatusLabels[selectedStatus]}
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

export default ChangeDonationStatusModal;
